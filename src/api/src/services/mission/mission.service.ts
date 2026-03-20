import { queryWithTenant, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, ValidationError, AppError } from '../../utils/errors.js';
import type {
  Mission,
  MissionStatus,
  MissionType,
  OperationType,
  PreflightCheckItem,
  FlightLog,
  RiskFactor,
  DEFAULT_PREFLIGHT_CHECKLIST,
} from '../../../../shared/types/mission.js';
import { DEFAULT_PREFLIGHT_CHECKLIST as PREFLIGHT_DEFAULTS } from '../../../../shared/types/mission.js';
import type { UUID, PaginatedResponse, GeoJSONPolygon, Coordinates, Altitude } from '../../../../shared/types/common.js';
import type pg from 'pg';

// ─── State Machine ───

const VALID_STATUS_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  draft: ['planned', 'cancelled'],
  planned: ['preflight_check', 'cancelled'],
  preflight_check: ['awaiting_authorization', 'planned', 'cancelled'],
  awaiting_authorization: ['authorized', 'planned', 'cancelled'],
  authorized: ['in_progress', 'cancelled'],
  in_progress: ['paused', 'completed', 'aborted'],
  paused: ['in_progress', 'aborted'],
  completed: [],
  aborted: [],
  cancelled: [],
};

// ─── Input DTOs ───

export interface CreateMissionInput {
  name: string;
  description?: string;
  type: MissionType;
  operationType: OperationType;
  fleetId?: UUID;
  pilotInCommandId: UUID;
  visualObserverIds?: UUID[];
  crewMembers?: Mission['crewMembers'];
  droneId: UUID;
  backupDroneId?: UUID;
  operationArea: GeoJSONPolygon;
  takeoffLocation: Coordinates;
  landingLocation: Coordinates;
  waypoints?: Mission['waypoints'];
  maxAltitude: Altitude;
  plannedAltitude: Altitude;
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  riskMitigations?: string[];
  notes?: string;
}

export interface UpdateMissionInput {
  name?: string;
  description?: string;
  type?: MissionType;
  operationType?: OperationType;
  pilotInCommandId?: UUID;
  visualObserverIds?: UUID[];
  crewMembers?: Mission['crewMembers'];
  droneId?: UUID;
  backupDroneId?: UUID;
  operationArea?: GeoJSONPolygon;
  takeoffLocation?: Coordinates;
  landingLocation?: Coordinates;
  waypoints?: Mission['waypoints'];
  maxAltitude?: Altitude;
  plannedAltitude?: Altitude;
  scheduledStart?: string;
  scheduledEnd?: string;
  timezone?: string;
  riskMitigations?: string[];
  notes?: string;
}

export interface ListMissionsFilters {
  status?: MissionStatus | MissionStatus[];
  type?: MissionType;
  pilotId?: UUID;
  droneId?: UUID;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'scheduled_start' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface FlightLogInput {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxAltitudeFt: number;
  maxSpeedMps: number;
  maxDistanceM: number;
  totalDistanceM: number;
  takeoffLocation: Coordinates;
  landingLocation: Coordinates;
  telemetryRecordCount: number;
  telemetryStorageUrl: string;
  batteryStartPercent: number;
  batteryEndPercent: number;
  remoteIdActive: boolean;
  postFlightNotes?: string;
}

// ─── Service ───

export class MissionService {
  private readonly log = logger.child({ service: 'MissionService' });

  /**
   * Create a new mission in draft status.
   */
  async createMission(
    tenantId: UUID,
    userId: UUID,
    data: CreateMissionInput
  ): Promise<Mission> {
    this.log.info({ tenantId, userId, name: data.name }, 'Creating mission');

    const result = await queryWithTenant<Mission>(
      tenantId,
      `INSERT INTO missions (
        tenant_id, fleet_id, name, description, type, operation_type, status,
        pilot_in_command_id, visual_observer_ids, crew_members,
        drone_id, backup_drone_id,
        operation_area, takeoff_location, landing_location, waypoints,
        max_altitude, planned_altitude,
        scheduled_start, scheduled_end, timezone,
        preflight_checklist, preflight_completed, weather_approved,
        risk_factors, risk_mitigations, incidents, attachments,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'draft',
        $7, $8, $9,
        $10, $11,
        ST_GeomFromGeoJSON($12), $13, $14, $15,
        $16, $17,
        $18, $19, $20,
        $21, false, false,
        '[]'::jsonb, $22, '[]'::jsonb, '{}',
        $23
      )
      RETURNING *,
        ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson`,
      [
        tenantId,
        data.fleetId ?? null,
        data.name,
        data.description ?? null,
        data.type,
        data.operationType,
        data.pilotInCommandId,
        data.visualObserverIds ?? [],
        JSON.stringify(data.crewMembers ?? []),
        data.droneId,
        data.backupDroneId ?? null,
        JSON.stringify(data.operationArea),
        JSON.stringify(data.takeoffLocation),
        JSON.stringify(data.landingLocation),
        JSON.stringify(data.waypoints ?? []),
        JSON.stringify(data.maxAltitude),
        JSON.stringify(data.plannedAltitude),
        data.scheduledStart,
        data.scheduledEnd,
        data.timezone,
        JSON.stringify(this.buildDefaultChecklist()),
        data.riskMitigations ?? [],
        userId,
      ]
    );

    this.log.info({ missionId: result.rows[0].id }, 'Mission created');
    return this.mapMissionRow(result.rows[0]);
  }

  /**
   * Get a mission by ID with all related data.
   */
  async getMission(id: UUID, tenantId: UUID): Promise<Mission> {
    const result = await queryWithTenant<Mission>(
      tenantId,
      `SELECT *,
        ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson
       FROM missions
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Mission', id);
    }

    return this.mapMissionRow(result.rows[0]);
  }

  /**
   * Update mission details. Only allowed in draft or planned status.
   */
  async updateMission(
    id: UUID,
    tenantId: UUID,
    data: UpdateMissionInput
  ): Promise<Mission> {
    const mission = await this.getMission(id, tenantId);

    if (!['draft', 'planned'].includes(mission.status)) {
      throw new ValidationError(
        `Cannot update mission in '${mission.status}' status. Only draft or planned missions can be edited.`
      );
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, { column: string; transform?: (v: any) => unknown }> = {
      name: { column: 'name' },
      description: { column: 'description' },
      type: { column: 'type' },
      operationType: { column: 'operation_type' },
      pilotInCommandId: { column: 'pilot_in_command_id' },
      visualObserverIds: { column: 'visual_observer_ids' },
      crewMembers: { column: 'crew_members', transform: JSON.stringify },
      droneId: { column: 'drone_id' },
      backupDroneId: { column: 'backup_drone_id' },
      operationArea: {
        column: 'operation_area',
        transform: (v: GeoJSONPolygon) => `ST_GeomFromGeoJSON('${JSON.stringify(v)}')`,
      },
      takeoffLocation: { column: 'takeoff_location', transform: JSON.stringify },
      landingLocation: { column: 'landing_location', transform: JSON.stringify },
      waypoints: { column: 'waypoints', transform: JSON.stringify },
      maxAltitude: { column: 'max_altitude', transform: JSON.stringify },
      plannedAltitude: { column: 'planned_altitude', transform: JSON.stringify },
      scheduledStart: { column: 'scheduled_start' },
      scheduledEnd: { column: 'scheduled_end' },
      timezone: { column: 'timezone' },
      riskMitigations: { column: 'risk_mitigations' },
      notes: { column: 'notes' },
    };

    for (const [key, config] of Object.entries(fieldMap)) {
      const value = (data as Record<string, unknown>)[key];
      if (value !== undefined) {
        // Special handling for PostGIS geometry
        if (key === 'operationArea') {
          setClauses.push(`operation_area = ST_GeomFromGeoJSON($${paramIndex})`);
          values.push(JSON.stringify(value));
        } else {
          setClauses.push(`${config.column} = $${paramIndex}`);
          values.push(config.transform ? config.transform(value) : value);
        }
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return mission;
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id, tenantId);

    const result = await queryWithTenant<Mission>(
      tenantId,
      `UPDATE missions SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *, ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Mission', id);
    }

    this.log.info({ missionId: id }, 'Mission updated');
    return this.mapMissionRow(result.rows[0]);
  }

  /**
   * List missions with pagination and filters.
   */
  async listMissions(
    tenantId: UUID,
    filters: ListMissionsFilters = {}
  ): Promise<PaginatedResponse<Mission>> {
    const {
      status,
      type,
      pilotId,
      droneId,
      dateFrom,
      dateTo,
      search,
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
      conditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (pilotId) {
      conditions.push(`pilot_in_command_id = $${paramIndex}`);
      params.push(pilotId);
      paramIndex++;
    }

    if (droneId) {
      conditions.push(`drone_id = $${paramIndex}`);
      params.push(droneId);
      paramIndex++;
    }

    if (dateFrom) {
      conditions.push(`scheduled_start >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      conditions.push(`scheduled_end <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const allowedSortColumns: Record<string, string> = {
      created_at: 'created_at',
      scheduled_start: 'scheduled_start',
      name: 'name',
      status: 'status',
    };
    const sortColumn = allowedSortColumns[sortBy] ?? 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*) as count FROM missions WHERE ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const dataResult = await queryWithTenant<Mission>(
      tenantId,
      `SELECT *, ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson
       FROM missions
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: dataResult.rows.map((row) => this.mapMissionRow(row)),
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
   * Transition mission status with validation against the state machine.
   */
  async updateStatus(id: UUID, tenantId: UUID, newStatus: MissionStatus): Promise<Mission> {
    const mission = await this.getMission(id, tenantId);

    const allowed = VALID_STATUS_TRANSITIONS[mission.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition mission from '${mission.status}' to '${newStatus}'. ` +
        `Allowed transitions: ${allowed?.join(', ') || 'none'}`
      );
    }

    const result = await queryWithTenant<Mission>(
      tenantId,
      `UPDATE missions
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *, ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson`,
      [newStatus, id, tenantId]
    );

    this.log.info(
      { missionId: id, previousStatus: mission.status, newStatus },
      'Mission status updated'
    );

    return this.mapMissionRow(result.rows[0]);
  }

  /**
   * Complete the preflight checklist for a mission.
   */
  async completePreflight(
    id: UUID,
    tenantId: UUID,
    userId: UUID,
    checklist: PreflightCheckItem[]
  ): Promise<Mission> {
    const mission = await this.getMission(id, tenantId);

    if (mission.status !== 'preflight_check') {
      throw new ValidationError(
        `Mission must be in 'preflight_check' status to complete preflight. Current status: '${mission.status}'`
      );
    }

    // Validate all required items are checked
    const uncheckedRequired = checklist.filter((item) => item.required && !item.checked);
    if (uncheckedRequired.length > 0) {
      throw new ValidationError(
        `Cannot complete preflight: ${uncheckedRequired.length} required item(s) are not checked`,
        { uncheckedItems: uncheckedRequired.map((i) => i.id) }
      );
    }

    const result = await queryWithTenant<Mission>(
      tenantId,
      `UPDATE missions
       SET preflight_checklist = $1,
           preflight_completed = true,
           preflight_completed_at = NOW(),
           preflight_completed_by = $2,
           updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING *, ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson`,
      [JSON.stringify(checklist), userId, id, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Mission', id);
    }

    this.log.info({ missionId: id, userId }, 'Preflight checklist completed');
    return this.mapMissionRow(result.rows[0]);
  }

  /**
   * Start a mission. Validates all prerequisites are met.
   */
  async startMission(id: UUID, tenantId: UUID): Promise<Mission> {
    const mission = await this.getMission(id, tenantId);

    if (mission.status !== 'authorized') {
      throw new ValidationError(
        `Mission must be in 'authorized' status to start. Current status: '${mission.status}'`
      );
    }

    // Validate prerequisites
    const errors: string[] = [];

    if (!mission.preflightCompleted) {
      errors.push('Preflight checklist has not been completed');
    }

    if (!mission.weatherApproved) {
      errors.push('Weather has not been approved');
    }

    if (
      mission.laancStatus &&
      mission.laancStatus !== 'not_required' &&
      mission.laancStatus !== 'approved'
    ) {
      errors.push(`LAANC authorization is '${mission.laancStatus}', must be approved or not required`);
    }

    if (errors.length > 0) {
      throw new ValidationError(
        `Cannot start mission: prerequisites not met`,
        { prerequisites: errors }
      );
    }

    const result = await withTransaction<Mission>(tenantId, async (client: pg.PoolClient) => {
      // Update mission status and record actual start time
      const missionResult = await client.query<Mission>(
        `UPDATE missions
         SET status = 'in_progress',
             actual_start = NOW(),
             updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2
         RETURNING *, ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson`,
        [id, tenantId]
      );

      // Update drone status to in_flight
      await client.query(
        `UPDATE drones
         SET status = 'in_flight', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2`,
        [mission.droneId, tenantId]
      );

      return missionResult.rows[0];
    });

    this.log.info({ missionId: id }, 'Mission started');
    return this.mapMissionRow(result);
  }

  /**
   * Complete a mission and record the flight log.
   */
  async completeMission(
    id: UUID,
    tenantId: UUID,
    flightLogInput: FlightLogInput
  ): Promise<Mission> {
    const mission = await this.getMission(id, tenantId);

    if (mission.status !== 'in_progress' && mission.status !== 'paused') {
      throw new ValidationError(
        `Mission must be in 'in_progress' or 'paused' status to complete. Current status: '${mission.status}'`
      );
    }

    const result = await withTransaction<Mission>(tenantId, async (client: pg.PoolClient) => {
      // Insert flight log
      const flightLogResult = await client.query<{ id: UUID }>(
        `INSERT INTO flight_logs (
          mission_id, drone_id, pilot_id, tenant_id,
          start_time, end_time, duration_minutes,
          max_altitude_ft, max_speed_mps, max_distance_m, total_distance_m,
          takeoff_location, landing_location,
          telemetry_record_count, telemetry_storage_url,
          battery_start_percent, battery_end_percent,
          remote_id_active, incidents, post_flight_notes
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13,
          $14, $15,
          $16, $17,
          $18, '[]'::jsonb, $19
        )
        RETURNING id`,
        [
          id,
          mission.droneId,
          mission.pilotInCommandId,
          tenantId,
          flightLogInput.startTime,
          flightLogInput.endTime,
          flightLogInput.durationMinutes,
          flightLogInput.maxAltitudeFt,
          flightLogInput.maxSpeedMps,
          flightLogInput.maxDistanceM,
          flightLogInput.totalDistanceM,
          JSON.stringify(flightLogInput.takeoffLocation),
          JSON.stringify(flightLogInput.landingLocation),
          flightLogInput.telemetryRecordCount,
          flightLogInput.telemetryStorageUrl,
          flightLogInput.batteryStartPercent,
          flightLogInput.batteryEndPercent,
          flightLogInput.remoteIdActive,
          flightLogInput.postFlightNotes ?? null,
        ]
      );

      // Update mission with completion details
      const missionResult = await client.query<Mission>(
        `UPDATE missions
         SET status = 'completed',
             actual_end = NOW(),
             flight_log = (SELECT row_to_json(fl) FROM flight_logs fl WHERE fl.id = $1),
             updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING *, ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson`,
        [flightLogResult.rows[0].id, id, tenantId]
      );

      // Update drone stats and status
      await client.query(
        `UPDATE drones
         SET status = 'active',
             total_flight_hours = total_flight_hours + ($1::numeric / 60.0),
             total_flights = total_flights + 1,
             last_flight_at = NOW(),
             updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3`,
        [flightLogInput.durationMinutes, mission.droneId, tenantId]
      );

      // Update pilot stats
      await client.query(
        `UPDATE pilot_profiles
         SET total_flight_hours = total_flight_hours + ($1::numeric / 60.0),
             total_flights = total_flights + 1,
             active_missions = array_remove(active_missions, $2),
             updated_at = NOW()
         WHERE user_id = $3 AND tenant_id = $4`,
        [flightLogInput.durationMinutes, id, mission.pilotInCommandId, tenantId]
      );

      return missionResult.rows[0];
    });

    this.log.info(
      { missionId: id, durationMinutes: flightLogInput.durationMinutes },
      'Mission completed'
    );

    return this.mapMissionRow(result);
  }

  /**
   * Emergency abort a mission.
   */
  async abortMission(id: UUID, tenantId: UUID, reason: string): Promise<Mission> {
    const mission = await this.getMission(id, tenantId);

    if (mission.status !== 'in_progress' && mission.status !== 'paused') {
      throw new ValidationError(
        `Mission must be in 'in_progress' or 'paused' status to abort. Current status: '${mission.status}'`
      );
    }

    const result = await withTransaction<Mission>(tenantId, async (client: pg.PoolClient) => {
      const missionResult = await client.query<Mission>(
        `UPDATE missions
         SET status = 'aborted',
             actual_end = NOW(),
             notes = COALESCE(notes, '') || E'\n[ABORT] ' || $1,
             updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING *, ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson`,
        [reason, id, tenantId]
      );

      // Return drone to active status
      await client.query(
        `UPDATE drones
         SET status = 'active', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2`,
        [mission.droneId, tenantId]
      );

      return missionResult.rows[0];
    });

    this.log.warn({ missionId: id, reason }, 'Mission aborted');
    return this.mapMissionRow(result);
  }

  /**
   * Get the preflight checklist for a mission, initializing with defaults if empty.
   */
  async getPreflightChecklist(missionId: UUID): Promise<PreflightCheckItem[]> {
    const result = await queryWithTenant<{ preflight_checklist: PreflightCheckItem[]; tenant_id: string }>(
      missionId, // tenant resolved via RLS
      `SELECT preflight_checklist, tenant_id FROM missions WHERE id = $1`,
      [missionId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Mission', missionId);
    }

    const checklist = result.rows[0].preflight_checklist;
    if (!checklist || (Array.isArray(checklist) && checklist.length === 0)) {
      return this.buildDefaultChecklist();
    }

    return typeof checklist === 'string' ? JSON.parse(checklist) : checklist;
  }

  /**
   * Calculate risk score for a mission based on multiple factors.
   */
  async calculateRiskScore(missionId: UUID): Promise<{ score: number; factors: RiskFactor[] }> {
    // Fetch mission with tenant context from RLS
    const missionResult = await queryWithTenant<Mission & { operation_area_geojson: any }>(
      missionId,
      `SELECT *,
        ST_AsGeoJSON(operation_area)::jsonb AS operation_area_geojson
       FROM missions WHERE id = $1`,
      [missionId]
    );

    if (missionResult.rows.length === 0) {
      throw new NotFoundError('Mission', missionId);
    }

    const mission = this.mapMissionRow(missionResult.rows[0]);
    const factors: RiskFactor[] = [];

    // Altitude risk
    const altFt = mission.maxAltitude.value;
    if (altFt > 300) {
      factors.push({
        category: 'airspace',
        description: 'Operating above 300ft AGL increases airspace conflict risk',
        severity: 'high',
        likelihood: 'possible',
        score: 8,
        mitigation: 'Obtain appropriate airspace authorization',
      });
    } else if (altFt > 200) {
      factors.push({
        category: 'airspace',
        description: 'Operating between 200-300ft AGL',
        severity: 'medium',
        likelihood: 'possible',
        score: 5,
      });
    }

    // LAANC authorization risk
    if (mission.laancStatus && mission.laancStatus !== 'approved' && mission.laancStatus !== 'not_required') {
      factors.push({
        category: 'regulatory',
        description: `LAANC authorization status is '${mission.laancStatus}'`,
        severity: 'critical',
        likelihood: 'certain',
        score: 10,
        mitigation: 'Obtain LAANC authorization before flight',
      });
    }

    // Duration risk
    const startMs = new Date(mission.scheduledStart).getTime();
    const endMs = new Date(mission.scheduledEnd).getTime();
    const durationHours = (endMs - startMs) / (1000 * 60 * 60);
    if (durationHours > 4) {
      factors.push({
        category: 'crew',
        description: 'Extended flight duration increases pilot fatigue risk',
        severity: 'medium',
        likelihood: 'likely',
        score: 6,
        mitigation: 'Schedule crew rotations and rest breaks',
      });
    }

    // Equipment risk - check drone status
    const droneResult = await queryWithTenant<{ status: string; next_maintenance_due: string }>(
      mission.tenantId,
      `SELECT status, next_maintenance_due FROM drones WHERE id = $1 AND tenant_id = $2`,
      [mission.droneId, mission.tenantId]
    );

    if (droneResult.rows.length > 0) {
      const drone = droneResult.rows[0];
      if (drone.next_maintenance_due && new Date(drone.next_maintenance_due) <= new Date()) {
        factors.push({
          category: 'equipment',
          description: 'Drone is overdue for maintenance',
          severity: 'high',
          likelihood: 'certain',
          score: 9,
          mitigation: 'Complete maintenance before mission',
        });
      }
    }

    // Weather risk
    if (mission.weatherCheck) {
      const wx = mission.weatherCheck;
      if (wx.windGustMph > 25) {
        factors.push({
          category: 'weather',
          description: `Wind gusts of ${wx.windGustMph} mph exceed safe operating limits`,
          severity: 'high',
          likelihood: 'certain',
          score: 9,
          mitigation: 'Postpone mission until wind conditions improve',
        });
      } else if (wx.windSpeedMph > 15) {
        factors.push({
          category: 'weather',
          description: `Sustained winds of ${wx.windSpeedMph} mph may affect stability`,
          severity: 'medium',
          likelihood: 'likely',
          score: 5,
        });
      }

      if (wx.visibility < 3) {
        factors.push({
          category: 'weather',
          description: 'Reduced visibility below 3 statute miles',
          severity: 'high',
          likelihood: 'certain',
          score: 8,
          mitigation: 'Postpone until visibility improves',
        });
      }
    }

    // Calculate overall score (weighted average, capped at 10)
    const totalScore = factors.length > 0
      ? Math.min(10, Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length))
      : 1;

    // Persist risk assessment
    await queryWithTenant(
      mission.tenantId,
      `UPDATE missions
       SET risk_score = $1, risk_factors = $2, updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4`,
      [totalScore, JSON.stringify(factors), missionId, mission.tenantId]
    );

    this.log.info({ missionId, riskScore: totalScore, factorCount: factors.length }, 'Risk score calculated');

    return { score: totalScore, factors };
  }

  // ─── Private Helpers ───

  private buildDefaultChecklist(): PreflightCheckItem[] {
    return PREFLIGHT_DEFAULTS.map((item) => ({
      ...item,
      checked: false,
      checkedBy: undefined,
      checkedAt: undefined,
    }));
  }

  private mapMissionRow(row: Record<string, any>): Mission {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      fleetId: row.fleet_id ?? row.fleetId ?? undefined,
      name: row.name,
      description: row.description ?? undefined,
      type: row.type,
      operationType: row.operation_type ?? row.operationType,
      status: row.status,
      pilotInCommandId: row.pilot_in_command_id ?? row.pilotInCommandId,
      visualObserverIds: row.visual_observer_ids ?? row.visualObserverIds ?? [],
      crewMembers: this.parseJson(row.crew_members ?? row.crewMembers, []),
      droneId: row.drone_id ?? row.droneId,
      backupDroneId: row.backup_drone_id ?? row.backupDroneId ?? undefined,
      operationArea: row.operation_area_geojson ?? row.operation_area ?? row.operationArea,
      takeoffLocation: this.parseJson(row.takeoff_location ?? row.takeoffLocation, {}),
      landingLocation: this.parseJson(row.landing_location ?? row.landingLocation, {}),
      waypoints: this.parseJson(row.waypoints, []),
      maxAltitude: this.parseJson(row.max_altitude ?? row.maxAltitude, { value: 400, unit: 'feet', reference: 'AGL' }),
      plannedAltitude: this.parseJson(row.planned_altitude ?? row.plannedAltitude, { value: 200, unit: 'feet', reference: 'AGL' }),
      scheduledStart: row.scheduled_start ?? row.scheduledStart,
      scheduledEnd: row.scheduled_end ?? row.scheduledEnd,
      actualStart: row.actual_start ?? row.actualStart ?? undefined,
      actualEnd: row.actual_end ?? row.actualEnd ?? undefined,
      timezone: row.timezone,
      laancAuthorizationId: row.laanc_authorization_id ?? row.laancAuthorizationId ?? undefined,
      laancStatus: row.laanc_status ?? row.laancStatus ?? undefined,
      manualAuthorizationId: row.manual_authorization_id ?? row.manualAuthorizationId ?? undefined,
      waiverIds: row.waiver_ids ?? row.waiverIds ?? undefined,
      preflightChecklist: this.parseJson(row.preflight_checklist ?? row.preflightChecklist, []),
      preflightCompleted: row.preflight_completed ?? row.preflightCompleted ?? false,
      preflightCompletedAt: row.preflight_completed_at ?? row.preflightCompletedAt ?? undefined,
      preflightCompletedBy: row.preflight_completed_by ?? row.preflightCompletedBy ?? undefined,
      weatherCheck: this.parseJson(row.weather_check ?? row.weatherCheck, undefined),
      weatherApproved: row.weather_approved ?? row.weatherApproved ?? false,
      riskScore: row.risk_score ?? row.riskScore ?? undefined,
      riskFactors: this.parseJson(row.risk_factors ?? row.riskFactors, []),
      riskMitigations: row.risk_mitigations ?? row.riskMitigations ?? [],
      flightLog: this.parseJson(row.flight_log ?? row.flightLog, undefined),
      incidents: this.parseJson(row.incidents, []),
      notes: row.notes ?? undefined,
      attachments: row.attachments ?? [],
      approvedBy: row.approved_by ?? row.approvedBy ?? undefined,
      approvedAt: row.approved_at ?? row.approvedAt ?? undefined,
      createdBy: row.created_by ?? row.createdBy,
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

export const missionService = new MissionService();
