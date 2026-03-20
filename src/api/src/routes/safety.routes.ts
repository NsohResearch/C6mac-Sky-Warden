import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { logger } from '../utils/logger.js';

const safetyRoutes = new Hono();

// ─── Schemas ───

const injurySchema = z.object({
  description: z.string().min(1),
  ais_level: z.number().int().min(0).max(6),
  loss_of_consciousness: z.boolean(),
});

const createReportSchema = z.object({
  report_type: z.enum(['mandatory_107_9', 'voluntary_asrs', 'internal']).default('internal'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  event_time_utc: z.string().datetime().optional(),
  event_location_lat: z.number().min(-90).max(90),
  event_location_lng: z.number().min(-180).max(180),
  event_location_description: z.string().max(500).optional(),
  event_altitude_agl_ft: z.number().min(0).max(400).optional(),
  event_category: z.enum([
    'near_miss', 'flyaway', 'loss_of_control', 'airspace_violation',
    'equipment_failure', 'injury', 'property_damage', 'lost_link',
    'environmental', 'procedural_error', 'other',
  ]),
  severity: z.enum(['none', 'minor', 'moderate', 'serious', 'critical']),
  flight_phase: z.enum(['pre_flight', 'takeoff', 'cruise', 'approach', 'landing', 'post_flight']).optional(),
  operation_type: z.enum(['recreational', 'part_107', 'public', 'part_135']).optional(),
  operational_context: z.string().max(100).optional(),
  drone_id: z.string().uuid().optional(),
  flight_plan_id: z.string().uuid().optional(),
  uas_registration: z.string().max(50).optional(),
  uas_type: z.string().max(50).optional(),
  uas_manufacturer: z.string().max(100).optional(),
  uas_model: z.string().max(100).optional(),
  event_narrative: z.string().min(1).max(10000),
  cause_analysis: z.string().max(5000).optional(),
  prevention_suggestion: z.string().max(5000).optional(),
  weather_conditions: z.string().max(500).optional(),
  injuries: z.array(injurySchema).optional(),
  property_damage_amount_usd: z.number().min(0).optional(),
  property_description: z.string().max(1000).optional(),
  contributing_factors: z.array(z.string().max(100)).optional(),
});

const updateReportSchema = createReportSchema.partial().omit({ report_type: true });

const listReportsSchema = z.object({
  status: z.enum(['draft', 'submitted', 'filed_faa', 'under_investigation', 'closed']).optional(),
  severity: z.enum(['none', 'minor', 'moderate', 'serious', 'critical']).optional(),
  category: z.enum([
    'near_miss', 'flyaway', 'loss_of_control', 'airspace_violation',
    'equipment_failure', 'injury', 'property_damage', 'lost_link',
    'environmental', 'procedural_error', 'other',
  ]).optional(),
  report_type: z.enum(['mandatory_107_9', 'voluntary_asrs', 'internal']).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const b4uflyCheckSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  altitudeFt: z.number().min(0).max(400),
  radiusNm: z.number().min(0.5).max(20).optional(),
});

const checkMandatorySchema = z.object({
  injuries: z.array(injurySchema).default([]),
  propertyDamage: z.number().min(0).default(0),
});

const closeReportSchema = z.object({
  rootCause: z.string().min(1).max(5000),
  lessonsLearned: z.string().min(1).max(5000),
  finalClassification: z.enum(['none', 'minor', 'moderate', 'serious', 'critical']),
});

const assignInvestigatorSchema = z.object({
  investigatorId: z.string().uuid(),
});

const addNotesSchema = z.object({
  notes: z.string().min(1).max(10000),
});

const statsSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const deadlinesSchema = z.object({
  daysAhead: z.coerce.number().int().min(1).max(90).default(7),
});

// ─── Safety Reports (ASRP) ───

// POST /safety/reports — Create safety report
safetyRoutes.post(
  '/reports',
  authenticate,
  requirePermissions('safety:report'),
  rateLimit({ maxRequests: 30, windowMs: 60_000 }),
  zValidator('json', createReportSchema),
  async (c) => {
    const body = c.req.valid('json');
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const requestId = c.get('requestId');

    try {
      const { safetyService } = await import('../services/safety/safety.service.js');
      const report = await safetyService.createReport(tenantId, userId, body);

      return c.json({
        success: true,
        data: report,
        meta: { requestId },
      }, 201);
    } catch (error) {
      logger.error({ error, requestId }, 'Failed to create safety report');
      throw error;
    }
  }
);

// GET /safety/reports — List reports (paginated, filters)
safetyRoutes.get(
  '/reports',
  authenticate,
  requirePermissions('safety:read'),
  zValidator('query', listReportsSchema),
  async (c) => {
    const filters = c.req.valid('query');
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = await safetyService.listReports(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  }
);

// GET /safety/reports/stats — Safety statistics
safetyRoutes.get(
  '/reports/stats',
  authenticate,
  requirePermissions('safety:read'),
  zValidator('query', statsSchema),
  async (c) => {
    const { from, to } = c.req.valid('query');
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const stats = await safetyService.getSafetyStats(
      tenantId,
      from && to ? { from, to } : undefined
    );

    return c.json({
      success: true,
      data: stats,
    });
  }
);

// GET /safety/reports/overdue — Get overdue mandatory reports
safetyRoutes.get(
  '/reports/overdue',
  authenticate,
  requirePermissions('safety:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const reports = await safetyService.getOverdueReports(tenantId);

    return c.json({
      success: true,
      data: reports,
      meta: { count: reports.length },
    });
  }
);

// GET /safety/reports/deadlines — Get upcoming filing deadlines
safetyRoutes.get(
  '/reports/deadlines',
  authenticate,
  requirePermissions('safety:read'),
  zValidator('query', deadlinesSchema),
  async (c) => {
    const { daysAhead } = c.req.valid('query');
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const reports = await safetyService.getUpcomingDeadlines(tenantId, daysAhead);

    return c.json({
      success: true,
      data: reports,
      meta: { count: reports.length, daysAhead },
    });
  }
);

// GET /safety/reports/:id — Get report details
safetyRoutes.get(
  '/reports/:id',
  authenticate,
  requirePermissions('safety:read'),
  async (c) => {
    const reportId = c.req.param('id');
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const report = await safetyService.getReport(reportId, tenantId);

    return c.json({
      success: true,
      data: report,
    });
  }
);

// PATCH /safety/reports/:id — Update report (draft/submitted only)
safetyRoutes.patch(
  '/reports/:id',
  authenticate,
  requirePermissions('safety:report'),
  zValidator('json', updateReportSchema),
  async (c) => {
    const reportId = c.req.param('id');
    const tenantId = c.get('tenantId');
    const body = c.req.valid('json');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const report = await safetyService.updateReport(reportId, tenantId, body);

    return c.json({
      success: true,
      data: report,
    });
  }
);

// POST /safety/reports/:id/submit — Submit report
safetyRoutes.post(
  '/reports/:id/submit',
  authenticate,
  requirePermissions('safety:report'),
  async (c) => {
    const reportId = c.req.param('id');
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = await safetyService.submitReport(reportId, tenantId);

    return c.json({
      success: true,
      data: result,
    });
  }
);

// POST /safety/reports/:id/assign — Assign investigator
safetyRoutes.post(
  '/reports/:id/assign',
  authenticate,
  requirePermissions('safety:investigate'),
  zValidator('json', assignInvestigatorSchema),
  async (c) => {
    const reportId = c.req.param('id');
    const tenantId = c.get('tenantId');
    const { investigatorId } = c.req.valid('json');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = await safetyService.assignInvestigator(reportId, tenantId, investigatorId);

    return c.json({
      success: true,
      data: result,
    });
  }
);

// POST /safety/reports/:id/notes — Add investigation notes
safetyRoutes.post(
  '/reports/:id/notes',
  authenticate,
  requirePermissions('safety:investigate'),
  zValidator('json', addNotesSchema),
  async (c) => {
    const reportId = c.req.param('id');
    const tenantId = c.get('tenantId');
    const { notes } = c.req.valid('json');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = await safetyService.addInvestigationNotes(reportId, tenantId, notes);

    return c.json({
      success: true,
      data: result,
    });
  }
);

// POST /safety/reports/:id/close — Close report
safetyRoutes.post(
  '/reports/:id/close',
  authenticate,
  requirePermissions('safety:investigate'),
  zValidator('json', closeReportSchema),
  async (c) => {
    const reportId = c.req.param('id');
    const tenantId = c.get('tenantId');
    const body = c.req.valid('json');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = await safetyService.closeReport(reportId, tenantId, body);

    return c.json({
      success: true,
      data: result,
    });
  }
);

// ─── Mandatory Threshold Checker ───

// POST /safety/check-mandatory — Check if incident triggers mandatory reporting
safetyRoutes.post(
  '/check-mandatory',
  authenticate,
  requirePermissions('safety:read'),
  zValidator('json', checkMandatorySchema),
  async (c) => {
    const { injuries, propertyDamage } = c.req.valid('json');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = safetyService.checkMandatoryThresholds(injuries, propertyDamage);

    return c.json({
      success: true,
      data: result,
    });
  }
);

// POST /safety/check-asrs — Check ASRS protection eligibility
safetyRoutes.post(
  '/check-asrs',
  authenticate,
  requirePermissions('safety:read'),
  zValidator('json', z.object({ reportId: z.string().uuid() })),
  async (c) => {
    const { reportId } = c.req.valid('json');
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = await safetyService.checkASRSEligibility(reportId, tenantId);

    return c.json({
      success: true,
      data: result,
    });
  }
);

// ─── Enhanced B4UFLY ───

// POST /safety/b4ufly — B4UFLY airspace check
safetyRoutes.post(
  '/b4ufly',
  authenticate,
  requirePermissions('airspace:read'),
  rateLimit({ maxRequests: 120, windowMs: 60_000 }),
  zValidator('json', b4uflyCheckSchema),
  async (c) => {
    const body = c.req.valid('json');
    const requestId = c.get('requestId');

    try {
      const { safetyService } = await import('../services/safety/safety.service.js');
      const result = await safetyService.enhancedB4UFlyCheck(
        body.lat, body.lng, body.altitudeFt, body.radiusNm
      );

      return c.json({
        success: true,
        data: result,
        meta: { requestId },
      });
    } catch (error) {
      logger.error({ error, body, requestId }, 'Enhanced B4UFLY check failed');
      throw error;
    }
  }
);

// GET /safety/b4ufly/history — B4UFLY check history for tenant
safetyRoutes.get(
  '/b4ufly/history',
  authenticate,
  requirePermissions('airspace:read'),
  zValidator('query', z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    const tenantId = c.get('tenantId');
    const offset = (page - 1) * limit;
    const { queryWithTenant } = await import('../utils/db.js');

    const countResult = await queryWithTenant(
      tenantId,
      `SELECT COUNT(*) AS total FROM b4ufly_check_logs WHERE tenant_id = $1`,
      [tenantId]
    );
    const total = Number(countResult.rows[0].total);

    const result = await queryWithTenant(
      tenantId,
      `SELECT id, latitude, longitude, altitude_ft, radius_nm,
              advisory_level, can_fly, laanc_available, airspace_class,
              max_altitude_ft, tfr_count, notam_count, local_rule_count, checked_at
       FROM b4ufly_check_logs
       WHERE tenant_id = $1
       ORDER BY checked_at DESC
       LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );

    return c.json({
      success: true,
      data: result.rows,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  }
);

// ─── Remote ID Compliance (Part 89) ───

// POST /safety/remote-id/check/:droneId — Run compliance check on a drone
safetyRoutes.post(
  '/remote-id/check/:droneId',
  authenticate,
  requirePermissions('fleet:read'),
  async (c) => {
    const droneId = c.req.param('droneId');
    const tenantId = c.get('tenantId');

    const { safetyService } = await import('../services/safety/safety.service.js');
    const result = await safetyService.checkRemoteIdCompliance(droneId, tenantId);

    return c.json({
      success: true,
      data: result,
    });
  }
);

// GET /safety/remote-id/compliance — Fleet-wide RID compliance report
safetyRoutes.get(
  '/remote-id/compliance',
  authenticate,
  requirePermissions('fleet:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { remoteIdService } = await import('../services/airspace/remote-id.service.js');
    const report = await remoteIdService.getComplianceReport(tenantId);

    return c.json({
      success: true,
      data: report,
    });
  }
);

// GET /safety/remote-id/compliance/:droneId — Single drone compliance status
safetyRoutes.get(
  '/remote-id/compliance/:droneId',
  authenticate,
  requirePermissions('fleet:read'),
  async (c) => {
    const droneId = c.req.param('droneId');
    const tenantId = c.get('tenantId');
    const { queryWithTenant } = await import('../utils/db.js');

    const result = await queryWithTenant(
      tenantId,
      `SELECT drone_id, compliant, serial_number_valid, broadcast_module_configured,
              broadcast_frequency_ok, position_accuracy_ok, altitude_accuracy_ok,
              transmission_latency_ok, operating_in_fria, issues, checked_at
       FROM remote_id_compliance_checks
       WHERE drone_id = $1 AND tenant_id = $2`,
      [droneId, tenantId]
    );

    if (result.rows.length === 0) {
      // No compliance check on record; run one
      const { safetyService } = await import('../services/safety/safety.service.js');
      const check = await safetyService.checkRemoteIdCompliance(droneId, tenantId);
      return c.json({ success: true, data: check });
    }

    return c.json({
      success: true,
      data: result.rows[0],
    });
  }
);

export { safetyRoutes };
