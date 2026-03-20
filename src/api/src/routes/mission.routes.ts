import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions, requireAnyPermission } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const missionRoutes = new Hono();

// ─── Schemas ───

const missionCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum([
    'mapping', 'inspection', 'survey', 'photography', 'videography', 'delivery',
    'search_rescue', 'law_enforcement', 'agriculture', 'construction',
    'utility', 'environmental', 'recreational', 'training', 'other',
  ]),
  operationType: z.enum(['part_107', 'recreational', 'public_safety', 'waiver']),
  fleetId: z.string().uuid().optional(),
  droneId: z.string().uuid(),
  backupDroneId: z.string().uuid().optional(),
  visualObserverIds: z.array(z.string().uuid()).default([]),
  crewMembers: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['pic', 'visual_observer', 'payload_operator', 'ground_crew']),
  })).default([]),
  operationArea: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  takeoffLocation: z.object({ latitude: z.number(), longitude: z.number() }),
  landingLocation: z.object({ latitude: z.number(), longitude: z.number() }),
  waypoints: z.array(z.object({
    sequenceNumber: z.number(),
    coordinates: z.object({ latitude: z.number(), longitude: z.number() }),
    altitude: z.object({ value: z.number(), unit: z.enum(['feet', 'meters']), reference: z.enum(['AGL', 'MSL']) }),
    speed: z.number().optional(),
    holdTimeSeconds: z.number().optional(),
    action: z.enum(['hover', 'take_photo', 'start_video', 'stop_video', 'custom']).optional(),
  })).default([]),
  maxAltitudeFt: z.number().min(0).max(400),
  plannedAltitudeFt: z.number().min(0).max(400),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  timezone: z.string().default('America/New_York'),
  riskMitigations: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

const missionUpdateSchema = missionCreateSchema.partial();

const missionListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  pilotId: z.string().uuid().optional(),
  droneId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'scheduled_start', 'status', 'name']).default('scheduled_start'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── CRUD ───

missionRoutes.post(
  '/',
  authenticate,
  requirePermissions('mission:write'),
  zValidator('json', missionCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.createMission(tenantId, userId, body);

    logger.info({ missionId: mission.id, name: body.name, tenantId }, 'Mission created');

    return c.json({ success: true, data: mission }, 201);
  }
);

missionRoutes.get(
  '/',
  authenticate,
  requirePermissions('mission:read'),
  zValidator('query', missionListSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { missionService } = await import('../services/mission/mission.service.js');
    const result = await missionService.listMissions(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

missionRoutes.get(
  '/:id',
  authenticate,
  requirePermissions('mission:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.getMission(id, tenantId);

    return c.json({ success: true, data: mission });
  }
);

missionRoutes.patch(
  '/:id',
  authenticate,
  requirePermissions('mission:write'),
  zValidator('json', missionUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.updateMission(id, tenantId, body);

    return c.json({ success: true, data: mission });
  }
);

// ─── Mission Lifecycle ───

missionRoutes.post(
  '/:id/status',
  authenticate,
  requireAnyPermission('mission:write', 'mission:approve', 'mission:execute'),
  zValidator('json', z.object({
    status: z.enum([
      'draft', 'planned', 'preflight_check', 'awaiting_authorization',
      'authorized', 'in_progress', 'paused', 'completed', 'aborted', 'cancelled',
    ]),
    reason: z.string().optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const { status, reason } = c.req.valid('json');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.updateStatus(id, tenantId, status);

    logger.info({ missionId: id, status, tenantId }, 'Mission status updated');

    return c.json({ success: true, data: mission });
  }
);

missionRoutes.post(
  '/:id/preflight',
  authenticate,
  requirePermissions('mission:execute'),
  zValidator('json', z.object({
    checklist: z.array(z.object({
      id: z.string(),
      checked: z.boolean(),
      notes: z.string().optional(),
    })),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');
    const { checklist } = c.req.valid('json');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.completePreflight(id, tenantId, userId, checklist);

    return c.json({ success: true, data: mission });
  }
);

missionRoutes.post(
  '/:id/start',
  authenticate,
  requirePermissions('mission:execute'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.startMission(id, tenantId);

    logger.info({ missionId: id, tenantId }, 'Mission started');

    return c.json({ success: true, data: mission });
  }
);

missionRoutes.post(
  '/:id/complete',
  authenticate,
  requirePermissions('mission:execute'),
  zValidator('json', z.object({
    flightLog: z.object({
      endTime: z.string().datetime(),
      maxAltitudeFt: z.number(),
      maxSpeedMps: z.number().optional(),
      maxDistanceM: z.number().optional(),
      totalDistanceM: z.number().optional(),
      batteryStartPercent: z.number().optional(),
      batteryEndPercent: z.number().optional(),
      remoteIdActive: z.boolean().default(true),
      postFlightNotes: z.string().optional(),
    }),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const { flightLog } = c.req.valid('json');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.completeMission(id, tenantId, flightLog);

    logger.info({ missionId: id, tenantId }, 'Mission completed');

    return c.json({ success: true, data: mission });
  }
);

missionRoutes.post(
  '/:id/abort',
  authenticate,
  requirePermissions('mission:execute'),
  zValidator('json', z.object({
    reason: z.string().min(1),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const { reason } = c.req.valid('json');

    const { missionService } = await import('../services/mission/mission.service.js');
    const mission = await missionService.abortMission(id, tenantId, reason);

    logger.warn({ missionId: id, reason, tenantId }, 'Mission aborted');

    return c.json({ success: true, data: mission });
  }
);

// ─── Preflight Checklist ───

missionRoutes.get(
  '/:id/checklist',
  authenticate,
  requirePermissions('mission:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { missionService } = await import('../services/mission/mission.service.js');
    const checklist = await missionService.getPreflightChecklist(id, tenantId);

    return c.json({ success: true, data: checklist });
  }
);

// ─── Risk Assessment ───

missionRoutes.get(
  '/:id/risk',
  authenticate,
  requirePermissions('mission:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { missionService } = await import('../services/mission/mission.service.js');
    const risk = await missionService.calculateRiskScore(id, tenantId);

    return c.json({ success: true, data: risk });
  }
);

export { missionRoutes };
