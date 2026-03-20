import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions, requireRoles } from '../middleware/auth.js';
import { queryWithTenant, withTransaction } from '../utils/db.js';
import { logger } from '../utils/logger.js';

const agencyRoutes = new Hono();

// ─── Schemas ───

const ruleCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  ruleType: z.enum(['restriction', 'requirement', 'permit', 'advisory', 'prohibition']),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  altitude: z.object({
    floorFt: z.number().min(0).max(400),
    ceilingFt: z.number().min(0).max(400),
  }).optional(),
  effectiveStart: z.string().datetime(),
  effectiveEnd: z.string().datetime().optional(),
  schedule: z.object({
    daysOfWeek: z.array(z.number().min(0).max(6)),
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string(),
    holidays: z.boolean().default(false),
  }).optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.unknown(),
    label: z.string(),
  })).default([]),
  exemptions: z.array(z.object({
    type: z.string(),
    description: z.string(),
    requiresDocumentation: z.boolean(),
  })).default([]),
  permitRequired: z.boolean().default(false),
  permitApplicationUrl: z.string().url().optional(),
  enforcementLevel: z.enum(['advisory', 'warning', 'enforced']).default('advisory'),
});

const incidentReportSchema = z.object({
  reporterType: z.enum(['pilot', 'public', 'agency', 'law_enforcement', 'atc']),
  incidentType: z.string().min(1),
  severity: z.enum(['near_miss', 'minor', 'major', 'critical']),
  description: z.string().min(10),
  location: z.object({ latitude: z.number(), longitude: z.number() }),
  occurredAt: z.string().datetime(),
  droneDescription: z.string().optional(),
  droneRegistration: z.string().optional(),
  remoteIdData: z.record(z.unknown()).optional(),
});

// ─── Agency Rules (Local Airspace Rules) ───

agencyRoutes.get(
  '/:agencyId/rules',
  authenticate,
  requirePermissions('airspace:read'),
  zValidator('query', z.object({
    status: z.enum(['draft', 'review', 'published', 'archived', 'expired']).optional(),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const agencyId = c.req.param('agencyId');
    const { status, page, pageSize } = c.req.valid('query');
    const offset = (page - 1) * pageSize;

    const statusFilter = status ? 'AND ar.status = $4' : '';
    const params: unknown[] = [agencyId, pageSize, offset];
    if (status) params.push(status);

    const result = await queryWithTenant(tenantId,
      `SELECT ar.id, ar.title, ar.description, ar.rule_type,
              ST_AsGeoJSON(ar.geometry)::jsonb as geometry, ar.altitude,
              ar.effective_start, ar.effective_end, ar.schedule,
              ar.conditions, ar.exemptions, ar.permit_required,
              ar.enforcement_level, ar.status, ar.version,
              ar.published_at, ar.created_at
       FROM agency_rules ar
       WHERE ar.agency_id = $1 ${statusFilter}
       ORDER BY ar.created_at DESC
       LIMIT $2 OFFSET $3`,
      params
    );

    return c.json({ success: true, data: result.rows });
  }
);

agencyRoutes.post(
  '/:agencyId/rules',
  authenticate,
  requirePermissions('agency:manage_rules'),
  zValidator('json', ruleCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const agencyId = c.req.param('agencyId');
    const body = c.req.valid('json');

    const result = await queryWithTenant(tenantId,
      `INSERT INTO agency_rules (
        agency_id, title, description, rule_type,
        geometry, altitude, effective_start, effective_end,
        schedule, conditions, exemptions, permit_required,
        permit_application_url, enforcement_level, status, created_by
      ) VALUES (
        $1, $2, $3, $4,
        ST_GeomFromGeoJSON($5), $6, $7, $8,
        $9, $10, $11, $12, $13, $14, 'draft', $15
      ) RETURNING id, title, status, version, created_at`,
      [
        agencyId, body.title, body.description, body.ruleType,
        JSON.stringify(body.geometry), body.altitude ? JSON.stringify(body.altitude) : null,
        body.effectiveStart, body.effectiveEnd ?? null,
        body.schedule ? JSON.stringify(body.schedule) : null,
        JSON.stringify(body.conditions), JSON.stringify(body.exemptions),
        body.permitRequired, body.permitApplicationUrl ?? null,
        body.enforcementLevel, userId,
      ]
    );

    logger.info({ ruleId: result.rows[0]!.id, agencyId, title: body.title }, 'Agency rule created');

    return c.json({ success: true, data: result.rows[0] }, 201);
  }
);

agencyRoutes.post(
  '/:agencyId/rules/:ruleId/publish',
  authenticate,
  requirePermissions('agency:manage_rules'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const ruleId = c.req.param('ruleId');

    const result = await queryWithTenant(tenantId,
      `UPDATE agency_rules SET status = 'published', published_at = NOW(), published_by = $1, updated_at = NOW()
       WHERE id = $2 AND status IN ('draft', 'review')
       RETURNING id, title, status, published_at`,
      [userId, ruleId]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Rule not found or already published', requestId: c.get('requestId') } }, 404);
    }

    logger.info({ ruleId, agencyId: c.req.param('agencyId') }, 'Agency rule published');

    return c.json({ success: true, data: result.rows[0] });
  }
);

// ─── Incident Reporting ───

agencyRoutes.post(
  '/:agencyId/incidents',
  authenticate,
  requirePermissions('agency:manage_incidents'),
  zValidator('json', incidentReportSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const agencyId = c.req.param('agencyId');
    const body = c.req.valid('json');

    const result = await queryWithTenant(tenantId,
      `INSERT INTO agency_incidents (
        agency_id, reported_by, reporter_type, incident_type, severity,
        description, location, occurred_at, drone_description,
        drone_registration, remote_id_data, timeline
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_SetSRID(ST_MakePoint($7, $8), 4326),
        $9, $10, $11, $12, $13
      ) RETURNING id, incident_type, severity, status, created_at`,
      [
        agencyId, userId, body.reporterType, body.incidentType, body.severity,
        body.description, body.location.longitude, body.location.latitude,
        body.occurredAt, body.droneDescription ?? null,
        body.droneRegistration ?? null,
        body.remoteIdData ? JSON.stringify(body.remoteIdData) : null,
        JSON.stringify([{
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action: 'Incident reported',
          description: `Reported by ${body.reporterType}`,
          userId,
        }]),
      ]
    );

    logger.info({ incidentId: result.rows[0]!.id, severity: body.severity, agencyId }, 'Incident reported');

    return c.json({ success: true, data: result.rows[0] }, 201);
  }
);

agencyRoutes.get(
  '/:agencyId/incidents',
  authenticate,
  requirePermissions('agency:view_incidents'),
  zValidator('query', z.object({
    status: z.string().optional(),
    severity: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const agencyId = c.req.param('agencyId');
    const { status, severity, page, pageSize } = c.req.valid('query');
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE ai.agency_id = $1';
    const params: unknown[] = [agencyId, pageSize, offset];
    let paramIdx = 4;

    if (status) {
      whereClause += ` AND ai.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }
    if (severity) {
      whereClause += ` AND ai.severity = $${paramIdx}::incident_severity`;
      params.push(severity);
      paramIdx++;
    }

    const result = await queryWithTenant(tenantId,
      `SELECT ai.id, ai.incident_type, ai.severity, ai.description,
              ST_AsGeoJSON(ai.location)::jsonb as location,
              ai.occurred_at, ai.status, ai.drone_registration,
              ai.faa_reported, ai.created_at
       FROM agency_incidents ai
       ${whereClause}
       ORDER BY ai.occurred_at DESC
       LIMIT $2 OFFSET $3`,
      params
    );

    return c.json({ success: true, data: result.rows });
  }
);

// ─── Agency Analytics ───

agencyRoutes.get(
  '/:agencyId/analytics',
  authenticate,
  requirePermissions('analytics:read'),
  zValidator('query', z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const agencyId = c.req.param('agencyId');

    const rulesCount = await queryWithTenant(tenantId,
      "SELECT COUNT(*) as count FROM agency_rules WHERE agency_id = $1 AND status = 'published'",
      [agencyId]
    );

    const incidentStats = await queryWithTenant(tenantId,
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical,
        COUNT(*) FILTER (WHERE severity = 'major') as major,
        COUNT(*) FILTER (WHERE severity = 'minor') as minor,
        COUNT(*) FILTER (WHERE severity = 'near_miss') as near_miss
       FROM agency_incidents WHERE agency_id = $1`,
      [agencyId]
    );

    return c.json({
      success: true,
      data: {
        agencyId,
        activeRules: parseInt(rulesCount.rows[0]?.count ?? '0'),
        incidents: {
          total: parseInt(incidentStats.rows[0]?.total ?? '0'),
          critical: parseInt(incidentStats.rows[0]?.critical ?? '0'),
          major: parseInt(incidentStats.rows[0]?.major ?? '0'),
          minor: parseInt(incidentStats.rows[0]?.minor ?? '0'),
          nearMiss: parseInt(incidentStats.rows[0]?.near_miss ?? '0'),
        },
      },
    });
  }
);

export { agencyRoutes };
