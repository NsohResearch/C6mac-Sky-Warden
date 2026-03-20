import { queryWithTenant } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, ValidationError, AppError } from '../../utils/errors.js';
import type {
  Drone,
  DroneStatus,
  DroneTelemetry,
} from '../../../../shared/types/fleet.js';
import type { UUID, GeoJSONPoint, PaginatedResponse } from '../../../../shared/types/common.js';

// ─── Input DTOs ───

export interface CreateDroneInput {
  serialNumber: string;
  manufacturer: string;
  model: string;
  nickname?: string;
  category: Drone['category'];
  weightGrams: number;
  maxAltitudeFt: number;
  maxRangeMeters: number;
  maxFlightTimeMinutes: number;
  maxSpeedMps: number;
  hasCamera: boolean;
  cameraSpecs?: Drone['cameraSpecs'];
  sensors?: string[];
  faaRegistrationNumber: string;
  faaRegistrationExpiry: string;
  registeredOwner: UUID;
  remoteIdType: Drone['remoteIdType'];
  remoteIdSerialNumber?: string;
  remoteIdDeclarationId?: string;
  remoteIdCompliant: boolean;
  homeLocation?: Drone['homeLocation'];
  maintenanceIntervalHours?: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateDroneInput {
  nickname?: string;
  maxAltitudeFt?: number;
  maxRangeMeters?: number;
  maxFlightTimeMinutes?: number;
  maxSpeedMps?: number;
  hasCamera?: boolean;
  cameraSpecs?: Drone['cameraSpecs'];
  sensors?: string[];
  faaRegistrationNumber?: string;
  faaRegistrationExpiry?: string;
  remoteIdType?: Drone['remoteIdType'];
  remoteIdSerialNumber?: string;
  remoteIdDeclarationId?: string;
  remoteIdCompliant?: boolean;
  homeLocation?: Drone['homeLocation'];
  firmwareVersion?: string;
  nextMaintenanceDue?: string;
  maintenanceIntervalHours?: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ListDronesFilters {
  status?: DroneStatus | DroneStatus[];
  tags?: string[];
  category?: Drone['category'];
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'nickname' | 'serial_number' | 'status' | 'last_flight_at';
  sortOrder?: 'asc' | 'desc';
}

export interface DroneLocationUpdate {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface TelemetryInput {
  timestamp: string;
  position: GeoJSONPoint;
  altitudeFt: number;
  altitudeReference: 'AGL' | 'MSL';
  groundSpeedMps: number;
  headingDeg: number;
  verticalSpeedMps: number;
  batteryPercent: number;
  batteryVoltage: number;
  signalStrength: number;
  satelliteCount: number;
  homeDistanceM: number;
  windSpeedMps?: number;
  windDirection?: number;
  temperature?: number;
  motors?: DroneTelemetry['motors'];
  warnings?: DroneTelemetry['warnings'];
}

export interface FleetOverview {
  totalDrones: number;
  activeCount: number;
  inFlightCount: number;
  groundedCount: number;
  maintenanceCount: number;
  decommissionedCount: number;
  totalFlightHours: number;
  complianceRate: number;
  dronesWithExpiredRegistration: number;
  dronesNeedingMaintenance: number;
}

// ─── Service ───

export class FleetService {
  private readonly log = logger.child({ service: 'FleetService' });

  /**
   * Register a new drone for a tenant.
   */
  async createDrone(tenantId: UUID, data: CreateDroneInput): Promise<Drone> {
    this.log.info({ tenantId, serialNumber: data.serialNumber }, 'Creating drone');

    const result = await queryWithTenant<Drone>(
      tenantId,
      `INSERT INTO drones (
        tenant_id, serial_number, manufacturer, model, nickname, category,
        weight_grams, max_altitude_ft, max_range_meters, max_flight_time_minutes,
        max_speed_mps, has_camera, camera_specs, sensors,
        faa_registration_number, faa_registration_expiry, registered_owner,
        remote_id_type, remote_id_serial_number, remote_id_declaration_id,
        remote_id_compliant, status, home_location,
        maintenance_interval_hours, insurance_provider,
        insurance_policy_number, insurance_expiry,
        tags, metadata,
        total_flight_hours, total_flights,
        assigned_pilot_ids
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, 'active', $22,
        $23, $24,
        $25, $26,
        $27, $28,
        0, 0,
        '{}'
      )
      RETURNING *`,
      [
        tenantId,
        data.serialNumber,
        data.manufacturer,
        data.model,
        data.nickname ?? null,
        data.category,
        data.weightGrams,
        data.maxAltitudeFt,
        data.maxRangeMeters,
        data.maxFlightTimeMinutes,
        data.maxSpeedMps,
        data.hasCamera,
        data.cameraSpecs ? JSON.stringify(data.cameraSpecs) : null,
        data.sensors ?? [],
        data.faaRegistrationNumber,
        data.faaRegistrationExpiry,
        data.registeredOwner,
        data.remoteIdType,
        data.remoteIdSerialNumber ?? null,
        data.remoteIdDeclarationId ?? null,
        data.remoteIdCompliant,
        data.homeLocation ? JSON.stringify(data.homeLocation) : null,
        data.maintenanceIntervalHours ?? 100,
        data.insuranceProvider ?? null,
        data.insurancePolicyNumber ?? null,
        data.insuranceExpiry ?? null,
        data.tags ?? [],
        data.metadata ? JSON.stringify(data.metadata) : '{}',
      ]
    );

    this.log.info({ droneId: result.rows[0].id }, 'Drone created');
    return this.mapDroneRow(result.rows[0]);
  }

  /**
   * Get a single drone by ID with all details.
   */
  async getDrone(id: UUID, tenantId: UUID): Promise<Drone> {
    const result = await queryWithTenant<Drone>(
      tenantId,
      `SELECT * FROM drones WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Drone', id);
    }

    return this.mapDroneRow(result.rows[0]);
  }

  /**
   * Update drone information.
   */
  async updateDrone(id: UUID, tenantId: UUID, data: UpdateDroneInput): Promise<Drone> {
    // Build dynamic SET clause from provided fields
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      nickname: 'nickname',
      maxAltitudeFt: 'max_altitude_ft',
      maxRangeMeters: 'max_range_meters',
      maxFlightTimeMinutes: 'max_flight_time_minutes',
      maxSpeedMps: 'max_speed_mps',
      hasCamera: 'has_camera',
      cameraSpecs: 'camera_specs',
      sensors: 'sensors',
      faaRegistrationNumber: 'faa_registration_number',
      faaRegistrationExpiry: 'faa_registration_expiry',
      remoteIdType: 'remote_id_type',
      remoteIdSerialNumber: 'remote_id_serial_number',
      remoteIdDeclarationId: 'remote_id_declaration_id',
      remoteIdCompliant: 'remote_id_compliant',
      homeLocation: 'home_location',
      firmwareVersion: 'firmware_version',
      nextMaintenanceDue: 'next_maintenance_due',
      maintenanceIntervalHours: 'maintenance_interval_hours',
      insuranceProvider: 'insurance_provider',
      insurancePolicyNumber: 'insurance_policy_number',
      insuranceExpiry: 'insurance_expiry',
      tags: 'tags',
      metadata: 'metadata',
    };

    const jsonFields = new Set(['cameraSpecs', 'homeLocation', 'metadata']);

    for (const [key, column] of Object.entries(fieldMap)) {
      const value = (data as Record<string, unknown>)[key];
      if (value !== undefined) {
        setClauses.push(`${column} = $${paramIndex}`);
        values.push(jsonFields.has(key) ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return this.getDrone(id, tenantId);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id, tenantId);

    const result = await queryWithTenant<Drone>(
      tenantId,
      `UPDATE drones SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Drone', id);
    }

    this.log.info({ droneId: id }, 'Drone updated');
    return this.mapDroneRow(result.rows[0]);
  }

  /**
   * List drones with pagination and filters.
   */
  async listDrones(
    tenantId: UUID,
    filters: ListDronesFilters = {}
  ): Promise<PaginatedResponse<Drone>> {
    const {
      status,
      tags,
      category,
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

    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramIndex}`);
      params.push(tags);
      paramIndex++;
    }

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (search) {
      conditions.push(
        `(serial_number ILIKE $${paramIndex} OR nickname ILIKE $${paramIndex} OR manufacturer ILIKE $${paramIndex} OR model ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const allowedSortColumns: Record<string, string> = {
      created_at: 'created_at',
      nickname: 'nickname',
      serial_number: 'serial_number',
      status: 'status',
      last_flight_at: 'last_flight_at',
    };
    const sortColumn = allowedSortColumns[sortBy] ?? 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*) as count FROM drones WHERE ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const dataResult = await queryWithTenant<Drone>(
      tenantId,
      `SELECT * FROM drones
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: dataResult.rows.map((row) => this.mapDroneRow(row)),
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
   * Change the operational status of a drone.
   */
  async updateDroneStatus(id: UUID, tenantId: UUID, status: DroneStatus): Promise<Drone> {
    const validStatuses: DroneStatus[] = [
      'active', 'grounded', 'maintenance', 'in_flight',
      'returning', 'charging', 'decommissioned',
    ];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid drone status: ${status}`);
    }

    const current = await this.getDrone(id, tenantId);

    // Prevent transitions from decommissioned
    if (current.status === 'decommissioned' && status !== 'decommissioned') {
      throw new ValidationError('Cannot change status of a decommissioned drone');
    }

    const result = await queryWithTenant<Drone>(
      tenantId,
      `UPDATE drones
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [status, id, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Drone', id);
    }

    this.log.info({ droneId: id, previousStatus: current.status, newStatus: status }, 'Drone status updated');
    return this.mapDroneRow(result.rows[0]);
  }

  /**
   * Update the current GPS position of a drone (PostGIS point).
   */
  async updateDroneLocation(
    id: UUID,
    tenantId: UUID,
    location: DroneLocationUpdate
  ): Promise<Drone> {
    const result = await queryWithTenant<Drone>(
      tenantId,
      `UPDATE drones
       SET current_location = ST_SetSRID(ST_MakePoint($1, $2, $3), 4326)::geography,
           updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [location.longitude, location.latitude, location.altitude ?? 0, id, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Drone', id);
    }

    return this.mapDroneRow(result.rows[0]);
  }

  /**
   * Record telemetry data into the TimescaleDB hypertable.
   */
  async recordTelemetry(droneId: UUID, telemetry: TelemetryInput): Promise<void> {
    const { position } = telemetry;

    await queryWithTenant(
      droneId, // telemetry table uses drone lookup; tenant isolation handled via RLS
      `INSERT INTO drone_telemetry (
        drone_id, "timestamp", position,
        altitude_ft, altitude_reference,
        ground_speed_mps, heading_deg, vertical_speed_mps,
        battery_percent, battery_voltage,
        signal_strength, satellite_count, home_distance_m,
        wind_speed_mps, wind_direction, temperature,
        motors, warnings
      ) VALUES (
        $1, $2, ST_SetSRID(ST_MakePoint($3, $4, $5), 4326),
        $6, $7,
        $8, $9, $10,
        $11, $12,
        $13, $14, $15,
        $16, $17, $18,
        $19, $20
      )`,
      [
        droneId,
        telemetry.timestamp,
        position.coordinates[0], // longitude
        position.coordinates[1], // latitude
        position.coordinates[2] ?? 0,
        telemetry.altitudeFt,
        telemetry.altitudeReference,
        telemetry.groundSpeedMps,
        telemetry.headingDeg,
        telemetry.verticalSpeedMps,
        telemetry.batteryPercent,
        telemetry.batteryVoltage,
        telemetry.signalStrength,
        telemetry.satelliteCount,
        telemetry.homeDistanceM,
        telemetry.windSpeedMps ?? null,
        telemetry.windDirection ?? null,
        telemetry.temperature ?? null,
        JSON.stringify(telemetry.motors ?? []),
        JSON.stringify(telemetry.warnings ?? []),
      ]
    );

    this.log.debug({ droneId, timestamp: telemetry.timestamp }, 'Telemetry recorded');
  }

  /**
   * Retrieve telemetry history for a drone within a time range.
   */
  async getDroneTelemetry(
    droneId: UUID,
    startTime: string,
    endTime: string,
    limit = 1000
  ): Promise<DroneTelemetry[]> {
    const result = await queryWithTenant<DroneTelemetry>(
      droneId,
      `SELECT
        drone_id, "timestamp",
        ST_AsGeoJSON(position)::jsonb as position,
        altitude_ft, altitude_reference,
        ground_speed_mps, heading_deg, vertical_speed_mps,
        battery_percent, battery_voltage,
        signal_strength, satellite_count, home_distance_m,
        wind_speed_mps, wind_direction, temperature,
        motors, warnings
       FROM drone_telemetry
       WHERE drone_id = $1
         AND "timestamp" >= $2
         AND "timestamp" <= $3
       ORDER BY "timestamp" DESC
       LIMIT $4`,
      [droneId, startTime, endTime, limit]
    );

    return result.rows.map((row) => this.mapTelemetryRow(row));
  }

  /**
   * Get a high-level overview of the fleet for a tenant.
   */
  async getFleetOverview(tenantId: UUID): Promise<FleetOverview> {
    const result = await queryWithTenant<{
      total_drones: string;
      active_count: string;
      in_flight_count: string;
      grounded_count: string;
      maintenance_count: string;
      decommissioned_count: string;
      total_flight_hours: string;
      expired_registration_count: string;
      maintenance_due_count: string;
    }>(
      tenantId,
      `SELECT
        COUNT(*) AS total_drones,
        COUNT(*) FILTER (WHERE status = 'active') AS active_count,
        COUNT(*) FILTER (WHERE status = 'in_flight') AS in_flight_count,
        COUNT(*) FILTER (WHERE status = 'grounded') AS grounded_count,
        COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance_count,
        COUNT(*) FILTER (WHERE status = 'decommissioned') AS decommissioned_count,
        COALESCE(SUM(total_flight_hours), 0) AS total_flight_hours,
        COUNT(*) FILTER (WHERE faa_registration_expiry < NOW()) AS expired_registration_count,
        COUNT(*) FILTER (WHERE next_maintenance_due IS NOT NULL AND next_maintenance_due < NOW()) AS maintenance_due_count
       FROM drones
       WHERE tenant_id = $1`,
      [tenantId]
    );

    const row = result.rows[0];
    const total = parseInt(row.total_drones, 10);
    const expired = parseInt(row.expired_registration_count, 10);

    return {
      totalDrones: total,
      activeCount: parseInt(row.active_count, 10),
      inFlightCount: parseInt(row.in_flight_count, 10),
      groundedCount: parseInt(row.grounded_count, 10),
      maintenanceCount: parseInt(row.maintenance_count, 10),
      decommissionedCount: parseInt(row.decommissioned_count, 10),
      totalFlightHours: parseFloat(row.total_flight_hours),
      complianceRate: total > 0 ? ((total - expired) / total) * 100 : 100,
      dronesWithExpiredRegistration: expired,
      dronesNeedingMaintenance: parseInt(row.maintenance_due_count, 10),
    };
  }

  /**
   * Find drones with expired FAA registration.
   */
  async checkRegistrationCompliance(tenantId: UUID): Promise<Drone[]> {
    const result = await queryWithTenant<Drone>(
      tenantId,
      `SELECT * FROM drones
       WHERE tenant_id = $1
         AND faa_registration_expiry < NOW()
         AND status != 'decommissioned'
       ORDER BY faa_registration_expiry ASC`,
      [tenantId]
    );

    if (result.rows.length > 0) {
      this.log.warn(
        { tenantId, count: result.rows.length },
        'Drones found with expired FAA registration'
      );
    }

    return result.rows.map((row) => this.mapDroneRow(row));
  }

  /**
   * Find drones that are due for maintenance.
   */
  async checkMaintenanceDue(tenantId: UUID): Promise<Drone[]> {
    const result = await queryWithTenant<Drone>(
      tenantId,
      `SELECT * FROM drones
       WHERE tenant_id = $1
         AND status != 'decommissioned'
         AND (
           (next_maintenance_due IS NOT NULL AND next_maintenance_due <= NOW())
           OR (
             last_maintenance_at IS NOT NULL
             AND total_flight_hours - COALESCE(
               (SELECT flight_hours_at_maintenance
                FROM maintenance_records
                WHERE drone_id = drones.id
                ORDER BY performed_at DESC LIMIT 1),
               0
             ) >= maintenance_interval_hours
           )
         )
       ORDER BY next_maintenance_due ASC NULLS LAST`,
      [tenantId]
    );

    if (result.rows.length > 0) {
      this.log.warn(
        { tenantId, count: result.rows.length },
        'Drones found needing maintenance'
      );
    }

    return result.rows.map((row) => this.mapDroneRow(row));
  }

  // ─── Private Helpers ───

  private mapDroneRow(row: Record<string, any>): Drone {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      serialNumber: row.serial_number ?? row.serialNumber,
      manufacturer: row.manufacturer,
      model: row.model,
      nickname: row.nickname ?? undefined,
      category: row.category,
      weightGrams: row.weight_grams ?? row.weightGrams,
      maxAltitudeFt: row.max_altitude_ft ?? row.maxAltitudeFt,
      maxRangeMeters: row.max_range_meters ?? row.maxRangeMeters,
      maxFlightTimeMinutes: row.max_flight_time_minutes ?? row.maxFlightTimeMinutes,
      maxSpeedMps: row.max_speed_mps ?? row.maxSpeedMps,
      hasCamera: row.has_camera ?? row.hasCamera,
      cameraSpecs: row.camera_specs ?? row.cameraSpecs ?? undefined,
      sensors: row.sensors ?? [],
      faaRegistrationNumber: row.faa_registration_number ?? row.faaRegistrationNumber,
      faaRegistrationExpiry: row.faa_registration_expiry ?? row.faaRegistrationExpiry,
      registeredOwner: row.registered_owner ?? row.registeredOwner,
      remoteIdType: row.remote_id_type ?? row.remoteIdType,
      remoteIdSerialNumber: row.remote_id_serial_number ?? row.remoteIdSerialNumber ?? undefined,
      remoteIdDeclarationId: row.remote_id_declaration_id ?? row.remoteIdDeclarationId ?? undefined,
      remoteIdCompliant: row.remote_id_compliant ?? row.remoteIdCompliant,
      status: row.status,
      currentLocation: row.current_location ?? row.currentLocation ?? undefined,
      homeLocation: row.home_location ?? row.homeLocation ?? undefined,
      totalFlightHours: parseFloat(row.total_flight_hours ?? row.totalFlightHours ?? 0),
      totalFlights: parseInt(row.total_flights ?? row.totalFlights ?? 0, 10),
      lastFlightAt: row.last_flight_at ?? row.lastFlightAt ?? undefined,
      firmwareVersion: row.firmware_version ?? row.firmwareVersion ?? undefined,
      nextMaintenanceDue: row.next_maintenance_due ?? row.nextMaintenanceDue ?? undefined,
      maintenanceIntervalHours: row.maintenance_interval_hours ?? row.maintenanceIntervalHours ?? 100,
      lastMaintenanceAt: row.last_maintenance_at ?? row.lastMaintenanceAt ?? undefined,
      insuranceProvider: row.insurance_provider ?? row.insuranceProvider ?? undefined,
      insurancePolicyNumber: row.insurance_policy_number ?? row.insurancePolicyNumber ?? undefined,
      insuranceExpiry: row.insurance_expiry ?? row.insuranceExpiry ?? undefined,
      assignedPilotIds: row.assigned_pilot_ids ?? row.assignedPilotIds ?? [],
      tags: row.tags ?? [],
      metadata: row.metadata ?? {},
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }

  private mapTelemetryRow(row: Record<string, any>): DroneTelemetry {
    return {
      droneId: row.drone_id ?? row.droneId,
      timestamp: row.timestamp,
      position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position,
      altitudeFt: row.altitude_ft ?? row.altitudeFt,
      altitudeReference: row.altitude_reference ?? row.altitudeReference,
      groundSpeedMps: row.ground_speed_mps ?? row.groundSpeedMps,
      headingDeg: row.heading_deg ?? row.headingDeg,
      verticalSpeedMps: row.vertical_speed_mps ?? row.verticalSpeedMps,
      batteryPercent: row.battery_percent ?? row.batteryPercent,
      batteryVoltage: row.battery_voltage ?? row.batteryVoltage,
      signalStrength: row.signal_strength ?? row.signalStrength,
      satelliteCount: row.satellite_count ?? row.satelliteCount,
      homeDistanceM: row.home_distance_m ?? row.homeDistanceM,
      windSpeedMps: row.wind_speed_mps ?? row.windSpeedMps ?? undefined,
      windDirection: row.wind_direction ?? row.windDirection ?? undefined,
      temperature: row.temperature ?? undefined,
      motors: row.motors ?? [],
      warnings: row.warnings ?? [],
    };
  }
}

export const fleetService = new FleetService();
