import { queryWithTenant } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, ValidationError, ConflictError, AppError } from '../../utils/errors.js';
import type {
  PilotProfile,
  Part107Waiver,
} from '../../../../shared/types/fleet.js';
import type { UUID, PaginatedResponse } from '../../../../shared/types/common.js';

// ─── Input DTOs ───

export interface CreatePilotProfileInput {
  faaRegistrationNumber?: string;
  part107CertificateNumber?: string;
  part107ExpiresAt?: string;
  part107Waivers?: Part107Waiver[];
  trustCompletionId?: string;
  trustCompletedAt?: string;
  medicalCertificate?: PilotProfile['medicalCertificate'];
  endorsements?: string[];
  emergencyContact?: PilotProfile['emergencyContact'];
}

export interface UpdatePilotProfileInput {
  faaRegistrationNumber?: string;
  part107CertificateNumber?: string;
  part107ExpiresAt?: string;
  part107Waivers?: Part107Waiver[];
  trustCompletionId?: string;
  trustCompletedAt?: string;
  medicalCertificate?: PilotProfile['medicalCertificate'];
  endorsements?: string[];
  emergencyContact?: PilotProfile['emergencyContact'];
}

export interface ListPilotsFilters {
  search?: string;
  hasPart107?: boolean;
  hasTrust?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'total_flight_hours' | 'total_flights';
  sortOrder?: 'asc' | 'desc';
}

export interface CertificationStatus {
  userId: UUID;
  part107Valid: boolean;
  part107ExpiresAt?: string;
  part107DaysUntilExpiry?: number;
  trustComplete: boolean;
  trustCompletedAt?: string;
  medicalValid: boolean;
  medicalExpiresAt?: string;
  overallCompliant: boolean;
  issues: string[];
}

export interface PilotFlightStats {
  userId: UUID;
  period: string;
  totalFlights: number;
  totalFlightHours: number;
  missionsCompleted: number;
  missionsAborted: number;
  averageFlightDurationMinutes: number;
  dronesFlown: string[];
  missionTypes: Record<string, number>;
}

// ─── Service ───

export class PilotService {
  private readonly log = logger.child({ service: 'PilotService' });

  /**
   * Create a pilot profile for a user.
   */
  async createProfile(
    userId: UUID,
    tenantId: UUID,
    data: CreatePilotProfileInput
  ): Promise<PilotProfile> {
    this.log.info({ userId, tenantId }, 'Creating pilot profile');

    // Check for existing profile
    const existing = await queryWithTenant<{ user_id: string }>(
      tenantId,
      `SELECT user_id FROM pilot_profiles WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError(`Pilot profile already exists for user '${userId}'`);
    }

    const result = await queryWithTenant<PilotProfile>(
      tenantId,
      `INSERT INTO pilot_profiles (
        user_id, tenant_id,
        faa_registration_number, part107_certificate_number,
        part107_expires_at, part107_waivers,
        trust_completion_id, trust_completed_at,
        medical_certificate, endorsements, emergency_contact,
        total_flight_hours, total_flights,
        assigned_drone_ids, active_missions
      ) VALUES (
        $1, $2,
        $3, $4,
        $5, $6,
        $7, $8,
        $9, $10, $11,
        0, 0,
        '{}', '{}'
      )
      RETURNING *`,
      [
        userId,
        tenantId,
        data.faaRegistrationNumber ?? null,
        data.part107CertificateNumber ?? null,
        data.part107ExpiresAt ?? null,
        JSON.stringify(data.part107Waivers ?? []),
        data.trustCompletionId ?? null,
        data.trustCompletedAt ?? null,
        data.medicalCertificate ? JSON.stringify(data.medicalCertificate) : null,
        data.endorsements ?? [],
        data.emergencyContact ? JSON.stringify(data.emergencyContact) : null,
      ]
    );

    this.log.info({ userId }, 'Pilot profile created');
    return this.mapPilotRow(result.rows[0]);
  }

  /**
   * Get a pilot profile by user ID.
   */
  async getProfile(userId: UUID, tenantId: UUID): Promise<PilotProfile> {
    const result = await queryWithTenant<PilotProfile>(
      tenantId,
      `SELECT * FROM pilot_profiles WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('PilotProfile', userId);
    }

    return this.mapPilotRow(result.rows[0]);
  }

  /**
   * Update a pilot profile.
   */
  async updateProfile(
    userId: UUID,
    tenantId: UUID,
    data: UpdatePilotProfileInput
  ): Promise<PilotProfile> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, { column: string; json?: boolean }> = {
      faaRegistrationNumber: { column: 'faa_registration_number' },
      part107CertificateNumber: { column: 'part107_certificate_number' },
      part107ExpiresAt: { column: 'part107_expires_at' },
      part107Waivers: { column: 'part107_waivers', json: true },
      trustCompletionId: { column: 'trust_completion_id' },
      trustCompletedAt: { column: 'trust_completed_at' },
      medicalCertificate: { column: 'medical_certificate', json: true },
      endorsements: { column: 'endorsements' },
      emergencyContact: { column: 'emergency_contact', json: true },
    };

    for (const [key, config] of Object.entries(fieldMap)) {
      const value = (data as Record<string, unknown>)[key];
      if (value !== undefined) {
        setClauses.push(`${config.column} = $${paramIndex}`);
        values.push(config.json ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return this.getProfile(userId, tenantId);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(userId, tenantId);

    const result = await queryWithTenant<PilotProfile>(
      tenantId,
      `UPDATE pilot_profiles SET ${setClauses.join(', ')}
       WHERE user_id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('PilotProfile', userId);
    }

    this.log.info({ userId }, 'Pilot profile updated');
    return this.mapPilotRow(result.rows[0]);
  }

  /**
   * List pilot profiles with pagination and filters.
   */
  async listPilots(
    tenantId: UUID,
    filters: ListPilotsFilters = {}
  ): Promise<PaginatedResponse<PilotProfile>> {
    const {
      search,
      hasPart107,
      hasTrust,
      page = 1,
      pageSize = 25,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const conditions: string[] = ['pp.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramIndex = 2;

    if (search) {
      conditions.push(
        `(u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR pp.faa_registration_number ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (hasPart107 !== undefined) {
      if (hasPart107) {
        conditions.push(`pp.part107_certificate_number IS NOT NULL AND pp.part107_expires_at > NOW()`);
      } else {
        conditions.push(`(pp.part107_certificate_number IS NULL OR pp.part107_expires_at <= NOW())`);
      }
    }

    if (hasTrust !== undefined) {
      if (hasTrust) {
        conditions.push(`pp.trust_completion_id IS NOT NULL`);
      } else {
        conditions.push(`pp.trust_completion_id IS NULL`);
      }
    }

    const whereClause = conditions.join(' AND ');

    const allowedSortColumns: Record<string, string> = {
      created_at: 'pp.created_at',
      total_flight_hours: 'pp.total_flight_hours',
      total_flights: 'pp.total_flights',
    };
    const sortColumn = allowedSortColumns[sortBy] ?? 'pp.created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*) as count
       FROM pilot_profiles pp
       LEFT JOIN users u ON u.id = pp.user_id
       WHERE ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const dataResult = await queryWithTenant<PilotProfile>(
      tenantId,
      `SELECT pp.*
       FROM pilot_profiles pp
       LEFT JOIN users u ON u.id = pp.user_id
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: dataResult.rows.map((row) => this.mapPilotRow(row)),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Check the certification status for a pilot (Part 107, TRUST, medical).
   */
  async checkCertificationStatus(userId: UUID): Promise<CertificationStatus> {
    const result = await queryWithTenant<PilotProfile>(
      userId, // tenant resolved via RLS
      `SELECT * FROM pilot_profiles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('PilotProfile', userId);
    }

    const pilot = this.mapPilotRow(result.rows[0]);
    const now = new Date();
    const issues: string[] = [];

    // Part 107 check
    let part107Valid = false;
    let part107DaysUntilExpiry: number | undefined;
    if (pilot.part107CertificateNumber && pilot.part107ExpiresAt) {
      const expiryDate = new Date(pilot.part107ExpiresAt);
      part107Valid = expiryDate > now;
      part107DaysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (!part107Valid) {
        issues.push('Part 107 certificate has expired');
      } else if (part107DaysUntilExpiry <= 90) {
        issues.push(`Part 107 certificate expires in ${part107DaysUntilExpiry} days`);
      }
    } else {
      issues.push('No Part 107 certificate on file');
    }

    // TRUST check
    const trustComplete = !!pilot.trustCompletionId;
    if (!trustComplete) {
      issues.push('TRUST completion not recorded');
    }

    // Medical certificate check
    let medicalValid = false;
    let medicalExpiresAt: string | undefined;
    if (pilot.medicalCertificate) {
      medicalExpiresAt = pilot.medicalCertificate.expiresAt;
      medicalValid = new Date(medicalExpiresAt) > now;
      if (!medicalValid) {
        issues.push('Medical certificate has expired');
      }
    }
    // Medical not always required for Part 107, so not flagged as missing

    const overallCompliant = part107Valid && trustComplete;

    return {
      userId,
      part107Valid,
      part107ExpiresAt: pilot.part107ExpiresAt,
      part107DaysUntilExpiry,
      trustComplete,
      trustCompletedAt: pilot.trustCompletedAt,
      medicalValid,
      medicalExpiresAt,
      overallCompliant,
      issues,
    };
  }

  /**
   * Assign a drone to a pilot.
   */
  async assignDrone(userId: UUID, tenantId: UUID, droneId: UUID): Promise<PilotProfile> {
    // Verify drone exists
    const droneResult = await queryWithTenant<{ id: string }>(
      tenantId,
      `SELECT id FROM drones WHERE id = $1 AND tenant_id = $2`,
      [droneId, tenantId]
    );

    if (droneResult.rows.length === 0) {
      throw new NotFoundError('Drone', droneId);
    }

    // Check pilot exists
    const pilotResult = await queryWithTenant<PilotProfile>(
      tenantId,
      `SELECT * FROM pilot_profiles WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    );

    if (pilotResult.rows.length === 0) {
      throw new NotFoundError('PilotProfile', userId);
    }

    const pilot = this.mapPilotRow(pilotResult.rows[0]);
    if (pilot.assignedDroneIds.includes(droneId)) {
      throw new ConflictError(`Drone '${droneId}' is already assigned to pilot '${userId}'`);
    }

    // Add drone to pilot's assigned list
    const updatedPilot = await queryWithTenant<PilotProfile>(
      tenantId,
      `UPDATE pilot_profiles
       SET assigned_drone_ids = array_append(assigned_drone_ids, $1),
           updated_at = NOW()
       WHERE user_id = $2 AND tenant_id = $3
       RETURNING *`,
      [droneId, userId, tenantId]
    );

    // Add pilot to drone's assigned list
    await queryWithTenant(
      tenantId,
      `UPDATE drones
       SET assigned_pilot_ids = array_append(assigned_pilot_ids, $1),
           updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [userId, droneId, tenantId]
    );

    this.log.info({ userId, droneId }, 'Drone assigned to pilot');
    return this.mapPilotRow(updatedPilot.rows[0]);
  }

  /**
   * Remove a drone assignment from a pilot.
   */
  async unassignDrone(userId: UUID, tenantId: UUID, droneId: UUID): Promise<PilotProfile> {
    const pilotResult = await queryWithTenant<PilotProfile>(
      tenantId,
      `SELECT * FROM pilot_profiles WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    );

    if (pilotResult.rows.length === 0) {
      throw new NotFoundError('PilotProfile', userId);
    }

    const pilot = this.mapPilotRow(pilotResult.rows[0]);
    if (!pilot.assignedDroneIds.includes(droneId)) {
      throw new ValidationError(`Drone '${droneId}' is not assigned to pilot '${userId}'`);
    }

    // Remove drone from pilot's assigned list
    const updatedPilot = await queryWithTenant<PilotProfile>(
      tenantId,
      `UPDATE pilot_profiles
       SET assigned_drone_ids = array_remove(assigned_drone_ids, $1),
           updated_at = NOW()
       WHERE user_id = $2 AND tenant_id = $3
       RETURNING *`,
      [droneId, userId, tenantId]
    );

    // Remove pilot from drone's assigned list
    await queryWithTenant(
      tenantId,
      `UPDATE drones
       SET assigned_pilot_ids = array_remove(assigned_pilot_ids, $1),
           updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [userId, droneId, tenantId]
    );

    this.log.info({ userId, droneId }, 'Drone unassigned from pilot');
    return this.mapPilotRow(updatedPilot.rows[0]);
  }

  /**
   * Get flight statistics for a pilot over a given period.
   */
  async getPilotFlightStats(
    userId: UUID,
    period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
  ): Promise<PilotFlightStats> {
    const intervalMap: Record<string, string> = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      '1y': '1 year',
      all: '100 years', // effectively all time
    };

    const interval = intervalMap[period] ?? '30 days';

    const result = await queryWithTenant<{
      total_flights: string;
      total_hours: string;
      completed: string;
      aborted: string;
      avg_duration: string;
      drones_flown: string[];
    }>(
      userId,
      `SELECT
        COUNT(*) AS total_flights,
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (COALESCE(actual_end, scheduled_end) - COALESCE(actual_start, scheduled_start))) / 3600.0
        ), 0) AS total_hours,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'aborted') AS aborted,
        COALESCE(AVG(
          EXTRACT(EPOCH FROM (COALESCE(actual_end, scheduled_end) - COALESCE(actual_start, scheduled_start))) / 60.0
        ), 0) AS avg_duration,
        ARRAY_AGG(DISTINCT drone_id) FILTER (WHERE drone_id IS NOT NULL) AS drones_flown
       FROM missions
       WHERE pilot_in_command_id = $1
         AND created_at >= NOW() - $2::interval
         AND status IN ('completed', 'aborted', 'in_progress')`,
      [userId, interval]
    );

    // Get mission type breakdown
    const typeResult = await queryWithTenant<{ type: string; count: string }>(
      userId,
      `SELECT type, COUNT(*) as count
       FROM missions
       WHERE pilot_in_command_id = $1
         AND created_at >= NOW() - $2::interval
         AND status IN ('completed', 'aborted', 'in_progress')
       GROUP BY type`,
      [userId, interval]
    );

    const missionTypes: Record<string, number> = {};
    for (const row of typeResult.rows) {
      missionTypes[row.type] = parseInt(row.count, 10);
    }

    const stats = result.rows[0];

    return {
      userId,
      period,
      totalFlights: parseInt(stats.total_flights, 10),
      totalFlightHours: parseFloat(parseFloat(stats.total_hours).toFixed(2)),
      missionsCompleted: parseInt(stats.completed, 10),
      missionsAborted: parseInt(stats.aborted, 10),
      averageFlightDurationMinutes: parseFloat(parseFloat(stats.avg_duration).toFixed(1)),
      dronesFlown: stats.drones_flown ?? [],
      missionTypes,
    };
  }

  // ─── Private Helpers ───

  private mapPilotRow(row: Record<string, any>): PilotProfile {
    return {
      userId: row.user_id ?? row.userId,
      tenantId: row.tenant_id ?? row.tenantId,
      faaRegistrationNumber: row.faa_registration_number ?? row.faaRegistrationNumber ?? undefined,
      part107CertificateNumber: row.part107_certificate_number ?? row.part107CertificateNumber ?? undefined,
      part107ExpiresAt: row.part107_expires_at ?? row.part107ExpiresAt ?? undefined,
      part107Waivers: this.parseJson(row.part107_waivers ?? row.part107Waivers, []),
      trustCompletionId: row.trust_completion_id ?? row.trustCompletionId ?? undefined,
      trustCompletedAt: row.trust_completed_at ?? row.trustCompletedAt ?? undefined,
      medicalCertificate: this.parseJson(row.medical_certificate ?? row.medicalCertificate, undefined),
      totalFlightHours: parseFloat(row.total_flight_hours ?? row.totalFlightHours ?? 0),
      totalFlights: parseInt(row.total_flights ?? row.totalFlights ?? 0, 10),
      endorsements: row.endorsements ?? [],
      emergencyContact: this.parseJson(row.emergency_contact ?? row.emergencyContact, undefined),
      assignedDroneIds: row.assigned_drone_ids ?? row.assignedDroneIds ?? [],
      activeMissions: row.active_missions ?? row.activeMissions ?? [],
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }

  private parseJson<T>(value: unknown, fallback: T): T {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T;
      } catch {
        return fallback;
      }
    }
    return value as T;
  }
}

export const pilotService = new PilotService();
