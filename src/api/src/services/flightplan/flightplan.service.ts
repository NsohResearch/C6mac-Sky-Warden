import { queryWithTenant, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
  AppError,
} from '../../utils/errors.js';
import type { UUID, PaginatedResponse } from '../../../../shared/types/common.js';
import type pg from 'pg';

// ─── Constants ───

const METERS_TO_NM = 0.000539957;
const FT_TO_DEGREES_APPROX = 0.3048 / 111320;
const LATERAL_DEVIATION_THRESHOLD_M = 30; // 30 meters lateral
const VERTICAL_DEVIATION_THRESHOLD_FT = 50; // 50 feet vertical
const MAX_FLIGHT_PLAN_WINDOW_HOURS = 24;

type FlightPlanStatus =
  | 'draft'
  | 'filed'
  | 'pending_auth'
  | 'authorized'
  | 'denied'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'emergency'
  | 'diverted'
  | 'expired';

type FlightPlanType = 'vfr' | 'ifr' | 'svfr' | 'composite';

type CloseReason = 'completed' | 'cancelled' | 'emergency' | 'diverted';

// ─── Input DTOs ───

export interface Waypoint {
  sequenceNumber: number;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  speedKnots?: number;
  holdTimeSeconds?: number;
  waypointType?: 'departure' | 'enroute' | 'arrival' | 'alternate';
  name?: string;
}

export interface FileFlightPlanInput {
  droneId: UUID;
  flightPlanType: FlightPlanType;
  departureTime: string;
  estimatedArrivalTime: string;
  waypoints: Waypoint[];
  cruiseAltitudeFt: number;
  corridorWidthFt?: number;
  remarks?: string;
  pilotNotes?: string;
  alternateAirport?: string;
  fuelEnduranceMinutes?: number;
  numberOfPersonsOnBoard?: number;
}

export interface UpdateFlightPlanInput {
  waypoints?: Waypoint[];
  departureTime?: string;
  estimatedArrivalTime?: string;
  cruiseAltitudeFt?: number;
  corridorWidthFt?: number;
  remarks?: string;
  pilotNotes?: string;
}

export interface PositionUpdate {
  lat: number;
  lng: number;
  altFt: number;
  headingDeg: number;
}

export interface DeviationAlert {
  type: 'lateral' | 'vertical' | 'speed' | 'airspace_intrusion';
  severity: 'warning' | 'critical';
  message: string;
  deviationValue: number;
  thresholdValue: number;
  position: { lat: number; lng: number; altFt: number };
  timestamp: string;
}

export interface AirspaceConflict {
  airspaceId: string;
  airspaceClass: string;
  airspaceName: string;
  requiresAuthorization: boolean;
  authorizationType?: 'laanc_auto' | 'laanc_further' | 'waiver';
  maxAltitudeFt?: number;
}

export interface ListFlightPlansFilters {
  status?: FlightPlanStatus | FlightPlanStatus[];
  type?: FlightPlanType;
  pilotId?: UUID;
  droneId?: UUID;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'departure_time' | 'flight_plan_number' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface FlightPlanStats {
  totalFiled: number;
  totalAuthorized: number;
  totalCompleted: number;
  totalDenied: number;
  totalDeviated: number;
  averageDurationMinutes: number;
  averageEstimatedDurationMinutes: number;
  mostCommonAirspaces: { airspaceName: string; count: number }[];
  deviationRate: number;
}

// ─── Service ───

export class FlightPlanService {
  private readonly log = logger.child({ service: 'FlightPlanService' });

  /**
   * File a new flight plan (IFR/VFR style).
   * Validates registration, certification, times, builds route geometry,
   * checks airspace/TFR/NOTAM conflicts, and auto-creates LAANC requests if needed.
   */
  async fileFlightPlan(
    tenantId: UUID,
    pilotId: UUID,
    input: FileFlightPlanInput
  ): Promise<Record<string, any>> {
    this.log.info({ tenantId, pilotId, droneId: input.droneId }, 'Filing flight plan');

    // 1. Validate drone has ACTIVE registration
    const regResult = await queryWithTenant(
      tenantId,
      `SELECT id, status, registration_number, expires_at
       FROM drone_registrations
       WHERE drone_id = $1 AND tenant_id = $2 AND status = 'active'
       ORDER BY expires_at DESC
       LIMIT 1`,
      [input.droneId, tenantId]
    );

    if (regResult.rows.length === 0) {
      throw new ValidationError(
        'Drone does not have an active registration. Register the drone before filing a flight plan.',
        { droneId: input.droneId }
      );
    }

    const registration = regResult.rows[0];
    if (registration.expires_at && new Date(registration.expires_at) < new Date()) {
      throw new ValidationError(
        'Drone registration has expired. Renew registration before filing a flight plan.',
        { registrationNumber: registration.registration_number, expiresAt: registration.expires_at }
      );
    }

    // 2. Validate pilot has valid certification
    const pilotResult = await queryWithTenant(
      tenantId,
      `SELECT id, certification_type, certification_number, certification_expiry,
              total_flight_hours, status
       FROM pilot_profiles
       WHERE user_id = $1 AND tenant_id = $2`,
      [pilotId, tenantId]
    );

    if (pilotResult.rows.length === 0) {
      throw new ValidationError(
        'Pilot profile not found. Create a pilot profile before filing a flight plan.',
        { pilotId }
      );
    }

    const pilot = pilotResult.rows[0];
    if (pilot.certification_expiry && new Date(pilot.certification_expiry) < new Date()) {
      throw new ValidationError(
        'Pilot certification has expired. Renew certification before filing a flight plan.',
        { certificationNumber: pilot.certification_number, expiresAt: pilot.certification_expiry }
      );
    }

    // 3. Validate proposed times
    const departureTime = new Date(input.departureTime);
    const arrivalTime = new Date(input.estimatedArrivalTime);
    const now = new Date();

    if (departureTime >= arrivalTime) {
      throw new ValidationError('Departure time must be before estimated arrival time.');
    }

    if (departureTime < now) {
      throw new ValidationError('Departure time cannot be in the past.');
    }

    const windowHours = (arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
    if (windowHours > MAX_FLIGHT_PLAN_WINDOW_HOURS) {
      throw new ValidationError(
        `Flight plan window cannot exceed ${MAX_FLIGHT_PLAN_WINDOW_HOURS} hours. Proposed window: ${windowHours.toFixed(1)} hours.`
      );
    }

    if (input.waypoints.length < 2) {
      throw new ValidationError('Flight plan must have at least 2 waypoints (departure and arrival).');
    }

    // 4. Build geometry and perform spatial checks inside a transaction
    const corridorWidthFt = input.corridorWidthFt ?? 200;

    return withTransaction(tenantId, async (client: pg.PoolClient) => {
      // Build route geometry from waypoints
      const pointsSql = input.waypoints
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
        .map((wp) => `ST_MakePoint(${wp.longitude}, ${wp.latitude})`)
        .join(', ');

      // Calculate route geometry, corridor, and distance
      const geoResult = await client.query(
        `SELECT
           ST_MakeLine(ARRAY[${pointsSql}]) AS route_geometry,
           ST_Buffer(
             ST_MakeLine(ARRAY[${pointsSql}])::geography,
             $1
           )::geometry AS corridor_geometry,
           ST_Length(ST_MakeLine(ARRAY[${pointsSql}])::geography) AS distance_m`,
        [corridorWidthFt * 0.3048]
      );

      const { route_geometry, corridor_geometry, distance_m } = geoResult.rows[0];
      const distanceNm = parseFloat(distance_m) * METERS_TO_NM;

      // 5. Check airspace intersections
      const airspaceResult = await client.query(
        `SELECT
           ug.id AS airspace_id,
           ug.airspace_class,
           ug.facility_name AS airspace_name,
           ug.ceiling_ft,
           CASE
             WHEN ug.airspace_class IN ('B', 'C', 'D') THEN true
             WHEN ug.airspace_class = 'E' AND $2 > 400 THEN true
             ELSE false
           END AS requires_authorization,
           CASE
             WHEN ug.airspace_class IN ('B', 'C', 'D') AND ug.laanc_enabled = true THEN 'laanc_auto'
             WHEN ug.airspace_class IN ('B', 'C', 'D') AND ug.laanc_enabled = false THEN 'laanc_further'
             ELSE NULL
           END AS authorization_type,
           ug.ceiling_ft AS max_altitude_ft
         FROM uasfm_grids ug
         WHERE ST_Intersects(ug.geometry, $1)
         AND ug.tenant_id = $3`,
        [route_geometry, input.cruiseAltitudeFt, tenantId]
      );

      const airspaceConflicts: AirspaceConflict[] = airspaceResult.rows.map((row: any) => ({
        airspaceId: row.airspace_id,
        airspaceClass: row.airspace_class,
        airspaceName: row.airspace_name,
        requiresAuthorization: row.requires_authorization,
        authorizationType: row.authorization_type,
        maxAltitudeFt: row.max_altitude_ft,
      }));

      // 6. Check TFR conflicts
      const tfrResult = await client.query(
        `SELECT id, notam_number, description, effective_start, effective_end
         FROM tfrs
         WHERE ST_Intersects(geometry, $1)
           AND effective_start <= $3
           AND effective_end >= $2
           AND status = 'active'`,
        [route_geometry, input.departureTime, input.estimatedArrivalTime]
      );

      const tfrConflicts = tfrResult.rows;

      // 7. Check NOTAM conflicts
      const notamResult = await client.query(
        `SELECT id, notam_number, description, effective_start, effective_end, type
         FROM notams
         WHERE ST_Intersects(geometry, $1)
           AND effective_start <= $3
           AND effective_end >= $2
           AND status = 'active'`,
        [route_geometry, input.departureTime, input.estimatedArrivalTime]
      );

      const notamConflicts = notamResult.rows;

      // 8. Check airport proximity
      const airportResult = await client.query(
        `SELECT id, icao_code, name,
                ST_Distance(location::geography, $1::geography) AS distance_m
         FROM airports
         WHERE ST_DWithin(location::geography, $1::geography, 9260)
         ORDER BY distance_m`,
        [route_geometry]
      );

      const nearbyAirports = airportResult.rows;

      // 9. Auto-generate flight plan number: SKW-FP-YYYY-NNNNNN
      const year = new Date().getFullYear();
      const seqResult = await client.query(
        `SELECT COALESCE(MAX(
           CAST(SUBSTRING(flight_plan_number FROM 'SKW-FP-\\d{4}-(\\d{6})') AS INTEGER)
         ), 0) + 1 AS next_seq
         FROM flight_plans
         WHERE flight_plan_number LIKE $1`,
        [`SKW-FP-${year}-%`]
      );
      const nextSeq = seqResult.rows[0].next_seq;
      const flightPlanNumber = `SKW-FP-${year}-${String(nextSeq).padStart(6, '0')}`;

      // 10. Determine if LAANC is needed
      const needsLaanc = airspaceConflicts.some((c) => c.requiresAuthorization);
      const initialStatus: FlightPlanStatus = needsLaanc ? 'pending_auth' : 'filed';

      // 11. Insert flight plan
      const fpResult = await client.query(
        `INSERT INTO flight_plans (
           tenant_id, pilot_id, drone_id, flight_plan_number,
           flight_plan_type, status,
           departure_time, estimated_arrival_time,
           cruise_altitude_ft, corridor_width_ft,
           route_geometry, corridor_geometry,
           total_distance_nm,
           airspace_conflicts, tfr_conflicts, notam_conflicts, nearby_airports,
           remarks, pilot_notes, alternate_airport,
           fuel_endurance_minutes, number_of_persons_on_board,
           registration_id,
           created_by
         ) VALUES (
           $1, $2, $3, $4,
           $5, $6,
           $7, $8,
           $9, $10,
           $11, $12,
           $13,
           $14, $15, $16, $17,
           $18, $19, $20,
           $21, $22,
           $23,
           $2
         )
         RETURNING *,
           ST_AsGeoJSON(route_geometry)::jsonb AS route_geojson,
           ST_AsGeoJSON(corridor_geometry)::jsonb AS corridor_geojson`,
        [
          tenantId,                                // $1
          pilotId,                                 // $2
          input.droneId,                           // $3
          flightPlanNumber,                        // $4
          input.flightPlanType,                    // $5
          initialStatus,                           // $6
          input.departureTime,                     // $7
          input.estimatedArrivalTime,              // $8
          input.cruiseAltitudeFt,                  // $9
          corridorWidthFt,                         // $10
          route_geometry,                          // $11
          corridor_geometry,                       // $12
          distanceNm,                              // $13
          JSON.stringify(airspaceConflicts),        // $14
          JSON.stringify(tfrConflicts),             // $15
          JSON.stringify(notamConflicts),           // $16
          JSON.stringify(nearbyAirports),           // $17
          input.remarks ?? null,                   // $18
          input.pilotNotes ?? null,                // $19
          input.alternateAirport ?? null,          // $20
          input.fuelEnduranceMinutes ?? null,      // $21
          input.numberOfPersonsOnBoard ?? null,    // $22
          registration.id,                         // $23
        ]
      );

      const flightPlan = fpResult.rows[0];

      // 12. Insert waypoints (denormalized)
      for (const wp of input.waypoints) {
        await client.query(
          `INSERT INTO flight_plan_waypoints (
             flight_plan_id, tenant_id, sequence_number,
             latitude, longitude, altitude_ft,
             speed_knots, hold_time_seconds,
             waypoint_type, name,
             point_geometry
           ) VALUES (
             $1, $2, $3,
             $4, $5, $6,
             $7, $8,
             $9, $10,
             ST_MakePoint($5, $4)
           )`,
          [
            flightPlan.id,
            tenantId,
            wp.sequenceNumber,
            wp.latitude,
            wp.longitude,
            wp.altitudeFt,
            wp.speedKnots ?? null,
            wp.holdTimeSeconds ?? null,
            wp.waypointType ?? 'enroute',
            wp.name ?? null,
          ]
        );
      }

      // 13. If LAANC needed, auto-create authorization request
      if (needsLaanc) {
        const laancAirspaces = airspaceConflicts.filter((c) => c.requiresAuthorization);
        for (const airspace of laancAirspaces) {
          await client.query(
            `INSERT INTO laanc_authorizations (
               tenant_id, flight_plan_id, pilot_id,
               airspace_id, airspace_class,
               requested_altitude_ft, max_allowed_altitude_ft,
               authorization_type, status,
               requested_start, requested_end,
               created_by
             ) VALUES (
               $1, $2, $3,
               $4, $5,
               $6, $7,
               $8, 'pending',
               $9, $10,
               $3
             )`,
            [
              tenantId,
              flightPlan.id,
              pilotId,
              airspace.airspaceId,
              airspace.airspaceClass,
              input.cruiseAltitudeFt,
              airspace.maxAltitudeFt ?? 400,
              airspace.authorizationType ?? 'laanc_auto',
              input.departureTime,
              input.estimatedArrivalTime,
            ]
          );
        }
      }

      this.log.info(
        {
          flightPlanId: flightPlan.id,
          flightPlanNumber,
          status: initialStatus,
          distanceNm: distanceNm.toFixed(1),
          airspaceConflicts: airspaceConflicts.length,
          tfrConflicts: tfrConflicts.length,
          needsLaanc,
        },
        'Flight plan filed'
      );

      return this.mapFlightPlanRow(flightPlan);
    });
  }

  /**
   * Authorize the flight plan after verifying all prerequisites.
   */
  async authorizeFlightPlan(
    flightPlanId: UUID,
    tenantId: UUID
  ): Promise<Record<string, any>> {
    this.log.info({ flightPlanId, tenantId }, 'Authorizing flight plan');

    const fp = await this.getFlightPlan(flightPlanId, tenantId);

    if (fp.status !== 'filed' && fp.status !== 'pending_auth') {
      throw new ValidationError(
        `Cannot authorize flight plan in '${fp.status}' status. Must be 'filed' or 'pending_auth'.`
      );
    }

    // Verify all LAANC authorizations are approved
    const laancResult = await queryWithTenant(
      tenantId,
      `SELECT id, status, airspace_class
       FROM laanc_authorizations
       WHERE flight_plan_id = $1 AND tenant_id = $2`,
      [flightPlanId, tenantId]
    );

    const pendingLaanc = laancResult.rows.filter(
      (r: any) => r.status !== 'approved' && r.status !== 'not_required'
    );
    if (pendingLaanc.length > 0) {
      throw new ValidationError(
        `Cannot authorize: ${pendingLaanc.length} LAANC authorization(s) are still pending.`,
        { pendingAuthorizations: pendingLaanc.map((r: any) => ({ id: r.id, status: r.status, airspaceClass: r.airspace_class })) }
      );
    }

    // Verify no unresolved TFR conflicts
    const tfrConflicts = this.parseJson(fp.tfrConflicts, []);
    if (tfrConflicts.length > 0) {
      // Re-check TFRs as they may have been resolved
      const activeTfrResult = await queryWithTenant(
        tenantId,
        `SELECT id FROM tfrs
         WHERE id = ANY($1) AND status = 'active'
         AND effective_start <= $3 AND effective_end >= $2`,
        [
          tfrConflicts.map((t: any) => t.id),
          fp.departureTime,
          fp.estimatedArrivalTime,
        ]
      );

      if (activeTfrResult.rows.length > 0) {
        throw new ValidationError(
          `Cannot authorize: ${activeTfrResult.rows.length} active TFR conflict(s) remain unresolved.`,
          { activeTfrs: activeTfrResult.rows.map((r: any) => r.id) }
        );
      }
    }

    // Set authorization window (departure - 30min to arrival + 30min)
    const authWindowStart = new Date(new Date(fp.departureTime).getTime() - 30 * 60 * 1000);
    const authWindowEnd = new Date(new Date(fp.estimatedArrivalTime).getTime() + 30 * 60 * 1000);

    const result = await queryWithTenant(
      tenantId,
      `UPDATE flight_plans
       SET status = 'authorized',
           authorization_window_start = $1,
           authorization_window_end = $2,
           authorized_at = NOW(),
           updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING *,
         ST_AsGeoJSON(route_geometry)::jsonb AS route_geojson,
         ST_AsGeoJSON(corridor_geometry)::jsonb AS corridor_geojson`,
      [authWindowStart.toISOString(), authWindowEnd.toISOString(), flightPlanId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('FlightPlan', flightPlanId);
    }

    this.log.info({ flightPlanId }, 'Flight plan authorized');
    return this.mapFlightPlanRow(result.rows[0]);
  }

  /**
   * Deny authorization for a flight plan.
   */
  async denyFlightPlan(
    flightPlanId: UUID,
    tenantId: UUID,
    reason: string
  ): Promise<Record<string, any>> {
    this.log.info({ flightPlanId, tenantId, reason }, 'Denying flight plan');

    const fp = await this.getFlightPlan(flightPlanId, tenantId);

    if (fp.status !== 'filed' && fp.status !== 'pending_auth') {
      throw new ValidationError(
        `Cannot deny flight plan in '${fp.status}' status. Must be 'filed' or 'pending_auth'.`
      );
    }

    const result = await queryWithTenant(
      tenantId,
      `UPDATE flight_plans
       SET status = 'denied',
           denial_reason = $1,
           denied_at = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *,
         ST_AsGeoJSON(route_geometry)::jsonb AS route_geojson,
         ST_AsGeoJSON(corridor_geometry)::jsonb AS corridor_geojson`,
      [reason, flightPlanId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('FlightPlan', flightPlanId);
    }

    this.log.info({ flightPlanId, reason }, 'Flight plan denied');
    return this.mapFlightPlanRow(result.rows[0]);
  }

  /**
   * Activate a flight plan (mark as in-flight).
   */
  async activateFlightPlan(
    flightPlanId: UUID,
    tenantId: UUID
  ): Promise<Record<string, any>> {
    this.log.info({ flightPlanId, tenantId }, 'Activating flight plan');

    const fp = await this.getFlightPlan(flightPlanId, tenantId);

    if (fp.status !== 'authorized') {
      throw new ValidationError(
        `Cannot activate flight plan in '${fp.status}' status. Must be 'authorized'.`
      );
    }

    // Verify current time is within authorization window
    const now = new Date();
    if (fp.authorizationWindowStart && now < new Date(fp.authorizationWindowStart)) {
      throw new ValidationError(
        `Cannot activate: authorization window has not started yet. Opens at ${fp.authorizationWindowStart}.`
      );
    }
    if (fp.authorizationWindowEnd && now > new Date(fp.authorizationWindowEnd)) {
      throw new ValidationError(
        `Cannot activate: authorization window has expired at ${fp.authorizationWindowEnd}.`
      );
    }

    return withTransaction(tenantId, async (client: pg.PoolClient) => {
      // Set actual departure time, mark active
      const fpResult = await client.query(
        `UPDATE flight_plans
         SET status = 'active',
             actual_departure_time = NOW(),
             updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2
         RETURNING *,
           ST_AsGeoJSON(route_geometry)::jsonb AS route_geojson,
           ST_AsGeoJSON(corridor_geometry)::jsonb AS corridor_geojson`,
        [flightPlanId, tenantId]
      );

      // Update drone status to in_flight
      await client.query(
        `UPDATE drones
         SET status = 'in_flight', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2`,
        [fp.droneId, tenantId]
      );

      this.log.info({ flightPlanId, droneId: fp.droneId }, 'Flight plan activated');
      return this.mapFlightPlanRow(fpResult.rows[0]);
    });
  }

  /**
   * Update real-time position during an active flight.
   * Checks lateral and vertical deviations against the corridor.
   */
  async updatePosition(
    flightPlanId: UUID,
    tenantId: UUID,
    position: PositionUpdate
  ): Promise<{ deviationStatus: string; alerts: DeviationAlert[] }> {
    const fp = await this.getFlightPlan(flightPlanId, tenantId);

    if (fp.status !== 'active') {
      throw new ValidationError(
        `Cannot update position for flight plan in '${fp.status}' status. Must be 'active'.`
      );
    }

    // Update current position
    await queryWithTenant(
      tenantId,
      `UPDATE flight_plans
       SET current_position = $1,
           last_position_update = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [
        JSON.stringify({
          lat: position.lat,
          lng: position.lng,
          altFt: position.altFt,
          headingDeg: position.headingDeg,
          timestamp: new Date().toISOString(),
        }),
        flightPlanId,
        tenantId,
      ]
    );

    // Check lateral deviation
    const lateralResult = await queryWithTenant(
      tenantId,
      `SELECT ST_Distance(
         ST_MakePoint($1, $2)::geography,
         corridor_geometry::geography
       ) AS lateral_deviation_m
       FROM flight_plans
       WHERE id = $3 AND tenant_id = $4`,
      [position.lng, position.lat, flightPlanId, tenantId]
    );

    const lateralDeviationM = parseFloat(lateralResult.rows[0]?.lateral_deviation_m ?? '0');

    // Check vertical deviation
    const verticalDeviationFt = Math.abs(position.altFt - fp.cruiseAltitudeFt);

    const alerts: DeviationAlert[] = [];
    const timestamp = new Date().toISOString();

    if (lateralDeviationM > LATERAL_DEVIATION_THRESHOLD_M) {
      const alert: DeviationAlert = {
        type: 'lateral',
        severity: lateralDeviationM > LATERAL_DEVIATION_THRESHOLD_M * 3 ? 'critical' : 'warning',
        message: `Lateral deviation of ${lateralDeviationM.toFixed(1)}m exceeds ${LATERAL_DEVIATION_THRESHOLD_M}m threshold`,
        deviationValue: lateralDeviationM,
        thresholdValue: LATERAL_DEVIATION_THRESHOLD_M,
        position: { lat: position.lat, lng: position.lng, altFt: position.altFt },
        timestamp,
      };
      alerts.push(alert);
      await this.addDeviationAlert(flightPlanId, tenantId, alert);
    }

    if (verticalDeviationFt > VERTICAL_DEVIATION_THRESHOLD_FT) {
      const alert: DeviationAlert = {
        type: 'vertical',
        severity: verticalDeviationFt > VERTICAL_DEVIATION_THRESHOLD_FT * 3 ? 'critical' : 'warning',
        message: `Vertical deviation of ${verticalDeviationFt.toFixed(0)}ft exceeds ${VERTICAL_DEVIATION_THRESHOLD_FT}ft threshold`,
        deviationValue: verticalDeviationFt,
        thresholdValue: VERTICAL_DEVIATION_THRESHOLD_FT,
        position: { lat: position.lat, lng: position.lng, altFt: position.altFt },
        timestamp,
      };
      alerts.push(alert);
      await this.addDeviationAlert(flightPlanId, tenantId, alert);
    }

    const deviationStatus =
      alerts.some((a) => a.severity === 'critical') ? 'critical' :
      alerts.length > 0 ? 'warning' : 'nominal';

    return { deviationStatus, alerts };
  }

  /**
   * Close a flight plan (completed, cancelled, emergency, diverted).
   */
  async closeFlightPlan(
    flightPlanId: UUID,
    tenantId: UUID,
    reason: CloseReason
  ): Promise<Record<string, any>> {
    this.log.info({ flightPlanId, tenantId, reason }, 'Closing flight plan');

    const fp = await this.getFlightPlan(flightPlanId, tenantId);

    const allowedStatuses: FlightPlanStatus[] = ['active', 'authorized', 'filed', 'pending_auth'];
    if (!allowedStatuses.includes(fp.status as FlightPlanStatus)) {
      throw new ValidationError(
        `Cannot close flight plan in '${fp.status}' status.`
      );
    }

    const closeStatus: FlightPlanStatus =
      reason === 'completed' ? 'completed' :
      reason === 'cancelled' ? 'cancelled' :
      reason === 'emergency' ? 'emergency' :
      'diverted';

    return withTransaction(tenantId, async (client: pg.PoolClient) => {
      // Calculate actual vs planned metrics
      const actualDepartureTime = fp.actualDepartureTime ? new Date(fp.actualDepartureTime) : null;
      const now = new Date();
      const actualDurationMinutes = actualDepartureTime
        ? (now.getTime() - actualDepartureTime.getTime()) / (1000 * 60)
        : null;

      const estimatedDurationMinutes =
        (new Date(fp.estimatedArrivalTime).getTime() - new Date(fp.departureTime).getTime()) / (1000 * 60);

      const fpResult = await client.query(
        `UPDATE flight_plans
         SET status = $1,
             actual_arrival_time = NOW(),
             closed_at = NOW(),
             close_reason = $2,
             actual_duration_minutes = $3,
             estimated_duration_minutes = $4,
             updated_at = NOW()
         WHERE id = $5 AND tenant_id = $6
         RETURNING *,
           ST_AsGeoJSON(route_geometry)::jsonb AS route_geojson,
           ST_AsGeoJSON(corridor_geometry)::jsonb AS corridor_geojson`,
        [
          closeStatus,
          reason,
          actualDurationMinutes,
          estimatedDurationMinutes,
          flightPlanId,
          tenantId,
        ]
      );

      // Update drone status back to available
      if (fp.status === 'active') {
        await client.query(
          `UPDATE drones
           SET status = 'available', updated_at = NOW()
           WHERE id = $1 AND tenant_id = $2`,
          [fp.droneId, tenantId]
        );
      }

      this.log.info(
        { flightPlanId, reason, actualDurationMinutes: actualDurationMinutes?.toFixed(1) },
        'Flight plan closed'
      );

      return this.mapFlightPlanRow(fpResult.rows[0]);
    });
  }

  /**
   * Get a flight plan by ID with waypoints and deviation alerts.
   */
  async getFlightPlan(
    flightPlanId: UUID,
    tenantId: UUID
  ): Promise<Record<string, any>> {
    const result = await queryWithTenant(
      tenantId,
      `SELECT fp.*,
         ST_AsGeoJSON(fp.route_geometry)::jsonb AS route_geojson,
         ST_AsGeoJSON(fp.corridor_geometry)::jsonb AS corridor_geojson
       FROM flight_plans fp
       WHERE fp.id = $1 AND fp.tenant_id = $2`,
      [flightPlanId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('FlightPlan', flightPlanId);
    }

    const flightPlan = this.mapFlightPlanRow(result.rows[0]);

    // Fetch waypoints
    const waypointResult = await queryWithTenant(
      tenantId,
      `SELECT * FROM flight_plan_waypoints
       WHERE flight_plan_id = $1 AND tenant_id = $2
       ORDER BY sequence_number ASC`,
      [flightPlanId, tenantId]
    );
    flightPlan.waypoints = waypointResult.rows.map((row: any) => this.mapWaypointRow(row));

    // Fetch deviation alerts
    const alertResult = await queryWithTenant(
      tenantId,
      `SELECT * FROM flight_plan_deviation_alerts
       WHERE flight_plan_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC`,
      [flightPlanId, tenantId]
    );
    flightPlan.deviationAlerts = alertResult.rows.map((row: any) => ({
      id: row.id,
      type: row.alert_type,
      severity: row.severity,
      message: row.message,
      deviationValue: row.deviation_value,
      thresholdValue: row.threshold_value,
      position: this.parseJson(row.position, {}),
      resolved: row.resolved,
      resolvedAt: row.resolved_at,
      resolution: row.resolution,
      createdAt: row.created_at,
    }));

    return flightPlan;
  }

  /**
   * List flight plans with pagination and filters.
   */
  async listFlightPlans(
    tenantId: UUID,
    filters: ListFlightPlansFilters = {}
  ): Promise<PaginatedResponse<Record<string, any>>> {
    const {
      status,
      type,
      pilotId,
      droneId,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 25,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const conditions: string[] = ['tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramIndex = 2;

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      conditions.push(`status = ANY($${paramIndex})`);
      params.push(statuses);
      paramIndex++;
    }

    if (type) {
      conditions.push(`flight_plan_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (pilotId) {
      conditions.push(`pilot_id = $${paramIndex}`);
      params.push(pilotId);
      paramIndex++;
    }

    if (droneId) {
      conditions.push(`drone_id = $${paramIndex}`);
      params.push(droneId);
      paramIndex++;
    }

    if (dateFrom) {
      conditions.push(`departure_time >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      conditions.push(`estimated_arrival_time <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const allowedSortColumns: Record<string, string> = {
      created_at: 'created_at',
      departure_time: 'departure_time',
      flight_plan_number: 'flight_plan_number',
      status: 'status',
    };
    const sortColumn = allowedSortColumns[sortBy] ?? 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*) AS count FROM flight_plans WHERE ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const dataResult = await queryWithTenant(
      tenantId,
      `SELECT *,
         ST_AsGeoJSON(route_geometry)::jsonb AS route_geojson,
         ST_AsGeoJSON(corridor_geometry)::jsonb AS corridor_geojson
       FROM flight_plans
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: dataResult.rows.map((row: any) => this.mapFlightPlanRow(row)),
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
   * Get all currently active flight plans.
   */
  async getActiveFlightPlans(tenantId: UUID): Promise<Record<string, any>[]> {
    const result = await queryWithTenant(
      tenantId,
      `SELECT *,
         ST_AsGeoJSON(route_geometry)::jsonb AS route_geojson,
         ST_AsGeoJSON(corridor_geometry)::jsonb AS corridor_geojson
       FROM flight_plans
       WHERE tenant_id = $1 AND status = 'active'
       ORDER BY actual_departure_time ASC`,
      [tenantId]
    );

    return result.rows.map((row: any) => this.mapFlightPlanRow(row));
  }

  /**
   * Check if a route conflicts with airspace, TFRs, and NOTAMs.
   */
  async checkAirspaceConflicts(
    tenantId: UUID,
    waypoints: Waypoint[],
    proposedDepartureTime: string,
    proposedArrivalTime: string,
    altitudeFt: number
  ): Promise<{
    airspaceConflicts: AirspaceConflict[];
    tfrConflicts: any[];
    notamConflicts: any[];
    requiresAuthorization: boolean;
  }> {
    if (waypoints.length < 2) {
      throw new ValidationError('At least 2 waypoints are required for airspace check.');
    }

    const pointsSql = waypoints
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map((wp) => `ST_MakePoint(${wp.longitude}, ${wp.latitude})`)
      .join(', ');

    const routeSql = `ST_MakeLine(ARRAY[${pointsSql}])`;

    // Check airspace
    const airspaceResult = await queryWithTenant(
      tenantId,
      `SELECT
         ug.id AS airspace_id,
         ug.airspace_class,
         ug.facility_name AS airspace_name,
         ug.ceiling_ft,
         CASE
           WHEN ug.airspace_class IN ('B', 'C', 'D') THEN true
           WHEN ug.airspace_class = 'E' AND $1 > 400 THEN true
           ELSE false
         END AS requires_authorization,
         CASE
           WHEN ug.airspace_class IN ('B', 'C', 'D') AND ug.laanc_enabled = true THEN 'laanc_auto'
           WHEN ug.airspace_class IN ('B', 'C', 'D') AND ug.laanc_enabled = false THEN 'laanc_further'
           ELSE NULL
         END AS authorization_type,
         ug.ceiling_ft AS max_altitude_ft
       FROM uasfm_grids ug
       WHERE ST_Intersects(ug.geometry, ${routeSql})
       AND ug.tenant_id = $2`,
      [altitudeFt, tenantId]
    );

    const airspaceConflicts: AirspaceConflict[] = airspaceResult.rows.map((row: any) => ({
      airspaceId: row.airspace_id,
      airspaceClass: row.airspace_class,
      airspaceName: row.airspace_name,
      requiresAuthorization: row.requires_authorization,
      authorizationType: row.authorization_type,
      maxAltitudeFt: row.max_altitude_ft,
    }));

    // Check TFRs
    const tfrResult = await queryWithTenant(
      tenantId,
      `SELECT id, notam_number, description, effective_start, effective_end
       FROM tfrs
       WHERE ST_Intersects(geometry, ${routeSql})
         AND effective_start <= $2
         AND effective_end >= $1
         AND status = 'active'`,
      [proposedDepartureTime, proposedArrivalTime]
    );

    // Check NOTAMs
    const notamResult = await queryWithTenant(
      tenantId,
      `SELECT id, notam_number, description, effective_start, effective_end, type
       FROM notams
       WHERE ST_Intersects(geometry, ${routeSql})
         AND effective_start <= $2
         AND effective_end >= $1
         AND status = 'active'`,
      [proposedDepartureTime, proposedArrivalTime]
    );

    return {
      airspaceConflicts,
      tfrConflicts: tfrResult.rows,
      notamConflicts: notamResult.rows,
      requiresAuthorization: airspaceConflicts.some((c) => c.requiresAuthorization),
    };
  }

  /**
   * Record a deviation alert for an active flight plan.
   */
  async addDeviationAlert(
    flightPlanId: UUID,
    tenantId: UUID,
    alert: DeviationAlert
  ): Promise<{ id: UUID }> {
    const result = await queryWithTenant(
      tenantId,
      `INSERT INTO flight_plan_deviation_alerts (
         flight_plan_id, tenant_id, alert_type, severity,
         message, deviation_value, threshold_value,
         position, resolved
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
       RETURNING id`,
      [
        flightPlanId,
        tenantId,
        alert.type,
        alert.severity,
        alert.message,
        alert.deviationValue,
        alert.thresholdValue,
        JSON.stringify(alert.position),
      ]
    );

    this.log.warn(
      { flightPlanId, alertType: alert.type, severity: alert.severity },
      'Deviation alert created'
    );

    return { id: result.rows[0].id };
  }

  /**
   * Resolve a deviation alert.
   */
  async resolveDeviationAlert(
    alertId: UUID,
    tenantId: UUID,
    resolution: string
  ): Promise<Record<string, any>> {
    const result = await queryWithTenant(
      tenantId,
      `UPDATE flight_plan_deviation_alerts
       SET resolved = true,
           resolved_at = NOW(),
           resolution = $1,
           updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [resolution, alertId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('DeviationAlert', alertId);
    }

    this.log.info({ alertId, resolution }, 'Deviation alert resolved');
    return result.rows[0];
  }

  /**
   * Get flight plan statistics for a tenant.
   */
  async getFlightPlanStats(
    tenantId: UUID,
    period?: { from: string; to: string }
  ): Promise<FlightPlanStats> {
    const dateCondition = period
      ? `AND created_at >= '${period.from}' AND created_at <= '${period.to}'`
      : '';

    // Status counts
    const statusResult = await queryWithTenant(
      tenantId,
      `SELECT status, COUNT(*)::int AS count
       FROM flight_plans
       WHERE tenant_id = $1 ${dateCondition}
       GROUP BY status`,
      [tenantId]
    );

    const statusCounts: Record<string, number> = {};
    for (const row of statusResult.rows) {
      statusCounts[row.status] = row.count;
    }

    // Duration metrics
    const durationResult = await queryWithTenant(
      tenantId,
      `SELECT
         AVG(actual_duration_minutes)::numeric(10,1) AS avg_actual,
         AVG(estimated_duration_minutes)::numeric(10,1) AS avg_estimated
       FROM flight_plans
       WHERE tenant_id = $1 AND status = 'completed' ${dateCondition}`,
      [tenantId]
    );

    // Most common airspaces
    const airspaceStatsResult = await queryWithTenant(
      tenantId,
      `SELECT
         conflict->>'airspaceName' AS airspace_name,
         COUNT(*)::int AS count
       FROM flight_plans,
         jsonb_array_elements(airspace_conflicts::jsonb) AS conflict
       WHERE tenant_id = $1 ${dateCondition}
       GROUP BY conflict->>'airspaceName'
       ORDER BY count DESC
       LIMIT 10`,
      [tenantId]
    );

    // Deviation rate
    const deviationResult = await queryWithTenant(
      tenantId,
      `SELECT
         COUNT(DISTINCT da.flight_plan_id)::int AS deviated_flights,
         (SELECT COUNT(*)::int FROM flight_plans WHERE tenant_id = $1 AND status IN ('completed', 'active') ${dateCondition}) AS total_flights
       FROM flight_plan_deviation_alerts da
       JOIN flight_plans fp ON da.flight_plan_id = fp.id
       WHERE da.tenant_id = $1 ${dateCondition}`,
      [tenantId]
    );

    const deviatedFlights = deviationResult.rows[0]?.deviated_flights ?? 0;
    const totalFlights = deviationResult.rows[0]?.total_flights ?? 0;

    return {
      totalFiled: statusCounts.filed ?? 0,
      totalAuthorized: statusCounts.authorized ?? 0,
      totalCompleted: statusCounts.completed ?? 0,
      totalDenied: statusCounts.denied ?? 0,
      totalDeviated: deviatedFlights,
      averageDurationMinutes: parseFloat(durationResult.rows[0]?.avg_actual ?? '0'),
      averageEstimatedDurationMinutes: parseFloat(durationResult.rows[0]?.avg_estimated ?? '0'),
      mostCommonAirspaces: airspaceStatsResult.rows.map((r: any) => ({
        airspaceName: r.airspace_name,
        count: r.count,
      })),
      deviationRate: totalFlights > 0 ? deviatedFlights / totalFlights : 0,
    };
  }

  /**
   * Batch job: expire flight plans past their authorization window end.
   */
  async expireAuthorizations(): Promise<{ expiredCount: number }> {
    this.log.info('Running authorization expiration batch job');

    const result = await queryWithTenant(
      'system', // Cross-tenant batch operation
      `UPDATE flight_plans
       SET status = 'expired',
           updated_at = NOW()
       WHERE status = 'authorized'
         AND authorization_window_end < NOW()
       RETURNING id, tenant_id, flight_plan_number`
    );

    const expiredCount = result.rows.length;

    if (expiredCount > 0) {
      this.log.info(
        { expiredCount, flightPlans: result.rows.map((r: any) => r.flight_plan_number) },
        'Expired flight plan authorizations'
      );
    }

    return { expiredCount };
  }

  // ─── Private Helpers ───

  private mapFlightPlanRow(row: Record<string, any>): Record<string, any> {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      pilotId: row.pilot_id,
      droneId: row.drone_id,
      flightPlanNumber: row.flight_plan_number,
      flightPlanType: row.flight_plan_type,
      status: row.status,
      departureTime: row.departure_time,
      estimatedArrivalTime: row.estimated_arrival_time,
      actualDepartureTime: row.actual_departure_time ?? undefined,
      actualArrivalTime: row.actual_arrival_time ?? undefined,
      cruiseAltitudeFt: row.cruise_altitude_ft,
      corridorWidthFt: row.corridor_width_ft,
      routeGeometry: row.route_geojson ?? undefined,
      corridorGeometry: row.corridor_geojson ?? undefined,
      totalDistanceNm: row.total_distance_nm,
      airspaceConflicts: this.parseJson(row.airspace_conflicts, []),
      tfrConflicts: this.parseJson(row.tfr_conflicts, []),
      notamConflicts: this.parseJson(row.notam_conflicts, []),
      nearbyAirports: this.parseJson(row.nearby_airports, []),
      currentPosition: this.parseJson(row.current_position, undefined),
      lastPositionUpdate: row.last_position_update ?? undefined,
      authorizationWindowStart: row.authorization_window_start ?? undefined,
      authorizationWindowEnd: row.authorization_window_end ?? undefined,
      authorizedAt: row.authorized_at ?? undefined,
      denialReason: row.denial_reason ?? undefined,
      deniedAt: row.denied_at ?? undefined,
      closedAt: row.closed_at ?? undefined,
      closeReason: row.close_reason ?? undefined,
      actualDurationMinutes: row.actual_duration_minutes ?? undefined,
      estimatedDurationMinutes: row.estimated_duration_minutes ?? undefined,
      remarks: row.remarks ?? undefined,
      pilotNotes: row.pilot_notes ?? undefined,
      alternateAirport: row.alternate_airport ?? undefined,
      fuelEnduranceMinutes: row.fuel_endurance_minutes ?? undefined,
      registrationId: row.registration_id ?? undefined,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapWaypointRow(row: Record<string, any>): Record<string, any> {
    return {
      id: row.id,
      sequenceNumber: row.sequence_number,
      latitude: row.latitude,
      longitude: row.longitude,
      altitudeFt: row.altitude_ft,
      speedKnots: row.speed_knots ?? undefined,
      holdTimeSeconds: row.hold_time_seconds ?? undefined,
      waypointType: row.waypoint_type,
      name: row.name ?? undefined,
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

export const flightPlanService = new FlightPlanService();
