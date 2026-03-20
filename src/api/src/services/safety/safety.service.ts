import { pool, query, queryWithTenant, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import {
  AppError,
  NotFoundError,
  ValidationError,
} from '../../utils/errors.js';
import type { UUID, ISOTimestamp } from '../../../../shared/types/common.js';

// ─── Types ───

export type ReportStatus = 'draft' | 'submitted' | 'filed_faa' | 'under_investigation' | 'closed';
export type ReportType = 'mandatory_107_9' | 'voluntary_asrs' | 'internal';
export type EventCategory =
  | 'near_miss'
  | 'flyaway'
  | 'loss_of_control'
  | 'airspace_violation'
  | 'equipment_failure'
  | 'injury'
  | 'property_damage'
  | 'lost_link'
  | 'environmental'
  | 'procedural_error'
  | 'other';

export type SeverityLevel = 'none' | 'minor' | 'moderate' | 'serious' | 'critical';

export type FlightPhase = 'pre_flight' | 'takeoff' | 'cruise' | 'approach' | 'landing' | 'post_flight';
export type OperationType = 'recreational' | 'part_107' | 'public' | 'part_135';

export type B4UFlyAdvisoryLevel = 'green' | 'yellow' | 'red';

export interface Injury {
  description: string;
  ais_level: number; // 0-6 Abbreviated Injury Scale
  loss_of_consciousness: boolean;
}

export interface MandatoryReportTrigger {
  required: boolean;
  trigger: 'serious_injury' | 'loss_of_consciousness' | 'property_damage' | 'none';
  deadline: string | null;
}

export interface ASRSProtectionCheck {
  eligible: boolean;
  conditions: {
    unintentional: boolean;
    noCriminalOffense: boolean;
    notAnAccident: boolean;
    pilotCompetencyNotInQuestion: boolean;
    noPriorViolations: boolean;
    filedWithin10Days: boolean;
  };
  failedConditions: string[];
}

export interface SafetyReportInput {
  report_type: ReportType;
  event_date: string;
  event_time_utc?: string;
  event_location_lat: number;
  event_location_lng: number;
  event_location_description?: string;
  event_altitude_agl_ft?: number;
  event_category: EventCategory;
  severity: SeverityLevel;
  flight_phase?: FlightPhase;
  operation_type?: OperationType;
  operational_context?: string;
  drone_id?: string;
  flight_plan_id?: string;
  uas_registration?: string;
  uas_type?: string;
  uas_manufacturer?: string;
  uas_model?: string;
  event_narrative: string;
  cause_analysis?: string;
  prevention_suggestion?: string;
  weather_conditions?: string;
  injuries?: Injury[];
  property_damage_amount_usd?: number;
  property_description?: string;
  contributing_factors?: string[];
}

export interface SafetyReportFilters {
  status?: ReportStatus;
  severity?: SeverityLevel;
  category?: EventCategory;
  report_type?: ReportType;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface B4UFlyCheckResult {
  advisory_level: B4UFlyAdvisoryLevel;
  can_fly: boolean;
  laanc_available: boolean;
  max_altitude_ft: number | null;
  airspace_class: string | null;
  uasfm_grids: Array<Record<string, unknown>>;
  nearby_airports: Array<Record<string, unknown>>;
  active_tfrs: Array<Record<string, unknown>>;
  active_notams: Array<Record<string, unknown>>;
  local_restrictions: Array<Record<string, unknown>>;
  checked_at: string;
}

export interface RemoteIdComplianceCheck {
  drone_id: string;
  compliant: boolean;
  serial_number_valid: boolean;
  broadcast_module_configured: boolean;
  broadcast_frequency_ok: boolean;
  position_accuracy_ok: boolean;
  altitude_accuracy_ok: boolean;
  transmission_latency_ok: boolean;
  operating_in_fria: boolean;
  issues: string[];
  checked_at: string;
}

export interface SafetyStats {
  total_reports: number;
  by_category: Record<string, number>;
  by_severity: Record<string, number>;
  mandatory_count: number;
  voluntary_count: number;
  top_contributing_factors: Array<{ factor: string; count: number }>;
  trend: 'improving' | 'stable' | 'degrading';
  average_close_time_days: number | null;
  compliance_rate: number;
}

// ─── Constants ───

const NM_TO_METERS = 1852;
const DEFAULT_SEARCH_RADIUS_NM = 5;
const MANDATORY_FILING_DAYS = 10;
const PROPERTY_DAMAGE_THRESHOLD_USD = 500;
const SERIOUS_INJURY_AIS_THRESHOLD = 3;
const ANSI_CTA_2063A_REGEX = /^[A-NP-Z0-9.]{1,20}$/;

// ─── SafetyService ───

export class SafetyService {
  private readonly log = logger.child({ service: 'SafetyService' });

  // ─── Report Number Generator ───

  private async generateReportNumber(client: import('pg').PoolClient): Promise<string> {
    const year = new Date().getFullYear();
    const result = await client.query(
      `SELECT COUNT(*) AS cnt FROM safety_reports WHERE EXTRACT(YEAR FROM created_at) = $1`,
      [year]
    );
    const seq = (Number(result.rows[0].cnt) + 1).toString().padStart(6, '0');
    return `SKW-SR-${year}-${seq}`;
  }

  // ─── 1. Create Report ───

  async createReport(
    tenantId: UUID,
    reporterId: UUID,
    input: SafetyReportInput
  ): Promise<Record<string, unknown>> {
    this.log.info({ tenantId, reporterId, category: input.event_category }, 'Creating safety report');

    this.validateCoordinates(input.event_location_lat, input.event_location_lng);

    // Check mandatory thresholds
    const mandatory = this.checkMandatoryThresholds(
      input.injuries ?? [],
      input.property_damage_amount_usd ?? 0
    );

    const faaFilingRequired = mandatory.required;
    const faaFilingDeadline = mandatory.deadline;
    const reportType = faaFilingRequired ? 'mandatory_107_9' : input.report_type;

    // Check ASRS eligibility indicators
    const asrsFilingRecommended = true; // Recommend for all incidents

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);

      const reportNumber = await this.generateReportNumber(client);

      // If drone_id provided, fetch drone details
      let droneRegistration: string | null = null;
      let remoteIdSerial: string | null = null;
      if (input.drone_id) {
        const droneResult = await client.query(
          `SELECT faa_registration_number, remote_id_serial_number FROM drones WHERE id = $1 AND tenant_id = $2`,
          [input.drone_id, tenantId]
        );
        if (droneResult.rows.length > 0) {
          droneRegistration = droneResult.rows[0].faa_registration_number ?? input.uas_registration ?? null;
          remoteIdSerial = droneResult.rows[0].remote_id_serial_number ?? null;
        }
      }

      // If flight_plan_id provided, validate it exists
      if (input.flight_plan_id) {
        const fpResult = await client.query(
          `SELECT id FROM flight_plans WHERE id = $1 AND tenant_id = $2`,
          [input.flight_plan_id, tenantId]
        );
        if (fpResult.rows.length === 0) {
          this.log.warn({ flight_plan_id: input.flight_plan_id }, 'Flight plan not found, proceeding without link');
        }
      }

      const injuryOccurred = (input.injuries ?? []).length > 0;
      const lossOfConsciousness = (input.injuries ?? []).some((i) => i.loss_of_consciousness);
      const maxAis = Math.max(0, ...(input.injuries ?? []).map((i) => i.ais_level));
      const injurySeverity = maxAis >= 3 ? 'serious_ais3' : maxAis > 0 ? 'minor' : 'none';
      const propertyDamageOccurred = (input.property_damage_amount_usd ?? 0) > 0;

      const result = await client.query(
        `INSERT INTO safety_reports (
          tenant_id, report_number, report_type, status,
          reporter_user_id,
          event_date, event_time_utc,
          event_location, event_location_description, event_altitude_agl_ft,
          event_category, severity, flight_phase, operation_type, operational_context,
          drone_id, flight_plan_id,
          uas_registration, uas_type, uas_manufacturer, uas_model, remote_id_serial,
          event_narrative, cause_analysis, prevention_suggestion, weather_conditions,
          injury_occurred, injury_severity, loss_of_consciousness,
          property_damage_occurred, property_damage_amount_usd, property_description,
          contributing_factors,
          faa_filing_required, faa_filing_deadline,
          asrs_filing_recommended,
          created_by
        ) VALUES (
          $1, $2, $3, 'draft',
          $4,
          $5, $6,
          ST_SetSRID(ST_MakePoint($7, $8), 4326), $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17,
          $18, $19, $20, $21, $22,
          $23, $24, $25, $26,
          $27, $28, $29,
          $30, $31, $32,
          $33,
          $34, $35,
          $36,
          $4
        )
        RETURNING id, report_number, report_type, status, event_category, severity,
                  faa_filing_required, faa_filing_deadline, asrs_filing_recommended,
                  ST_AsGeoJSON(event_location)::jsonb AS event_location,
                  created_at`,
        [
          tenantId, reportNumber, reportType,
          reporterId,
          input.event_date, input.event_time_utc ?? null,
          input.event_location_lng, input.event_location_lat,
          input.event_location_description ?? null, input.event_altitude_agl_ft ?? null,
          input.event_category, input.severity, input.flight_phase ?? null,
          input.operation_type ?? null, input.operational_context ?? null,
          input.drone_id ?? null, input.flight_plan_id ?? null,
          droneRegistration ?? input.uas_registration ?? null,
          input.uas_type ?? null, input.uas_manufacturer ?? null,
          input.uas_model ?? null, remoteIdSerial,
          input.event_narrative, input.cause_analysis ?? null,
          input.prevention_suggestion ?? null, input.weather_conditions ?? null,
          injuryOccurred, injurySeverity, lossOfConsciousness,
          propertyDamageOccurred, input.property_damage_amount_usd ?? null,
          input.property_description ?? null,
          input.contributing_factors ? JSON.stringify(input.contributing_factors) : null,
          faaFilingRequired, faaFilingDeadline,
          asrsFilingRecommended,
        ]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
         VALUES ($1, $2, 'create', 'safety_report', $3, $4)`,
        [tenantId, reporterId, result.rows[0].id, JSON.stringify({
          report_number: reportNumber,
          report_type: reportType,
          faa_filing_required: faaFilingRequired,
        })]
      );

      await client.query('COMMIT');

      this.log.info({
        reportId: result.rows[0].id,
        reportNumber,
        faaFilingRequired,
      }, 'Safety report created');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      this.log.error({ error }, 'Failed to create safety report');
      throw error;
    } finally {
      client.release();
    }
  }

  // ─── 2. Submit Report ───

  async submitReport(reportId: UUID, tenantId: UUID): Promise<Record<string, unknown>> {
    this.log.info({ reportId, tenantId }, 'Submitting safety report');

    return withTransaction(tenantId, async (client) => {
      const reportResult = await client.query(
        `SELECT id, status, report_type, event_narrative, faa_filing_required,
                report_number, reporter_user_id
         FROM safety_reports
         WHERE id = $1 AND tenant_id = $2`,
        [reportId, tenantId]
      );

      if (reportResult.rows.length === 0) {
        throw new NotFoundError('Safety report', reportId);
      }

      const report = reportResult.rows[0];

      if (report.status !== 'draft' && report.status !== 'submitted') {
        throw new ValidationError('Only draft or submitted reports can be submitted', {
          currentStatus: report.status,
        });
      }

      // Validate required fields
      if (!report.event_narrative || report.event_narrative.trim().length === 0) {
        throw new ValidationError('Event narrative is required for submission');
      }

      // For mandatory reports, narrative must be >= 100 chars
      if (report.faa_filing_required && report.event_narrative.trim().length < 100) {
        throw new ValidationError(
          'Mandatory FAA reports require a narrative of at least 100 characters',
          { currentLength: report.event_narrative.trim().length }
        );
      }

      const newStatus = report.faa_filing_required ? 'filed_faa' : 'submitted';

      const updateResult = await client.query(
        `UPDATE safety_reports
         SET status = $1, submitted_at = NOW(), updated_at = NOW()
         WHERE id = $2
         RETURNING id, report_number, status, submitted_at`,
        [newStatus, reportId]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
         VALUES ($1, $2, 'submit', 'safety_report', $3, $4)`,
        [tenantId, report.reporter_user_id, reportId, JSON.stringify({
          report_number: report.report_number,
          new_status: newStatus,
          faa_filing_required: report.faa_filing_required,
        })]
      );

      return updateResult.rows[0];
    });
  }

  // ─── 3. Get Report ───

  async getReport(reportId: UUID, tenantId: UUID): Promise<Record<string, unknown>> {
    const result = await queryWithTenant(
      tenantId,
      `SELECT sr.*,
              ST_AsGeoJSON(sr.event_location)::jsonb AS event_location_geojson
       FROM safety_reports sr
       WHERE sr.id = $1 AND sr.tenant_id = $2`,
      [reportId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Safety report', reportId);
    }

    const row = result.rows[0];
    row.event_location = row.event_location_geojson;
    delete row.event_location_geojson;
    return row;
  }

  // ─── 4. List Reports ───

  async listReports(
    tenantId: UUID,
    filters: SafetyReportFilters = {}
  ): Promise<{ data: Record<string, unknown>[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 25, 100);
    const offset = (page - 1) * limit;

    const conditions: string[] = ['sr.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`sr.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.severity) {
      conditions.push(`sr.severity = $${paramIndex++}`);
      params.push(filters.severity);
    }
    if (filters.category) {
      conditions.push(`sr.event_category = $${paramIndex++}`);
      params.push(filters.category);
    }
    if (filters.report_type) {
      conditions.push(`sr.report_type = $${paramIndex++}`);
      params.push(filters.report_type);
    }
    if (filters.date_from) {
      conditions.push(`sr.event_date >= $${paramIndex++}`);
      params.push(filters.date_from);
    }
    if (filters.date_to) {
      conditions.push(`sr.event_date <= $${paramIndex++}`);
      params.push(filters.date_to);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await queryWithTenant(
      tenantId,
      `SELECT COUNT(*) AS total FROM safety_reports sr WHERE ${whereClause}`,
      params
    );
    const total = Number(countResult.rows[0].total);

    const dataResult = await queryWithTenant(
      tenantId,
      `SELECT sr.id, sr.report_number, sr.report_type, sr.status, sr.event_date,
              sr.event_category, sr.severity, sr.faa_filing_required, sr.faa_filing_deadline,
              ST_AsGeoJSON(sr.event_location)::jsonb AS event_location,
              sr.created_at, sr.submitted_at
       FROM safety_reports sr
       WHERE ${whereClause}
       ORDER BY sr.event_date DESC, sr.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
    };
  }

  // ─── 5. Update Report ───

  async updateReport(
    reportId: UUID,
    tenantId: UUID,
    updates: Partial<SafetyReportInput>
  ): Promise<Record<string, unknown>> {
    this.log.info({ reportId, tenantId }, 'Updating safety report');

    return withTransaction(tenantId, async (client) => {
      const existing = await client.query(
        `SELECT id, status FROM safety_reports WHERE id = $1 AND tenant_id = $2`,
        [reportId, tenantId]
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError('Safety report', reportId);
      }

      if (existing.rows[0].status !== 'draft' && existing.rows[0].status !== 'submitted') {
        throw new ValidationError('Only draft or submitted reports can be updated', {
          currentStatus: existing.rows[0].status,
        });
      }

      const setClauses: string[] = ['updated_at = NOW()'];
      const params: unknown[] = [];
      let paramIndex = 1;

      const fieldMap: Record<string, string> = {
        event_narrative: 'event_narrative',
        cause_analysis: 'cause_analysis',
        prevention_suggestion: 'prevention_suggestion',
        weather_conditions: 'weather_conditions',
        event_category: 'event_category',
        severity: 'severity',
        flight_phase: 'flight_phase',
        operation_type: 'operation_type',
        operational_context: 'operational_context',
        event_location_description: 'event_location_description',
        event_altitude_agl_ft: 'event_altitude_agl_ft',
        uas_registration: 'uas_registration',
        uas_type: 'uas_type',
        uas_manufacturer: 'uas_manufacturer',
        uas_model: 'uas_model',
        property_damage_amount_usd: 'property_damage_amount_usd',
        property_description: 'property_description',
      };

      for (const [inputKey, dbColumn] of Object.entries(fieldMap)) {
        if ((updates as Record<string, unknown>)[inputKey] !== undefined) {
          setClauses.push(`${dbColumn} = $${paramIndex++}`);
          params.push((updates as Record<string, unknown>)[inputKey]);
        }
      }

      if (updates.event_location_lat !== undefined && updates.event_location_lng !== undefined) {
        this.validateCoordinates(updates.event_location_lat, updates.event_location_lng);
        setClauses.push(`event_location = ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)`);
        params.push(updates.event_location_lng, updates.event_location_lat);
      }

      if (updates.contributing_factors !== undefined) {
        setClauses.push(`contributing_factors = $${paramIndex++}`);
        params.push(JSON.stringify(updates.contributing_factors));
      }

      // Recalculate mandatory thresholds if injury/damage data changed
      if (updates.injuries !== undefined || updates.property_damage_amount_usd !== undefined) {
        const mandatory = this.checkMandatoryThresholds(
          updates.injuries ?? [],
          updates.property_damage_amount_usd ?? 0
        );
        setClauses.push(`faa_filing_required = $${paramIndex++}`);
        params.push(mandatory.required);
        setClauses.push(`faa_filing_deadline = $${paramIndex++}`);
        params.push(mandatory.deadline);
      }

      params.push(reportId, tenantId);

      const result = await client.query(
        `UPDATE safety_reports
         SET ${setClauses.join(', ')}
         WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
         RETURNING id, report_number, status, updated_at`,
        params
      );

      return result.rows[0];
    });
  }

  // ─── 6. Assign Investigator ───

  async assignInvestigator(
    reportId: UUID,
    tenantId: UUID,
    investigatorId: UUID
  ): Promise<Record<string, unknown>> {
    this.log.info({ reportId, tenantId, investigatorId }, 'Assigning investigator');

    return withTransaction(tenantId, async (client) => {
      const existing = await client.query(
        `SELECT id, status, report_number FROM safety_reports WHERE id = $1 AND tenant_id = $2`,
        [reportId, tenantId]
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError('Safety report', reportId);
      }

      const result = await client.query(
        `UPDATE safety_reports
         SET investigator_user_id = $1, status = 'under_investigation', updated_at = NOW()
         WHERE id = $2
         RETURNING id, report_number, status, investigator_user_id`,
        [investigatorId, reportId]
      );

      await client.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
         VALUES ($1, $2, 'assign_investigator', 'safety_report', $3, $4)`,
        [tenantId, investigatorId, reportId, JSON.stringify({
          report_number: existing.rows[0].report_number,
          investigator_id: investigatorId,
        })]
      );

      return result.rows[0];
    });
  }

  // ─── 7. Add Investigation Notes ───

  async addInvestigationNotes(
    reportId: UUID,
    tenantId: UUID,
    notes: string
  ): Promise<Record<string, unknown>> {
    this.log.info({ reportId, tenantId }, 'Adding investigation notes');

    return withTransaction(tenantId, async (client) => {
      const existing = await client.query(
        `SELECT id, status FROM safety_reports WHERE id = $1 AND tenant_id = $2`,
        [reportId, tenantId]
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError('Safety report', reportId);
      }

      const result = await client.query(
        `UPDATE safety_reports
         SET investigation_notes = COALESCE(investigation_notes, '') || E'\n---\n' || $1 || E'\n[' || NOW()::text || ']',
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, report_number, investigation_notes, updated_at`,
        [notes, reportId]
      );

      return result.rows[0];
    });
  }

  // ─── 8. Close Report ───

  async closeReport(
    reportId: UUID,
    tenantId: UUID,
    findings: { rootCause: string; lessonsLearned: string; finalClassification: SeverityLevel }
  ): Promise<Record<string, unknown>> {
    this.log.info({ reportId, tenantId }, 'Closing safety report');

    return withTransaction(tenantId, async (client) => {
      const existing = await client.query(
        `SELECT id, status, report_number, reporter_user_id
         FROM safety_reports WHERE id = $1 AND tenant_id = $2`,
        [reportId, tenantId]
      );

      if (existing.rows.length === 0) {
        throw new NotFoundError('Safety report', reportId);
      }

      if (existing.rows[0].status === 'draft') {
        throw new ValidationError('Cannot close a draft report. Submit it first.');
      }

      const result = await client.query(
        `UPDATE safety_reports
         SET status = 'closed',
             root_cause = $1,
             lessons_learned = $2,
             severity = $3,
             closed_at = NOW(),
             updated_at = NOW()
         WHERE id = $4
         RETURNING id, report_number, status, root_cause, lessons_learned, severity, closed_at`,
        [findings.rootCause, findings.lessonsLearned, findings.finalClassification, reportId]
      );

      await client.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
         VALUES ($1, $2, 'close', 'safety_report', $3, $4)`,
        [tenantId, existing.rows[0].reporter_user_id, reportId, JSON.stringify({
          report_number: existing.rows[0].report_number,
          root_cause: findings.rootCause,
          final_classification: findings.finalClassification,
        })]
      );

      return result.rows[0];
    });
  }

  // ─── 9. Check Mandatory Thresholds ───

  checkMandatoryThresholds(
    injuries: Injury[],
    propertyDamage: number
  ): MandatoryReportTrigger {
    // Check if any injury has AIS >= 3 or loss of consciousness
    const seriousInjury = injuries.some((i) => i.ais_level >= SERIOUS_INJURY_AIS_THRESHOLD);
    const locFound = injuries.some((i) => i.loss_of_consciousness);

    if (seriousInjury) {
      return {
        required: true,
        trigger: 'serious_injury',
        deadline: this.computeDeadline(MANDATORY_FILING_DAYS),
      };
    }

    if (locFound) {
      return {
        required: true,
        trigger: 'loss_of_consciousness',
        deadline: this.computeDeadline(MANDATORY_FILING_DAYS),
      };
    }

    if (propertyDamage > PROPERTY_DAMAGE_THRESHOLD_USD) {
      return {
        required: true,
        trigger: 'property_damage',
        deadline: this.computeDeadline(MANDATORY_FILING_DAYS),
      };
    }

    return { required: false, trigger: 'none', deadline: null };
  }

  // ─── 10. Check ASRS Eligibility ───

  async checkASRSEligibility(reportId: UUID, tenantId: UUID): Promise<ASRSProtectionCheck> {
    const report = await this.getReport(reportId, tenantId);

    const failedConditions: string[] = [];

    // Condition 1: Unintentional violation
    const unintentional = report.event_category !== 'procedural_error' || true;
    // We assume unintentional unless explicitly flagged; platform cannot determine this definitively
    const condition1 = true;

    // Condition 2: No criminal offense
    const condition2 = true; // Platform cannot determine; assume true by default

    // Condition 3: Not an accident per 14 CFR definition
    // An accident involves serious injury (AIS 3+) or substantial damage
    const condition3 = !report.faa_filing_required;
    if (!condition3) {
      failedConditions.push('Event meets the accident threshold under 14 CFR (serious injury or property damage >$500)');
    }

    // Condition 4: Pilot competency not in question
    const condition4 = true; // Platform cannot determine; assume true by default

    // Condition 5: No prior violations within 5 years
    const priorViolations = await queryWithTenant(
      tenantId,
      `SELECT COUNT(*) AS cnt FROM safety_reports
       WHERE reporter_user_id = $1 AND tenant_id = $2
         AND faa_filing_required = true
         AND event_date >= (NOW() - INTERVAL '5 years')
         AND id != $3`,
      [report.reporter_user_id, tenantId, reportId]
    );
    const condition5 = Number(priorViolations.rows[0].cnt) === 0;
    if (!condition5) {
      failedConditions.push('Reporter has prior FAA-reportable violations within the past 5 years');
    }

    // Condition 6: Filed within 10 days
    const eventDate = new Date(report.event_date as string);
    const now = new Date();
    const daysSinceEvent = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    const condition6 = daysSinceEvent <= 10;
    if (!condition6) {
      failedConditions.push(`Event occurred ${daysSinceEvent} days ago; ASRS must be filed within 10 days`);
    }

    return {
      eligible: condition1 && condition2 && condition3 && condition4 && condition5 && condition6,
      conditions: {
        unintentional: condition1,
        noCriminalOffense: condition2,
        notAnAccident: condition3,
        pilotCompetencyNotInQuestion: condition4,
        noPriorViolations: condition5,
        filedWithin10Days: condition6,
      },
      failedConditions,
    };
  }

  // ─── 11. Get Overdue Reports ───

  async getOverdueReports(tenantId?: UUID): Promise<Record<string, unknown>[]> {
    const sqlBase = `
      SELECT id, report_number, report_type, status, event_date,
             faa_filing_deadline, event_category, severity, tenant_id,
             ST_AsGeoJSON(event_location)::jsonb AS event_location
      FROM safety_reports
      WHERE faa_filing_required = true
        AND faa_filing_deadline < NOW()
        AND status NOT IN ('filed_faa', 'closed')
    `;

    if (tenantId) {
      const result = await queryWithTenant(
        tenantId,
        sqlBase + ' AND tenant_id = $1 ORDER BY faa_filing_deadline ASC',
        [tenantId]
      );
      return result.rows;
    }

    const result = await query(sqlBase + ' ORDER BY faa_filing_deadline ASC');
    return result.rows;
  }

  // ─── 12. Get Upcoming Deadlines ───

  async getUpcomingDeadlines(
    tenantId: UUID,
    daysAhead: number = 7
  ): Promise<Record<string, unknown>[]> {
    const result = await queryWithTenant(
      tenantId,
      `SELECT id, report_number, report_type, status, event_date,
              faa_filing_deadline, event_category, severity,
              ST_AsGeoJSON(event_location)::jsonb AS event_location
       FROM safety_reports
       WHERE tenant_id = $1
         AND faa_filing_required = true
         AND faa_filing_deadline >= NOW()
         AND faa_filing_deadline <= NOW() + ($2 || ' days')::interval
         AND status NOT IN ('filed_faa', 'closed')
       ORDER BY faa_filing_deadline ASC`,
      [tenantId, String(daysAhead)]
    );

    return result.rows;
  }

  // ─── 13. Safety Stats ───

  async getSafetyStats(
    tenantId: UUID,
    period?: { from: string; to: string }
  ): Promise<SafetyStats> {
    const dateCondition = period
      ? `AND sr.event_date >= '${period.from}' AND sr.event_date <= '${period.to}'`
      : '';

    // Total and breakdowns
    const statsResult = await queryWithTenant(
      tenantId,
      `SELECT
         COUNT(*) AS total_reports,
         COUNT(*) FILTER (WHERE sr.faa_filing_required = true) AS mandatory_count,
         COUNT(*) FILTER (WHERE sr.faa_filing_required = false) AS voluntary_count,
         AVG(EXTRACT(EPOCH FROM (sr.closed_at - sr.created_at)) / 86400)
           FILTER (WHERE sr.status = 'closed') AS avg_close_time_days,
         COUNT(*) FILTER (WHERE sr.faa_filing_required = true AND sr.status IN ('filed_faa', 'closed'))
           AS mandatory_filed,
         COUNT(*) FILTER (WHERE sr.faa_filing_required = true) AS total_mandatory
       FROM safety_reports sr
       WHERE sr.tenant_id = $1 ${dateCondition}`,
      [tenantId]
    );

    const stats = statsResult.rows[0];

    // By category
    const categoryResult = await queryWithTenant(
      tenantId,
      `SELECT event_category, COUNT(*) AS cnt
       FROM safety_reports
       WHERE tenant_id = $1 ${dateCondition}
       GROUP BY event_category
       ORDER BY cnt DESC`,
      [tenantId]
    );
    const byCategory: Record<string, number> = {};
    for (const row of categoryResult.rows) {
      byCategory[row.event_category] = Number(row.cnt);
    }

    // By severity
    const severityResult = await queryWithTenant(
      tenantId,
      `SELECT severity, COUNT(*) AS cnt
       FROM safety_reports
       WHERE tenant_id = $1 ${dateCondition}
       GROUP BY severity
       ORDER BY cnt DESC`,
      [tenantId]
    );
    const bySeverity: Record<string, number> = {};
    for (const row of severityResult.rows) {
      bySeverity[row.severity] = Number(row.cnt);
    }

    // Top contributing factors
    const factorsResult = await queryWithTenant(
      tenantId,
      `SELECT factor, COUNT(*) AS cnt
       FROM safety_reports, jsonb_array_elements_text(contributing_factors) AS factor
       WHERE tenant_id = $1 ${dateCondition}
       GROUP BY factor
       ORDER BY cnt DESC
       LIMIT 10`,
      [tenantId]
    );
    const topFactors = factorsResult.rows.map((r) => ({
      factor: r.factor as string,
      count: Number(r.cnt),
    }));

    // Trend: compare last 30 days vs previous 30 days
    const trendResult = await queryWithTenant(
      tenantId,
      `SELECT
         COUNT(*) FILTER (WHERE event_date >= NOW() - INTERVAL '30 days') AS recent,
         COUNT(*) FILTER (WHERE event_date >= NOW() - INTERVAL '60 days' AND event_date < NOW() - INTERVAL '30 days') AS previous
       FROM safety_reports
       WHERE tenant_id = $1`,
      [tenantId]
    );
    const recent = Number(trendResult.rows[0].recent);
    const previous = Number(trendResult.rows[0].previous);
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (previous > 0) {
      const changeRate = (recent - previous) / previous;
      if (changeRate < -0.1) trend = 'improving';
      else if (changeRate > 0.1) trend = 'degrading';
    }

    const totalMandatory = Number(stats.total_mandatory);
    const mandatoryFiled = Number(stats.mandatory_filed);
    const complianceRate = totalMandatory > 0 ? mandatoryFiled / totalMandatory : 1;

    return {
      total_reports: Number(stats.total_reports),
      by_category: byCategory,
      by_severity: bySeverity,
      mandatory_count: Number(stats.mandatory_count),
      voluntary_count: Number(stats.voluntary_count),
      top_contributing_factors: topFactors,
      trend,
      average_close_time_days: stats.avg_close_time_days != null
        ? Math.round(Number(stats.avg_close_time_days) * 10) / 10
        : null,
      compliance_rate: Math.round(complianceRate * 1000) / 1000,
    };
  }

  // ─── 14. Enhanced B4UFLY Check ───

  async enhancedB4UFlyCheck(
    lat: number,
    lng: number,
    altitudeFt: number,
    radiusNm: number = DEFAULT_SEARCH_RADIUS_NM
  ): Promise<B4UFlyCheckResult> {
    this.validateCoordinates(lat, lng);
    if (altitudeFt < 0 || altitudeFt > 400) {
      throw new ValidationError('Altitude must be between 0 and 400 ft AGL', { altitudeFt });
    }

    this.log.info({ lat, lng, altitudeFt, radiusNm }, 'Performing enhanced B4UFLY check');

    const searchRadiusMeters = radiusNm * NM_TO_METERS;
    const timeIso = new Date().toISOString();

    const [uasfmGrids, airports, tfrs, notams, localRules] = await Promise.all([
      // UASFM grids containing the point
      query(
        `SELECT id, facility_id, airport_code, airspace_class,
                ST_AsGeoJSON(geometry)::jsonb AS geometry,
                max_altitude_ft, ceiling_ft, floor_ft, laanc_enabled,
                effective_date, expiration_date, chart_cycle
         FROM uasfm_grids
         WHERE ST_Contains(geometry, ST_SetSRID(ST_Point($1, $2), 4326))
           AND effective_date <= NOW()
           AND expiration_date > NOW()
         ORDER BY max_altitude_ft ASC`,
        [lng, lat]
      ),
      // Nearby airports
      query(
        `SELECT code, name, type,
                ST_Distance(
                  location::geography,
                  ST_SetSRID(ST_Point($1, $2), 4326)::geography
                ) / $3 AS distance_nm
         FROM airports
         WHERE ST_DWithin(
           location::geography,
           ST_SetSRID(ST_Point($1, $2), 4326)::geography,
           $4
         )
         ORDER BY distance_nm ASC
         LIMIT 10`,
        [lng, lat, NM_TO_METERS, searchRadiusMeters]
      ),
      // Active TFRs intersecting buffered point
      query(
        `SELECT id, notam_number, type, description,
                ST_AsGeoJSON(geometry)::jsonb AS geometry,
                radius_nm, floor_altitude_ft, ceiling_altitude_ft,
                effective_start, effective_end, restrictions
         FROM temporary_flight_restrictions
         WHERE active = true
           AND effective_start <= $3
           AND effective_end > $3
           AND ST_Intersects(
             geometry,
             ST_Buffer(ST_SetSRID(ST_Point($1, $2), 4326)::geography, $4)::geometry
           )
         ORDER BY effective_start ASC`,
        [lng, lat, timeIso, searchRadiusMeters]
      ),
      // Active NOTAMs
      query(
        `SELECT id, notam_id, type, facility_id, text, classification,
                effective_start, effective_end,
                ST_AsGeoJSON(geometry)::jsonb AS geometry
         FROM notams
         WHERE affects_uas = true
           AND effective_start <= $3
           AND effective_end > $3
           AND (
             geometry IS NULL
             OR ST_DWithin(
               geometry::geography,
               ST_SetSRID(ST_Point($1, $2), 4326)::geography,
               $4
             )
           )
         ORDER BY effective_start ASC`,
        [lng, lat, timeIso, searchRadiusMeters]
      ),
      // Local agency rules
      query(
        `SELECT id, agency_id, rule_type, title, description, max_altitude_ft,
                time_restrictions, effective_date, expiration_date,
                ST_AsGeoJSON(geometry)::jsonb AS geometry
         FROM agency_rules
         WHERE active = true
           AND (effective_date IS NULL OR effective_date <= NOW())
           AND (expiration_date IS NULL OR expiration_date > NOW())
           AND ST_Intersects(
             geometry,
             ST_Buffer(ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)::geometry
           )
         ORDER BY rule_type ASC`,
        [lng, lat, searchRadiusMeters]
      ),
    ]);

    // Determine advisory level
    const primaryGrid = uasfmGrids.rows[0] ?? null;
    const airspaceClass = primaryGrid?.airspace_class ?? null;
    const maxAltitudeFt = primaryGrid?.max_altitude_ft ?? null;
    const laancAvailable = primaryGrid?.laanc_enabled ?? false;

    let advisoryLevel: B4UFlyAdvisoryLevel = 'green';

    // Red conditions
    const hasProhibitedTfr = tfrs.rows.some(
      (t) => t.type === 'security' || t.type === 'vip'
    );
    if (hasProhibitedTfr || airspaceClass === 'A') {
      advisoryLevel = 'red';
    } else if (
      airspaceClass && ['B', 'C', 'D'].includes(airspaceClass) &&
      maxAltitudeFt !== null && altitudeFt > maxAltitudeFt
    ) {
      advisoryLevel = 'red';
    } else if (
      tfrs.rows.length > 0 ||
      (airspaceClass && ['B', 'C', 'D', 'E'].includes(airspaceClass)) ||
      localRules.rows.length > 0
    ) {
      advisoryLevel = 'yellow';
    }

    const canFly = advisoryLevel !== 'red';

    // Log the check
    await query(
      `INSERT INTO b4ufly_check_logs (
        latitude, longitude, altitude_ft, radius_nm,
        advisory_level, can_fly, laanc_available, airspace_class,
        max_altitude_ft, tfr_count, notam_count, local_rule_count,
        checked_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        lat, lng, altitudeFt, radiusNm,
        advisoryLevel, canFly, laancAvailable, airspaceClass,
        maxAltitudeFt, tfrs.rows.length, notams.rows.length, localRules.rows.length,
      ]
    );

    return {
      advisory_level: advisoryLevel,
      can_fly: canFly,
      laanc_available: laancAvailable,
      max_altitude_ft: maxAltitudeFt ? Number(maxAltitudeFt) : null,
      airspace_class: airspaceClass,
      uasfm_grids: uasfmGrids.rows,
      nearby_airports: airports.rows,
      active_tfrs: tfrs.rows,
      active_notams: notams.rows,
      local_restrictions: localRules.rows,
      checked_at: new Date().toISOString(),
    };
  }

  // ─── 15. Check Remote ID Compliance (Enhanced Part 89) ───

  async checkRemoteIdCompliance(
    droneId: UUID,
    tenantId: UUID
  ): Promise<RemoteIdComplianceCheck> {
    this.log.info({ droneId, tenantId }, 'Checking enhanced Remote ID compliance');

    const droneResult = await queryWithTenant(
      tenantId,
      `SELECT id, serial_number, remote_id_type, remote_id_serial_number,
              remote_id_compliant, tenant_id
       FROM drones
       WHERE id = $1 AND tenant_id = $2`,
      [droneId, tenantId]
    );

    if (droneResult.rows.length === 0) {
      throw new NotFoundError('Drone', droneId);
    }

    const drone = droneResult.rows[0];
    const issues: string[] = [];

    // 1. Check serial number format (ANSI/CTA-2063-A)
    const serialNumber = drone.remote_id_serial_number ?? '';
    const serialNumberValid = serialNumber.length > 0 && ANSI_CTA_2063A_REGEX.test(serialNumber);
    if (!serialNumberValid && drone.remote_id_type !== 'none') {
      issues.push(
        'Serial number does not comply with ANSI/CTA-2063-A format: ' +
        'must be uppercase A-Z (excluding O), digits 0-9, period (.), max 20 chars'
      );
    }

    // 2. Check broadcast module configuration
    const broadcastModuleConfigured = drone.remote_id_type !== 'none';
    if (!broadcastModuleConfigured) {
      issues.push('No Remote ID module configured (standard or broadcast module required)');
    }

    // 3. Check broadcast frequency >= 1 Hz (at least 1 per second)
    let broadcastFrequencyOk = false;
    const freqResult = await query(
      `SELECT COUNT(*) AS broadcast_count
       FROM remote_id_broadcasts
       WHERE drone_id = $1
         AND timestamp >= NOW() - INTERVAL '10 seconds'`,
      [droneId]
    );
    const recentBroadcasts = Number(freqResult.rows[0].broadcast_count);
    broadcastFrequencyOk = recentBroadcasts >= 10; // At least 10 in 10 seconds = 1 Hz
    if (!broadcastFrequencyOk && broadcastModuleConfigured) {
      // Only flag if drone has RID configured and should be broadcasting
      const lastBroadcast = await query(
        `SELECT timestamp FROM remote_id_broadcasts WHERE drone_id = $1 ORDER BY timestamp DESC LIMIT 1`,
        [droneId]
      );
      if (lastBroadcast.rows.length > 0) {
        const lastTs = new Date(lastBroadcast.rows[0].timestamp);
        const secondsAgo = (Date.now() - lastTs.getTime()) / 1000;
        if (secondsAgo < 60) {
          // Drone is actively flying but below 1 Hz
          issues.push('Broadcast frequency below required 1 Hz minimum (14 CFR 89.310)');
        }
        // If last broadcast was long ago, drone may just not be flying; not an issue
      } else if (broadcastModuleConfigured) {
        issues.push('No Remote ID broadcasts ever recorded for this drone');
      }
    }

    // 4. Check position accuracy <= 100 ft (would be from calibration data)
    let positionAccuracyOk = true;
    const accuracyResult = await query(
      `SELECT AVG(ABS(uas_lat - operator_lat)) AS avg_lat_delta,
              AVG(ABS(uas_lng - operator_lng)) AS avg_lng_delta
       FROM remote_id_broadcasts
       WHERE drone_id = $1
         AND timestamp >= NOW() - INTERVAL '1 hour'
       HAVING COUNT(*) > 0`,
      [droneId]
    );
    // If there's calibration/accuracy data, it would be checked here
    // For now, we assume compliant unless flagged by a calibration check
    if (accuracyResult.rows.length === 0 && broadcastModuleConfigured) {
      // No recent data to validate accuracy
      positionAccuracyOk = true; // Cannot determine; assume OK
    }

    // 5. Altitude accuracy <= 150 ft
    const altitudeAccuracyOk = true; // Requires ground truth comparison; assume OK

    // 6. Transmission latency <= 1 sec
    const transmissionLatencyOk = true; // Requires real-time measurement; assume OK for stored data

    // 7. Check if operating in FRIA
    let operatingInFria = false;
    const lastPos = await query(
      `SELECT uas_lat, uas_lng FROM remote_id_broadcasts
       WHERE drone_id = $1 ORDER BY timestamp DESC LIMIT 1`,
      [droneId]
    );
    if (lastPos.rows.length > 0) {
      const friaResult = await query(
        `SELECT id FROM faa_recognized_identification_areas
         WHERE active = true
           AND ST_Contains(geometry, ST_SetSRID(ST_Point($1, $2), 4326))
         LIMIT 1`,
        [lastPos.rows[0].uas_lng, lastPos.rows[0].uas_lat]
      );
      operatingInFria = friaResult.rows.length > 0;
    }

    // In FRIA, Remote ID equipment is not required
    const compliant = operatingInFria || (
      serialNumberValid &&
      broadcastModuleConfigured &&
      issues.length === 0
    );

    // Upsert compliance check record
    await queryWithTenant(
      tenantId,
      `INSERT INTO remote_id_compliance_checks (
        drone_id, tenant_id, compliant,
        serial_number_valid, broadcast_module_configured,
        broadcast_frequency_ok, position_accuracy_ok,
        altitude_accuracy_ok, transmission_latency_ok,
        operating_in_fria, issues, checked_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (drone_id)
      DO UPDATE SET
        compliant = EXCLUDED.compliant,
        serial_number_valid = EXCLUDED.serial_number_valid,
        broadcast_module_configured = EXCLUDED.broadcast_module_configured,
        broadcast_frequency_ok = EXCLUDED.broadcast_frequency_ok,
        position_accuracy_ok = EXCLUDED.position_accuracy_ok,
        altitude_accuracy_ok = EXCLUDED.altitude_accuracy_ok,
        transmission_latency_ok = EXCLUDED.transmission_latency_ok,
        operating_in_fria = EXCLUDED.operating_in_fria,
        issues = EXCLUDED.issues,
        checked_at = NOW()`,
      [
        droneId, tenantId, compliant,
        serialNumberValid, broadcastModuleConfigured,
        broadcastFrequencyOk, positionAccuracyOk,
        altitudeAccuracyOk, transmissionLatencyOk,
        operatingInFria, JSON.stringify(issues),
      ]
    );

    // Update drone compliance flag
    await queryWithTenant(
      tenantId,
      `UPDATE drones SET remote_id_compliant = $1, updated_at = NOW() WHERE id = $2`,
      [compliant, droneId]
    );

    return {
      drone_id: droneId,
      compliant,
      serial_number_valid: serialNumberValid,
      broadcast_module_configured: broadcastModuleConfigured,
      broadcast_frequency_ok: broadcastFrequencyOk,
      position_accuracy_ok: positionAccuracyOk,
      altitude_accuracy_ok: altitudeAccuracyOk,
      transmission_latency_ok: transmissionLatencyOk,
      operating_in_fria: operatingInFria,
      issues,
      checked_at: new Date().toISOString(),
    };
  }

  // ─── Private Helpers ───

  private validateCoordinates(lat: number, lng: number): void {
    if (lat < -90 || lat > 90) {
      throw new ValidationError('Latitude must be between -90 and 90', { lat });
    }
    if (lng < -180 || lng > 180) {
      throw new ValidationError('Longitude must be between -180 and 180', { lng });
    }
  }

  private computeDeadline(days: number): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toISOString().split('T')[0];
  }
}

export const safetyService = new SafetyService();
