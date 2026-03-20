import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { queryWithTenant } from '../utils/db.js';

const analyticsRoutes = new Hono();

// ─── Dashboard Metrics ───

analyticsRoutes.get(
  '/dashboard',
  authenticate,
  requirePermissions('analytics:read'),
  zValidator('query', z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { period } = c.req.valid('query');

    const intervalMap = { day: '1 day', week: '7 days', month: '30 days', quarter: '90 days', year: '365 days' };
    const interval = intervalMap[period];

    // Fleet Metrics
    const fleetStats = await queryWithTenant(tenantId,
      `SELECT
        COUNT(*) as total_drones,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'grounded') as grounded,
        COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance,
        COUNT(*) FILTER (WHERE status = 'in_flight') as in_flight,
        COALESCE(SUM(total_flight_hours), 0) as total_hours,
        COALESCE(AVG(total_flight_hours), 0) as avg_hours,
        COUNT(*) FILTER (WHERE remote_id_compliant) as rid_compliant,
        COUNT(*) FILTER (WHERE faa_registration_expiry > NOW()) as reg_current,
        COUNT(*) FILTER (WHERE insurance_expiry > NOW()) as insured
       FROM drones WHERE tenant_id = $1 AND status != 'decommissioned'`,
      [tenantId]
    );

    // Mission Metrics
    const missionStats = await queryWithTenant(tenantId,
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'aborted') as aborted,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COALESCE(AVG(EXTRACT(EPOCH FROM (actual_end - actual_start))/60) FILTER (WHERE actual_end IS NOT NULL), 0) as avg_duration_min
       FROM missions
       WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '${interval}'`,
      [tenantId]
    );

    // LAANC Metrics
    const laancStats = await queryWithTenant(tenantId,
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'auto_approved') as auto_approved,
        COUNT(*) FILTER (WHERE status IN ('pending_review', 'approved') AND authorization_type = 'further_coordination') as further_coord,
        COUNT(*) FILTER (WHERE status = 'denied') as denied,
        COALESCE(AVG(EXTRACT(EPOCH FROM (responded_at - submitted_at))*1000) FILTER (WHERE responded_at IS NOT NULL), 0) as avg_response_ms
       FROM laanc_authorizations
       WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '${interval}'`,
      [tenantId]
    );

    // Safety Metrics
    const safetyStats = await queryWithTenant(tenantId,
      `SELECT
        COUNT(*) as total_incidents,
        COUNT(*) FILTER (WHERE (incidents::jsonb->0->>'severity') = 'near_miss') as near_misses,
        COUNT(*) FILTER (WHERE (incidents::jsonb->0->>'severity') = 'critical') as critical
       FROM missions
       WHERE tenant_id = $1 AND jsonb_array_length(incidents) > 0
         AND created_at > NOW() - INTERVAL '${interval}'`,
      [tenantId]
    );

    const fleet = fleetStats.rows[0]!;
    const totalDrones = parseInt(fleet.total_drones);

    return c.json({
      success: true,
      data: {
        period,
        fleet: {
          totalDrones,
          activeDrones: parseInt(fleet.active),
          groundedDrones: parseInt(fleet.grounded),
          maintenanceDue: parseInt(fleet.maintenance),
          inFlight: parseInt(fleet.in_flight),
          totalFlightHours: parseFloat(fleet.total_hours),
          avgFlightHoursPerDrone: parseFloat(fleet.avg_hours),
          remoteIdCompliance: totalDrones > 0 ? Math.round((parseInt(fleet.rid_compliant) / totalDrones) * 100) : 100,
          registrationCompliance: totalDrones > 0 ? Math.round((parseInt(fleet.reg_current) / totalDrones) * 100) : 100,
          insuranceCompliance: totalDrones > 0 ? Math.round((parseInt(fleet.insured) / totalDrones) * 100) : 100,
        },
        missions: {
          total: parseInt(missionStats.rows[0]!.total),
          completed: parseInt(missionStats.rows[0]!.completed),
          aborted: parseInt(missionStats.rows[0]!.aborted),
          cancelled: parseInt(missionStats.rows[0]!.cancelled),
          inProgress: parseInt(missionStats.rows[0]!.in_progress),
          avgDurationMinutes: parseFloat(missionStats.rows[0]!.avg_duration_min),
          successRate: parseInt(missionStats.rows[0]!.total) > 0
            ? Math.round((parseInt(missionStats.rows[0]!.completed) / parseInt(missionStats.rows[0]!.total)) * 100)
            : 100,
        },
        laanc: {
          total: parseInt(laancStats.rows[0]!.total),
          autoApproved: parseInt(laancStats.rows[0]!.auto_approved),
          furtherCoordination: parseInt(laancStats.rows[0]!.further_coord),
          denied: parseInt(laancStats.rows[0]!.denied),
          avgApprovalTimeMs: parseFloat(laancStats.rows[0]!.avg_response_ms),
        },
        safety: {
          totalIncidents: parseInt(safetyStats.rows[0]!.total_incidents),
          nearMisses: parseInt(safetyStats.rows[0]!.near_misses),
          criticalIncidents: parseInt(safetyStats.rows[0]!.critical),
        },
      },
    });
  }
);

// ─── Flight Hours Trend ───

analyticsRoutes.get(
  '/flight-hours',
  authenticate,
  requirePermissions('analytics:read'),
  zValidator('query', z.object({
    interval: z.enum(['day', 'week', 'month']).default('day'),
    days: z.coerce.number().min(1).max(365).default(30),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { interval, days } = c.req.valid('query');

    const result = await queryWithTenant(tenantId,
      `SELECT
        date_trunc($1, fl.start_time) as bucket,
        COUNT(*) as flights,
        COALESCE(SUM(fl.duration_minutes), 0) as total_minutes,
        COALESCE(MAX(fl.max_altitude_ft), 0) as max_altitude
       FROM flight_logs fl
       WHERE fl.tenant_id = $2
         AND fl.start_time > NOW() - INTERVAL '${days} days'
       GROUP BY bucket
       ORDER BY bucket`,
      [interval, tenantId]
    );

    return c.json({ success: true, data: result.rows });
  }
);

// ─── Top Pilots ───

analyticsRoutes.get(
  '/top-pilots',
  authenticate,
  requirePermissions('analytics:read'),
  zValidator('query', z.object({
    limit: z.coerce.number().min(1).max(50).default(10),
    days: z.coerce.number().min(1).max(365).default(30),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { limit, days } = c.req.valid('query');

    const result = await queryWithTenant(tenantId,
      `SELECT
        u.id, u.display_name, u.email,
        COUNT(fl.id) as flights,
        COALESCE(SUM(fl.duration_minutes), 0) as total_minutes,
        COALESCE(AVG(fl.max_altitude_ft), 0) as avg_altitude
       FROM flight_logs fl
       JOIN users u ON u.id = fl.pilot_id
       WHERE fl.tenant_id = $1
         AND fl.start_time > NOW() - INTERVAL '${days} days'
       GROUP BY u.id, u.display_name, u.email
       ORDER BY total_minutes DESC
       LIMIT $2`,
      [tenantId, limit]
    );

    return c.json({ success: true, data: result.rows });
  }
);

export { analyticsRoutes };
