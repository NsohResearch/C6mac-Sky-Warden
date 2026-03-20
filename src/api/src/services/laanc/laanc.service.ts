import { randomBytes } from 'node:crypto';
import { queryWithTenant, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../utils/errors.js';
import { airspaceService } from '../airspace/airspace.service.js';
import type {
  LaancAuthorization,
  LaancAuthorizationType,
  LaancAuthorizationStatus,
  LaancSubmitRequest,
  LaancSubmitResponse,
  LaancStats,
} from '../../../../shared/types/laanc.js';
import type { UUID, ISOTimestamp, PaginatedResponse } from '../../../../shared/types/common.js';

// ─── Constants ───

const USS_PREFIX = process.env.FAA_LAANC_USS_ID ?? 'C6M';
const MAX_UAS_ALTITUDE_FT = 400;
const FURTHER_COORD_REVIEW_HOURS = 72;
const AUTH_CODE_BASE_LENGTH = 8;
const AUTH_TYPE_CODES: Record<LaancAuthorizationType, string> = {
  near_real_time: 'N',
  further_coordination: 'F',
  manual: 'M',
};

// ─── Filter Types ───

export interface LaancListFilters {
  status?: LaancAuthorizationStatus;
  authorizationType?: LaancAuthorizationType;
  airportCode?: string;
  pilotId?: UUID;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ─── LaancService ───

export class LaancService {
  private readonly log = logger.child({ service: 'LaancService' });

  /**
   * Submits a LAANC authorization request.
   * Validates airspace, determines authorization type, generates reference code,
   * and records the authorization in the database.
   */
  async submitAuthorization(
    tenantId: UUID,
    pilotId: UUID,
    request: LaancSubmitRequest
  ): Promise<LaancSubmitResponse> {
    this.log.info(
      { tenantId, pilotId, airportCode: request.faaRegistrationNumber },
      'Submitting LAANC authorization'
    );

    // Validate altitude ceiling
    if (request.requestedAltitudeFt > MAX_UAS_ALTITUDE_FT) {
      throw new ValidationError(
        `Requested altitude ${request.requestedAltitudeFt}ft exceeds maximum ${MAX_UAS_ALTITUDE_FT}ft AGL`,
        { requestedAltitudeFt: request.requestedAltitudeFt }
      );
    }

    // Validate time window
    const startTime = new Date(request.startTime);
    const endTime = new Date(request.endTime);
    if (startTime >= endTime) {
      throw new ValidationError('Start time must be before end time');
    }
    if (startTime < new Date()) {
      throw new ValidationError('Start time must be in the future');
    }

    // Compute center point from the operation area polygon
    const centerPoint = this.computeCentroid(request.operationArea);

    // Perform airspace check at the operation center
    const airspaceCheck = await airspaceService.checkAirspace(
      centerPoint.latitude,
      centerPoint.longitude,
      request.requestedAltitudeFt,
      startTime
    );

    if (!airspaceCheck.canFly) {
      throw new ValidationError(
        'The requested operation area is in prohibited airspace',
        {
          advisoryLevel: airspaceCheck.advisoryLevel,
          restrictions: airspaceCheck.restrictions.map((r) => r.name),
        }
      );
    }

    // Determine authorization type based on UASFM data
    const { authorizationType, status, approvedAltitudeFt } =
      this.determineAuthorizationType(
        request.requestedAltitudeFt,
        airspaceCheck.maxAltitudeFt,
        airspaceCheck.laancAvailable,
        airspaceCheck.airspaceClass
      );

    // Generate 12-character reference code
    const referenceCode = this.generateReferenceCode(authorizationType);

    const now = new Date().toISOString();
    const respondedAt = authorizationType === 'near_real_time' ? now : undefined;
    const approvedStart = authorizationType === 'near_real_time' ? request.startTime : undefined;
    const approvedEnd = authorizationType === 'near_real_time' ? request.endTime : undefined;

    // Calculate max duration
    const maxDurationHours = Math.ceil(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    );

    // Record authorization in database within a transaction
    const authorization = await withTransaction(tenantId, async (client) => {
      const result = await client.query<{ id: string }>(
        `INSERT INTO laanc_authorizations (
          tenant_id, pilot_id,
          reference_code, uss_provider, authorization_type, status,
          operation_type, operation_area, center_point, radius_meters,
          requested_altitude_ft, requested_altitude_unit, requested_altitude_ref,
          approved_altitude_ft, approved_altitude_unit, approved_altitude_ref,
          uasfm_max_altitude_ft,
          airport_code, airport_name, facility_id, airspace_class,
          requested_start, requested_end,
          approved_start, approved_end,
          max_duration_hours,
          drone_serial_number, faa_registration_number, remote_id_serial_number,
          night_operations, anti_collision_light,
          submitted_at, responded_at,
          created_at, updated_at
        ) VALUES (
          $1, $2,
          $3, $4, $5, $6,
          $7, ST_SetSRID(ST_GeomFromGeoJSON($8), 4326), ST_SetSRID(ST_Point($9, $10), 4326), $11,
          $12, 'feet', 'AGL',
          $13, 'feet', 'AGL',
          $14,
          $15, $16, $17, $18,
          $19, $20,
          $21, $22,
          $23,
          $24, $25, $26,
          $27, $28,
          $29, $30,
          NOW(), NOW()
        )
        RETURNING id`,
        [
          tenantId,
          pilotId,
          referenceCode,
          USS_PREFIX,
          authorizationType,
          status,
          request.operationType,
          JSON.stringify(request.operationArea),
          centerPoint.longitude,
          centerPoint.latitude,
          this.computeRadius(request.operationArea, centerPoint),
          request.requestedAltitudeFt,
          approvedAltitudeFt,
          airspaceCheck.maxAltitudeFt,
          airspaceCheck.nearestAirport?.code ?? '',
          airspaceCheck.nearestAirport?.name ?? '',
          airspaceCheck.facilities[0]?.facilityId ?? '',
          airspaceCheck.airspaceClass ?? 'E',
          request.startTime,
          request.endTime,
          approvedStart ?? null,
          approvedEnd ?? null,
          maxDurationHours,
          request.droneSerialNumber,
          request.faaRegistrationNumber,
          request.remoteIdSerialNumber ?? null,
          request.nightOperations,
          request.antiCollisionLight,
          now,
          respondedAt ?? null,
        ]
      );

      return result.rows[0];
    });

    this.log.info(
      {
        authorizationId: authorization.id,
        referenceCode,
        authorizationType,
        status,
      },
      'LAANC authorization submitted'
    );

    return {
      referenceCode,
      status,
      authorizationType,
      approvedAltitudeFt:
        authorizationType === 'near_real_time' ? approvedAltitudeFt : undefined,
      approvedStart: approvedStart as ISOTimestamp | undefined,
      approvedEnd: approvedEnd as ISOTimestamp | undefined,
      conditions:
        authorizationType === 'near_real_time' && request.nightOperations
          ? ['Anti-collision lighting required for night operations']
          : undefined,
      denialReason: undefined,
      expiresAt: approvedEnd as ISOTimestamp | undefined,
      respondedAt: now as ISOTimestamp,
    };
  }

  /**
   * Retrieves a single LAANC authorization by ID within a tenant context.
   */
  async getAuthorization(id: UUID, tenantId: UUID): Promise<LaancAuthorization> {
    const result = await queryWithTenant<Record<string, unknown>>(
      tenantId,
      `SELECT id, tenant_id, pilot_id, mission_id,
              reference_code, uss_provider, authorization_type, status,
              operation_type,
              ST_AsGeoJSON(operation_area)::jsonb AS operation_area,
              ST_Y(center_point) AS center_lat, ST_X(center_point) AS center_lng,
              radius_meters,
              requested_altitude_ft, requested_altitude_unit, requested_altitude_ref,
              approved_altitude_ft, approved_altitude_unit, approved_altitude_ref,
              uasfm_max_altitude_ft,
              airport_code, airport_name, facility_id, airspace_class,
              requested_start, requested_end,
              approved_start, approved_end,
              max_duration_hours,
              drone_serial_number, faa_registration_number, remote_id_serial_number,
              night_operations, anti_collision_light,
              reviewed_by, review_notes, denial_reason, conditions,
              submitted_at, responded_at, created_at, updated_at
       FROM laanc_authorizations
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('LAANC Authorization', id);
    }

    return this.mapAuthorizationRow(result.rows[0]);
  }

  /**
   * Lists LAANC authorizations for a tenant with pagination and optional filters.
   */
  async listAuthorizations(
    tenantId: UUID,
    filters: LaancListFilters = {}
  ): Promise<PaginatedResponse<LaancAuthorization>> {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ['tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }
    if (filters.authorizationType) {
      conditions.push(`authorization_type = $${paramIndex}`);
      params.push(filters.authorizationType);
      paramIndex++;
    }
    if (filters.airportCode) {
      conditions.push(`airport_code = $${paramIndex}`);
      params.push(filters.airportCode);
      paramIndex++;
    }
    if (filters.pilotId) {
      conditions.push(`pilot_id = $${paramIndex}`);
      params.push(filters.pilotId);
      paramIndex++;
    }
    if (filters.startDate) {
      conditions.push(`requested_start >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }
    if (filters.endDate) {
      conditions.push(`requested_end <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*)::text AS count FROM laanc_authorizations WHERE ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get page of results
    const dataResult = await queryWithTenant<Record<string, unknown>>(
      tenantId,
      `SELECT id, tenant_id, pilot_id, mission_id,
              reference_code, uss_provider, authorization_type, status,
              operation_type,
              ST_AsGeoJSON(operation_area)::jsonb AS operation_area,
              ST_Y(center_point) AS center_lat, ST_X(center_point) AS center_lng,
              radius_meters,
              requested_altitude_ft, requested_altitude_unit, requested_altitude_ref,
              approved_altitude_ft, approved_altitude_unit, approved_altitude_ref,
              uasfm_max_altitude_ft,
              airport_code, airport_name, facility_id, airspace_class,
              requested_start, requested_end,
              approved_start, approved_end,
              max_duration_hours,
              drone_serial_number, faa_registration_number, remote_id_serial_number,
              night_operations, anti_collision_light,
              reviewed_by, review_notes, denial_reason, conditions,
              submitted_at, responded_at, created_at, updated_at
       FROM laanc_authorizations
       WHERE ${whereClause}
       ORDER BY submitted_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    return {
      data: dataResult.rows.map((row) => this.mapAuthorizationRow(row)),
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
   * Cancels a pending or approved LAANC authorization.
   */
  async cancelAuthorization(id: UUID, tenantId: UUID): Promise<LaancAuthorization> {
    const authorization = await this.getAuthorization(id, tenantId);

    const cancellableStatuses: LaancAuthorizationStatus[] = [
      'draft',
      'submitted',
      'auto_approved',
      'pending_review',
      'approved',
    ];

    if (!cancellableStatuses.includes(authorization.status)) {
      throw new ConflictError(
        `Cannot cancel authorization with status '${authorization.status}'. ` +
        `Cancellation is only allowed for: ${cancellableStatuses.join(', ')}`
      );
    }

    const result = await queryWithTenant<Record<string, unknown>>(
      tenantId,
      `UPDATE laanc_authorizations
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, tenant_id, pilot_id, mission_id,
                 reference_code, uss_provider, authorization_type, status,
                 operation_type,
                 ST_AsGeoJSON(operation_area)::jsonb AS operation_area,
                 ST_Y(center_point) AS center_lat, ST_X(center_point) AS center_lng,
                 radius_meters,
                 requested_altitude_ft, requested_altitude_unit, requested_altitude_ref,
                 approved_altitude_ft, approved_altitude_unit, approved_altitude_ref,
                 uasfm_max_altitude_ft,
                 airport_code, airport_name, facility_id, airspace_class,
                 requested_start, requested_end,
                 approved_start, approved_end,
                 max_duration_hours,
                 drone_serial_number, faa_registration_number, remote_id_serial_number,
                 night_operations, anti_collision_light,
                 reviewed_by, review_notes, denial_reason, conditions,
                 submitted_at, responded_at, created_at, updated_at`,
      [id, tenantId]
    );

    this.log.info({ authorizationId: id, tenantId }, 'LAANC authorization cancelled');
    return this.mapAuthorizationRow(result.rows[0]);
  }

  /**
   * Finds LAANC authorizations expiring within the next hour.
   * Used by background jobs to send expiration notifications.
   */
  async checkExpiring(): Promise<LaancAuthorization[]> {
    const result = await queryWithTenant<Record<string, unknown>>(
      '', // Cross-tenant query; RLS bypassed for system job
      `SELECT id, tenant_id, pilot_id, mission_id,
              reference_code, uss_provider, authorization_type, status,
              operation_type,
              ST_AsGeoJSON(operation_area)::jsonb AS operation_area,
              ST_Y(center_point) AS center_lat, ST_X(center_point) AS center_lng,
              radius_meters,
              requested_altitude_ft, requested_altitude_unit, requested_altitude_ref,
              approved_altitude_ft, approved_altitude_unit, approved_altitude_ref,
              uasfm_max_altitude_ft,
              airport_code, airport_name, facility_id, airspace_class,
              requested_start, requested_end,
              approved_start, approved_end,
              max_duration_hours,
              drone_serial_number, faa_registration_number, remote_id_serial_number,
              night_operations, anti_collision_light,
              reviewed_by, review_notes, denial_reason, conditions,
              submitted_at, responded_at, created_at, updated_at
       FROM laanc_authorizations
       WHERE status IN ('auto_approved', 'approved')
         AND COALESCE(approved_end, requested_end) <= NOW() + INTERVAL '1 hour'
         AND COALESCE(approved_end, requested_end) > NOW()
       ORDER BY COALESCE(approved_end, requested_end) ASC`
    );

    this.log.info({ count: result.rows.length }, 'Found expiring LAANC authorizations');
    return result.rows.map((row) => this.mapAuthorizationRow(row));
  }

  /**
   * Returns LAANC authorization statistics for a tenant over a given period.
   */
  async getStats(
    tenantId: UUID,
    period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): Promise<LaancStats> {
    const intervalMap: Record<string, string> = {
      day: '1 day',
      week: '7 days',
      month: '1 month',
      quarter: '3 months',
      year: '1 year',
    };
    const interval = intervalMap[period];

    const [summaryResult, airportResult, airspaceResult] = await Promise.all([
      queryWithTenant<Record<string, unknown>>(
        tenantId,
        `SELECT
           COUNT(*)::int AS total_requests,
           COUNT(*) FILTER (WHERE status = 'auto_approved')::int AS auto_approved,
           COUNT(*) FILTER (WHERE authorization_type = 'further_coordination')::int AS further_coordination,
           COUNT(*) FILTER (WHERE status = 'denied')::int AS denied,
           COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
           COUNT(*) FILTER (WHERE status = 'expired')::int AS expired,
           COALESCE(
             AVG(EXTRACT(EPOCH FROM (responded_at - submitted_at)) * 1000)
             FILTER (WHERE responded_at IS NOT NULL),
             0
           )::float AS avg_response_time_ms,
           COUNT(*) FILTER (WHERE night_operations = true)::int AS night_ops_count
         FROM laanc_authorizations
         WHERE tenant_id = $1
           AND submitted_at >= NOW() - $2::interval`,
        [tenantId, interval]
      ),
      queryWithTenant<{ code: string; name: string; count: number }>(
        tenantId,
        `SELECT airport_code AS code, airport_name AS name, COUNT(*)::int AS count
         FROM laanc_authorizations
         WHERE tenant_id = $1
           AND submitted_at >= NOW() - $2::interval
         GROUP BY airport_code, airport_name
         ORDER BY count DESC
         LIMIT 10`,
        [tenantId, interval]
      ),
      queryWithTenant<{ airspace_class: string; count: number }>(
        tenantId,
        `SELECT airspace_class, COUNT(*)::int AS count
         FROM laanc_authorizations
         WHERE tenant_id = $1
           AND submitted_at >= NOW() - $2::interval
         GROUP BY airspace_class`,
        [tenantId, interval]
      ),
    ]);

    const summary = summaryResult.rows[0];
    const byAirspaceClass: Record<string, number> = {};
    for (const row of airspaceResult.rows) {
      byAirspaceClass[row.airspace_class] = row.count;
    }

    const now = new Date();
    const startDate = new Date(now.getTime());
    // Subtract interval duration roughly for the start date
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return {
      tenantId,
      period,
      startDate: startDate.toISOString() as ISOTimestamp,
      endDate: now.toISOString() as ISOTimestamp,
      totalRequests: Number(summary.total_requests),
      autoApproved: Number(summary.auto_approved),
      furtherCoordination: Number(summary.further_coordination),
      denied: Number(summary.denied),
      cancelled: Number(summary.cancelled),
      expired: Number(summary.expired),
      avgResponseTimeMs: Number(summary.avg_response_time_ms),
      topAirports: airportResult.rows.map((r) => ({
        code: r.code,
        name: r.name,
        count: r.count,
      })),
      byAirspaceClass,
      nightOpsCount: Number(summary.night_ops_count),
    };
  }

  // ─── Private Helpers ───

  /**
   * Determines the LAANC authorization type based on the requested altitude
   * relative to UASFM limits and LAANC availability.
   */
  private determineAuthorizationType(
    requestedAltitudeFt: number,
    uasfmMaxAltitudeFt: number | null,
    laancAvailable: boolean,
    airspaceClass: string | null
  ): {
    authorizationType: LaancAuthorizationType;
    status: LaancAuthorizationStatus;
    approvedAltitudeFt: number;
  } {
    // Non-LAANC airport: must go through FAA DroneZone
    if (!laancAvailable) {
      return {
        authorizationType: 'manual',
        status: 'submitted',
        approvedAltitudeFt: requestedAltitudeFt,
      };
    }

    // At or below UASFM max altitude: near-real-time auto-approval
    if (uasfmMaxAltitudeFt !== null && requestedAltitudeFt <= uasfmMaxAltitudeFt) {
      return {
        authorizationType: 'near_real_time',
        status: 'auto_approved',
        approvedAltitudeFt: requestedAltitudeFt,
      };
    }

    // Above UASFM max but within 400ft ceiling: further coordination (72hr review)
    if (requestedAltitudeFt <= MAX_UAS_ALTITUDE_FT) {
      return {
        authorizationType: 'further_coordination',
        status: 'pending_review',
        approvedAltitudeFt: requestedAltitudeFt,
      };
    }

    // Should not reach here due to earlier validation, but handle gracefully
    return {
      authorizationType: 'further_coordination',
      status: 'pending_review',
      approvedAltitudeFt: MAX_UAS_ALTITUDE_FT,
    };
  }

  /**
   * Generates a 12-character LAANC reference code:
   *   3 chars USS prefix + 8 chars random base36 + 1 char auth type
   */
  private generateReferenceCode(authType: LaancAuthorizationType): string {
    const base = randomBytes(5)
      .toString('hex')
      .slice(0, AUTH_CODE_BASE_LENGTH)
      .toUpperCase();
    const typeChar = AUTH_TYPE_CODES[authType];
    return `${USS_PREFIX}${base}${typeChar}`;
  }

  /**
   * Computes a naive centroid from a GeoJSON polygon's first ring.
   */
  private computeCentroid(polygon: {
    coordinates: [longitude: number, latitude: number][][];
  }): { latitude: number; longitude: number } {
    const ring = polygon.coordinates[0];
    if (!ring || ring.length === 0) {
      throw new ValidationError('Operation area polygon has no coordinates');
    }

    let sumLng = 0;
    let sumLat = 0;
    // Exclude closing coordinate if ring is closed
    const count = ring[0][0] === ring[ring.length - 1][0] &&
                  ring[0][1] === ring[ring.length - 1][1]
      ? ring.length - 1
      : ring.length;

    for (let i = 0; i < count; i++) {
      sumLng += ring[i][0];
      sumLat += ring[i][1];
    }

    return {
      latitude: sumLat / count,
      longitude: sumLng / count,
    };
  }

  /**
   * Estimates the radius in meters from centroid to the farthest polygon vertex.
   */
  private computeRadius(
    polygon: { coordinates: [longitude: number, latitude: number][][] },
    centroid: { latitude: number; longitude: number }
  ): number {
    const ring = polygon.coordinates[0];
    if (!ring || ring.length === 0) return 0;

    let maxDistSq = 0;
    for (const [lng, lat] of ring) {
      const dLat = (lat - centroid.latitude) * 111_320;
      const dLng =
        (lng - centroid.longitude) *
        111_320 *
        Math.cos((centroid.latitude * Math.PI) / 180);
      const distSq = dLat * dLat + dLng * dLng;
      if (distSq > maxDistSq) maxDistSq = distSq;
    }
    return Math.ceil(Math.sqrt(maxDistSq));
  }

  /**
   * Maps a database row to a LaancAuthorization domain object.
   */
  private mapAuthorizationRow(row: Record<string, unknown>): LaancAuthorization {
    return {
      id: row.id as string,
      tenantId: row.tenant_id as string,
      pilotId: row.pilot_id as string,
      missionId: row.mission_id as string | undefined,
      referenceCode: row.reference_code as string,
      ussProvider: row.uss_provider as string,
      authorizationType: row.authorization_type as LaancAuthorizationType,
      status: row.status as LaancAuthorizationStatus,
      operationType: row.operation_type as 'part_107' | 'recreational',
      operationArea: row.operation_area as LaancAuthorization['operationArea'],
      centerPoint: {
        latitude: Number(row.center_lat),
        longitude: Number(row.center_lng),
      },
      radiusMeters: Number(row.radius_meters),
      requestedAltitude: {
        value: Number(row.requested_altitude_ft),
        unit: (row.requested_altitude_unit as 'feet' | 'meters') ?? 'feet',
        reference: (row.requested_altitude_ref as 'AGL' | 'MSL') ?? 'AGL',
      },
      approvedAltitude: row.approved_altitude_ft != null
        ? {
            value: Number(row.approved_altitude_ft),
            unit: (row.approved_altitude_unit as 'feet' | 'meters') ?? 'feet',
            reference: (row.approved_altitude_ref as 'AGL' | 'MSL') ?? 'AGL',
          }
        : undefined,
      uasfmMaxAltitudeFt: Number(row.uasfm_max_altitude_ft),
      airportCode: row.airport_code as string,
      airportName: row.airport_name as string,
      facilityId: row.facility_id as string,
      airspaceClass: row.airspace_class as LaancAuthorization['airspaceClass'],
      requestedStart: row.requested_start as string as ISOTimestamp,
      requestedEnd: row.requested_end as string as ISOTimestamp,
      approvedStart: row.approved_start as string | undefined as ISOTimestamp | undefined,
      approvedEnd: row.approved_end as string | undefined as ISOTimestamp | undefined,
      maxDurationHours: Number(row.max_duration_hours),
      droneSerialNumber: row.drone_serial_number as string,
      faaRegistrationNumber: row.faa_registration_number as string,
      remoteIdSerialNumber: row.remote_id_serial_number as string | undefined,
      nightOperations: Boolean(row.night_operations),
      antiCollisionLight: Boolean(row.anti_collision_light),
      reviewedBy: row.reviewed_by as string | undefined,
      reviewNotes: row.review_notes as string | undefined,
      denialReason: row.denial_reason as string | undefined,
      conditions: row.conditions as string[] | undefined,
      submittedAt: row.submitted_at as string as ISOTimestamp,
      respondedAt: row.responded_at as string | undefined as ISOTimestamp | undefined,
      createdAt: row.created_at as string as ISOTimestamp,
      updatedAt: row.updated_at as string as ISOTimestamp,
    };
  }
}

export const laancService = new LaancService();
