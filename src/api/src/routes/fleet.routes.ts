import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions, requireAnyPermission } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { logger } from '../utils/logger.js';

const fleetRoutes = new Hono();

// ─── Schemas ───

const droneCreateSchema = z.object({
  serialNumber: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  nickname: z.string().optional(),
  category: z.enum(['category_1', 'category_2', 'category_3', 'category_4']),
  weightGrams: z.number().positive(),
  maxAltitudeFt: z.number().min(0).max(400).default(400),
  maxRangeMeters: z.number().positive().optional(),
  maxFlightTimeMinutes: z.number().positive().optional(),
  maxSpeedMps: z.number().positive().optional(),
  hasCamera: z.boolean().default(false),
  cameraSpecs: z.object({
    resolution: z.string(),
    sensorSize: z.string(),
    fov: z.number(),
    hasZoom: z.boolean(),
    hasThermal: z.boolean(),
    hasNightVision: z.boolean(),
  }).optional(),
  sensors: z.array(z.string()).default([]),
  faaRegistrationNumber: z.string().min(1),
  faaRegistrationExpiry: z.string().datetime(),
  remoteIdType: z.enum(['standard', 'broadcast_module', 'none']),
  remoteIdSerialNumber: z.string().optional(),
  remoteIdDeclarationId: z.string().optional(),
  maintenanceIntervalHours: z.number().positive().default(100),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiry: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
});

const droneUpdateSchema = droneCreateSchema.partial();

const droneListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'manufacturer', 'model', 'status', 'total_flight_hours']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const telemetrySchema = z.object({
  timestamp: z.string().datetime(),
  position: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number(), z.number().optional()]),
  }),
  altitudeFt: z.number(),
  altitudeReference: z.enum(['AGL', 'MSL']).default('AGL'),
  groundSpeedMps: z.number().optional(),
  headingDeg: z.number().min(0).max(360).optional(),
  verticalSpeedMps: z.number().optional(),
  batteryPercent: z.number().min(0).max(100),
  batteryVoltage: z.number().optional(),
  signalStrength: z.number().min(0).max(100).optional(),
  satelliteCount: z.number().optional(),
  homeDistanceM: z.number().optional(),
  windSpeedMps: z.number().optional(),
  windDirection: z.number().optional(),
  temperature: z.number().optional(),
  motors: z.array(z.object({
    motorId: z.number(),
    rpm: z.number(),
    temperature: z.number(),
    currentAmps: z.number(),
  })).optional(),
  warnings: z.array(z.object({
    code: z.string(),
    level: z.enum(['info', 'warning', 'critical']),
    message: z.string(),
    timestamp: z.string().datetime(),
  })).default([]),
});

// ─── Drones CRUD ───

fleetRoutes.post(
  '/drones',
  authenticate,
  requirePermissions('drone:write'),
  zValidator('json', droneCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const drone = await fleetService.createDrone(tenantId, userId, body);

    logger.info({ droneId: drone.id, serial: body.serialNumber, tenantId }, 'Drone registered');

    return c.json({ success: true, data: drone }, 201);
  }
);

fleetRoutes.get(
  '/drones',
  authenticate,
  requirePermissions('drone:read'),
  zValidator('query', droneListSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const result = await fleetService.listDrones(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

fleetRoutes.get(
  '/drones/:id',
  authenticate,
  requirePermissions('drone:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const drone = await fleetService.getDrone(id, tenantId);

    return c.json({ success: true, data: drone });
  }
);

fleetRoutes.patch(
  '/drones/:id',
  authenticate,
  requirePermissions('drone:write'),
  zValidator('json', droneUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const drone = await fleetService.updateDrone(id, tenantId, body);

    return c.json({ success: true, data: drone });
  }
);

fleetRoutes.patch(
  '/drones/:id/status',
  authenticate,
  requirePermissions('drone:write'),
  zValidator('json', z.object({
    status: z.enum(['active', 'grounded', 'maintenance', 'in_flight', 'returning', 'charging', 'decommissioned']),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const { status } = c.req.valid('json');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const drone = await fleetService.updateDroneStatus(id, tenantId, status);

    return c.json({ success: true, data: drone });
  }
);

// ─── Telemetry ───

fleetRoutes.post(
  '/drones/:id/telemetry',
  authenticate,
  requirePermissions('drone:telemetry'),
  rateLimit({ maxRequests: 600, windowMs: 60_000 }), // 10 updates/sec
  zValidator('json', telemetrySchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const droneId = c.req.param('id');
    const body = c.req.valid('json');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    await fleetService.recordTelemetry(droneId, tenantId, body);

    return c.json({ success: true, data: { recorded: true } });
  }
);

fleetRoutes.get(
  '/drones/:id/telemetry',
  authenticate,
  requirePermissions('drone:telemetry'),
  zValidator('query', z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    limit: z.coerce.number().min(1).max(10000).default(1000),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const droneId = c.req.param('id');
    const { startTime, endTime, limit } = c.req.valid('query');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const telemetry = await fleetService.getDroneTelemetry(
      droneId, tenantId, startTime, endTime, limit
    );

    return c.json({
      success: true,
      data: telemetry,
      meta: { count: telemetry.length },
    });
  }
);

// ─── Fleet Overview ───

fleetRoutes.get(
  '/overview',
  authenticate,
  requirePermissions('fleet:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const overview = await fleetService.getFleetOverview(tenantId);

    return c.json({ success: true, data: overview });
  }
);

// ─── Compliance Checks ───

fleetRoutes.get(
  '/compliance/registration',
  authenticate,
  requireAnyPermission('compliance:read', 'fleet:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const issues = await fleetService.checkRegistrationCompliance(tenantId);

    return c.json({
      success: true,
      data: issues,
      meta: { count: issues.length },
    });
  }
);

fleetRoutes.get(
  '/compliance/maintenance',
  authenticate,
  requireAnyPermission('compliance:read', 'fleet:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { fleetService } = await import('../services/fleet/fleet.service.js');
    const due = await fleetService.checkMaintenanceDue(tenantId);

    return c.json({
      success: true,
      data: due,
      meta: { count: due.length },
    });
  }
);

// ─── Pilots ───

fleetRoutes.get(
  '/pilots',
  authenticate,
  requireAnyPermission('fleet:read', 'fleet:manage_pilots'),
  zValidator('query', z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { pilotService } = await import('../services/fleet/pilot.service.js');
    const result = await pilotService.listPilots(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

fleetRoutes.get(
  '/pilots/:userId',
  authenticate,
  requireAnyPermission('fleet:read', 'fleet:manage_pilots'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.req.param('userId');

    const { pilotService } = await import('../services/fleet/pilot.service.js');
    const profile = await pilotService.getProfile(userId, tenantId);

    return c.json({ success: true, data: profile });
  }
);

export { fleetRoutes };
