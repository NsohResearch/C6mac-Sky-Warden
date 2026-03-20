import { pool, query, queryWithTenant } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import {
  AppError,
  NotFoundError,
  ValidationError,
} from '../../utils/errors.js';
import type { RemoteIdBroadcast } from '../../../../shared/types/fleet.js';
import type { UUID, ISOTimestamp, BoundingBox } from '../../../../shared/types/common.js';

// ─── Compliance Report Type ───

export interface RemoteIdComplianceStatus {
  droneId: UUID;
  compliant: boolean;
  remoteIdType: 'standard' | 'broadcast_module' | 'none';
  remoteIdSerialNumber: string | null;
  lastBroadcastAt: ISOTimestamp | null;
  broadcastMethod: string | null;
  issues: string[];
}

export interface FleetComplianceReport {
  tenantId: UUID;
  generatedAt: ISOTimestamp;
  totalDrones: number;
  compliantDrones: number;
  nonCompliantDrones: number;
  complianceRate: number;
  drones: RemoteIdComplianceStatus[];
}

// ─── Constants ───

const DEFAULT_TIME_WINDOW_SECONDS = 60;
const MAX_TIME_WINDOW_SECONDS = 3600;

// ─── RemoteIdService ───

export class RemoteIdService {
  private readonly log = logger.child({ service: 'RemoteIdService' });

  /**
   * Records a Remote ID broadcast into the TimescaleDB hypertable.
   */
  async recordBroadcast(broadcast: RemoteIdBroadcast): Promise<void> {
    this.log.debug(
      { droneId: broadcast.droneId, sessionId: broadcast.sessionId },
      'Recording RID broadcast'
    );

    await query(
      `INSERT INTO remote_id_broadcasts (
        id, drone_id, session_id, timestamp,
        uas_id, uas_id_type, operator_id,
        operator_lat, operator_lng, operator_alt,
        uas_lat, uas_lng, uas_alt,
        altitude_pressure, altitude_geodetic,
        height, height_reference,
        speed_horizontal, speed_vertical, direction,
        emergency_status, broadcast_method
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13,
        $14, $15,
        $16, $17,
        $18, $19, $20,
        $21, $22
      )`,
      [
        broadcast.id,
        broadcast.droneId,
        broadcast.sessionId,
        broadcast.timestamp,
        broadcast.uasId,
        broadcast.uasIdType,
        broadcast.operatorId,
        broadcast.operatorLocation.latitude,
        broadcast.operatorLocation.longitude,
        broadcast.operatorLocation.altitude?.value ?? null,
        broadcast.uasLocation.latitude,
        broadcast.uasLocation.longitude,
        broadcast.uasLocation.altitude?.value ?? null,
        broadcast.altitudePressure,
        broadcast.altitudeGeodetic,
        broadcast.height,
        broadcast.heightReference,
        broadcast.speedHorizontal,
        broadcast.speedVertical,
        broadcast.direction,
        broadcast.emergencyStatus,
        broadcast.broadcastMethod,
      ]
    );
  }

  /**
   * Retrieves all active Remote ID broadcasts within a bounding box
   * and a configurable time window (defaults to 60 seconds).
   */
  async getActiveBroadcasts(
    boundingBox: BoundingBox,
    timeWindowSeconds: number = DEFAULT_TIME_WINDOW_SECONDS
  ): Promise<RemoteIdBroadcast[]> {
    this.validateBoundingBox(boundingBox);
    if (timeWindowSeconds < 1 || timeWindowSeconds > MAX_TIME_WINDOW_SECONDS) {
      throw new ValidationError(
        `Time window must be between 1 and ${MAX_TIME_WINDOW_SECONDS} seconds`,
        { timeWindowSeconds }
      );
    }

    // Use a lateral join on the hypertable to get the latest broadcast per drone
    const result = await query(
      `SELECT DISTINCT ON (drone_id)
              id, drone_id, session_id, timestamp,
              uas_id, uas_id_type, operator_id,
              operator_lat, operator_lng, operator_alt,
              uas_lat, uas_lng, uas_alt,
              altitude_pressure, altitude_geodetic,
              height, height_reference,
              speed_horizontal, speed_vertical, direction,
              emergency_status, broadcast_method
       FROM remote_id_broadcasts
       WHERE timestamp >= NOW() - ($5 || ' seconds')::interval
         AND uas_lat BETWEEN $1 AND $3
         AND uas_lng BETWEEN $2 AND $4
       ORDER BY drone_id, timestamp DESC`,
      [
        boundingBox.southWest.latitude,
        boundingBox.southWest.longitude,
        boundingBox.northEast.latitude,
        boundingBox.northEast.longitude,
        String(timeWindowSeconds),
      ]
    );

    return result.rows.map((row) => this.mapBroadcastRow(row));
  }

  /**
   * Returns the broadcast history for a specific drone within a time range.
   * Queries the remote_id_broadcasts hypertable ordered by timestamp.
   */
  async getDroneBroadcastHistory(
    droneId: UUID,
    startTime: Date,
    endTime: Date
  ): Promise<RemoteIdBroadcast[]> {
    if (startTime >= endTime) {
      throw new ValidationError('Start time must be before end time');
    }

    const result = await query(
      `SELECT id, drone_id, session_id, timestamp,
              uas_id, uas_id_type, operator_id,
              operator_lat, operator_lng, operator_alt,
              uas_lat, uas_lng, uas_alt,
              altitude_pressure, altitude_geodetic,
              height, height_reference,
              speed_horizontal, speed_vertical, direction,
              emergency_status, broadcast_method
       FROM remote_id_broadcasts
       WHERE drone_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       ORDER BY timestamp ASC`,
      [droneId, startTime.toISOString(), endTime.toISOString()]
    );

    if (result.rows.length === 0) {
      this.log.debug({ droneId, startTime, endTime }, 'No broadcast history found');
    }

    return result.rows.map((row) => this.mapBroadcastRow(row));
  }

  /**
   * Checks Remote ID compliance for a specific drone.
   * Verifies the drone has a registered RID module and recent broadcast activity.
   */
  async checkCompliance(droneId: UUID): Promise<RemoteIdComplianceStatus> {
    // Fetch drone RID configuration
    const droneResult = await query(
      `SELECT id, serial_number, remote_id_type, remote_id_serial_number,
              remote_id_compliant
       FROM drones
       WHERE id = $1`,
      [droneId]
    );

    if (droneResult.rows.length === 0) {
      throw new NotFoundError('Drone', droneId);
    }

    const drone = droneResult.rows[0];
    const issues: string[] = [];

    // Check if RID type is configured
    if (drone.remote_id_type === 'none') {
      issues.push('No Remote ID module configured');
    }

    // Check if serial number is present
    if (!drone.remote_id_serial_number && drone.remote_id_type !== 'none') {
      issues.push('Remote ID serial number not registered');
    }

    // Check for recent broadcast activity (within last 24 hours for active drones)
    const recentBroadcast = await query(
      `SELECT timestamp, broadcast_method
       FROM remote_id_broadcasts
       WHERE drone_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [droneId]
    );

    const lastBroadcast = recentBroadcast.rows[0] ?? null;

    // If drone has RID configured but no broadcasts ever recorded, flag it
    if (drone.remote_id_type !== 'none' && !lastBroadcast) {
      issues.push('No Remote ID broadcasts ever recorded for this drone');
    }

    const compliant = issues.length === 0 && drone.remote_id_type !== 'none';

    // Update compliance status in the drones table if changed
    if (compliant !== Boolean(drone.remote_id_compliant)) {
      await query(
        `UPDATE drones SET remote_id_compliant = $1, updated_at = NOW() WHERE id = $2`,
        [compliant, droneId]
      );
    }

    return {
      droneId,
      compliant,
      remoteIdType: drone.remote_id_type as 'standard' | 'broadcast_module' | 'none',
      remoteIdSerialNumber: drone.remote_id_serial_number ?? null,
      lastBroadcastAt: lastBroadcast
        ? (String(lastBroadcast.timestamp) as ISOTimestamp)
        : null,
      broadcastMethod: lastBroadcast?.broadcast_method ?? null,
      issues,
    };
  }

  /**
   * Generates a fleet-wide Remote ID compliance report for a tenant.
   */
  async getComplianceReport(tenantId: UUID): Promise<FleetComplianceReport> {
    this.log.info({ tenantId }, 'Generating fleet RID compliance report');

    // Fetch all drones for the tenant with their latest broadcast info
    const dronesResult = await queryWithTenant<Record<string, unknown>>(
      tenantId,
      `SELECT d.id, d.serial_number, d.remote_id_type,
              d.remote_id_serial_number, d.remote_id_compliant,
              lb.last_timestamp, lb.broadcast_method
       FROM drones d
       LEFT JOIN LATERAL (
         SELECT timestamp AS last_timestamp, broadcast_method
         FROM remote_id_broadcasts
         WHERE drone_id = d.id
         ORDER BY timestamp DESC
         LIMIT 1
       ) lb ON true
       WHERE d.tenant_id = $1
         AND d.status != 'decommissioned'
       ORDER BY d.serial_number ASC`,
      [tenantId]
    );

    const drones: RemoteIdComplianceStatus[] = [];
    let compliantCount = 0;

    for (const row of dronesResult.rows) {
      const issues: string[] = [];
      const ridType = row.remote_id_type as 'standard' | 'broadcast_module' | 'none';

      if (ridType === 'none') {
        issues.push('No Remote ID module configured');
      }
      if (!row.remote_id_serial_number && ridType !== 'none') {
        issues.push('Remote ID serial number not registered');
      }
      if (ridType !== 'none' && !row.last_timestamp) {
        issues.push('No Remote ID broadcasts ever recorded');
      }

      const compliant = issues.length === 0 && ridType !== 'none';
      if (compliant) compliantCount++;

      drones.push({
        droneId: row.id as string,
        compliant,
        remoteIdType: ridType,
        remoteIdSerialNumber: (row.remote_id_serial_number as string) ?? null,
        lastBroadcastAt: row.last_timestamp
          ? (String(row.last_timestamp) as ISOTimestamp)
          : null,
        broadcastMethod: (row.broadcast_method as string) ?? null,
        issues,
      });
    }

    const totalDrones = drones.length;
    const nonCompliantDrones = totalDrones - compliantCount;
    const complianceRate = totalDrones > 0 ? compliantCount / totalDrones : 0;

    return {
      tenantId,
      generatedAt: new Date().toISOString() as ISOTimestamp,
      totalDrones,
      compliantDrones: compliantCount,
      nonCompliantDrones,
      complianceRate,
      drones,
    };
  }

  // ─── Private Helpers ───

  private validateBoundingBox(box: BoundingBox): void {
    if (
      box.southWest.latitude < -90 ||
      box.southWest.latitude > 90 ||
      box.northEast.latitude < -90 ||
      box.northEast.latitude > 90
    ) {
      throw new ValidationError('Latitude must be between -90 and 90');
    }
    if (
      box.southWest.longitude < -180 ||
      box.southWest.longitude > 180 ||
      box.northEast.longitude < -180 ||
      box.northEast.longitude > 180
    ) {
      throw new ValidationError('Longitude must be between -180 and 180');
    }
  }

  private mapBroadcastRow(row: Record<string, unknown>): RemoteIdBroadcast {
    return {
      id: row.id as string,
      droneId: row.drone_id as string,
      sessionId: row.session_id as string,
      timestamp: row.timestamp as string as ISOTimestamp,
      uasId: row.uas_id as string,
      uasIdType: row.uas_id_type as RemoteIdBroadcast['uasIdType'],
      operatorId: row.operator_id as string,
      operatorLocation: {
        latitude: Number(row.operator_lat),
        longitude: Number(row.operator_lng),
        altitude: row.operator_alt != null
          ? { value: Number(row.operator_alt), unit: 'meters', reference: 'MSL' }
          : undefined,
      },
      uasLocation: {
        latitude: Number(row.uas_lat),
        longitude: Number(row.uas_lng),
        altitude: row.uas_alt != null
          ? { value: Number(row.uas_alt), unit: 'meters', reference: 'MSL' }
          : undefined,
      },
      altitudePressure: Number(row.altitude_pressure),
      altitudeGeodetic: Number(row.altitude_geodetic),
      height: Number(row.height),
      heightReference: row.height_reference as 'takeoff' | 'ground',
      speedHorizontal: Number(row.speed_horizontal),
      speedVertical: Number(row.speed_vertical),
      direction: Number(row.direction),
      emergencyStatus: row.emergency_status as RemoteIdBroadcast['emergencyStatus'],
      broadcastMethod: row.broadcast_method as RemoteIdBroadcast['broadcastMethod'],
    };
  }
}

export const remoteIdService = new RemoteIdService();
