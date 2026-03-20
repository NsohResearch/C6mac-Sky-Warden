import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const flightPlanRoutes = new Hono();

// ─── Schemas ───

const waypointSchema = z.object({
  sequenceNumber: z.number().int().min(0),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeFt: z.number().min(0).max(400),
  speedKnots: z.number().min(0).optional(),
  holdTimeSeconds: z.number().min(0).optional(),
  waypointType: z.enum(['departure', 'enroute', 'arrival', 'alternate']).optional(),
  name: z.string().max(100).optional(),
});

const fileFlightPlanSchema = z.object({
  droneId: z.string().uuid(),
  flightPlanType: z.enum(['vfr', 'ifr', 'svfr', 'composite']),
  departureTime: z.string().datetime(),
  estimatedArrivalTime: z.string().datetime(),
  waypoints: z.array(waypointSchema).min(2),
  cruiseAltitudeFt: z.number().min(0).max(400),
  corridorWidthFt: z.number().min(50).max(2000).optional(),
  remarks: z.string().max(1000).optional(),
  pilotNotes: z.string().max(2000).optional(),
  alternateAirport: z.string().max(10).optional(),
  fuelEnduranceMinutes: z.number().min(0).optional(),
  numberOfPersonsOnBoard: z.number().int().min(0).optional(),
});

const updateFlightPlanSchema = z.object({
  waypoints: z.array(waypointSchema).min(2).optional(),
  departureTime: z.string().datetime().optional(),
  estimatedArrivalTime: z.string().datetime().optional(),
  cruiseAltitudeFt: z.number().min(0).max(400).optional(),
  corridorWidthFt: z.number().min(50).max(2000).optional(),
  remarks: z.string().max(1000).optional(),
  pilotNotes: z.string().max(2000).optional(),
});

const listFlightPlansSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  type: z.enum(['vfr', 'ifr', 'svfr', 'composite']).optional(),
  pilotId: z.string().uuid().optional(),
  droneId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'departure_time', 'flight_plan_number', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const positionUpdateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  altFt: z.number().min(0).max(50000),
  headingDeg: z.number().min(0).max(360),
});

const denySchema = z.object({
  reason: z.string().min(1).max(2000),
});

const closeSchema = z.object({
  reason: z.enum(['completed', 'cancelled', 'emergency', 'diverted']),
});

const resolveDeviationSchema = z.object({
  resolution: z.string().min(1).max(2000),
});

const checkAirspaceSchema = z.object({
  waypoints: z.array(waypointSchema).min(2),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  altitudeFt: z.number().min(0).max(400),
});

const checkWeatherSchema = z.object({
  waypoints: z.array(waypointSchema).min(1),
  time: z.string().datetime(),
});

const statsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// ─── Flight Plan CRUD ───

flightPlanRoutes.post(
  '/',
  authenticate,
  requirePermissions('flight_plan:create'),
  zValidator('json', fileFlightPlanSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.fileFlightPlan(tenantId, userId, body);

    logger.info(
      { flightPlanId: flightPlan.id, flightPlanNumber: flightPlan.flightPlanNumber, tenantId },
      'Flight plan filed'
    );

    return c.json({ success: true, data: flightPlan }, 201);
  }
);

flightPlanRoutes.get(
  '/',
  authenticate,
  requirePermissions('flight_plan:create'),
  zValidator('query', listFlightPlansSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const result = await flightPlanService.listFlightPlans(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

flightPlanRoutes.get(
  '/active',
  authenticate,
  requirePermissions('flight_plan:create'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlans = await flightPlanService.getActiveFlightPlans(tenantId);

    return c.json({ success: true, data: flightPlans });
  }
);

flightPlanRoutes.get(
  '/stats',
  authenticate,
  requirePermissions('flight_plan:create'),
  zValidator('query', statsSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { from, to } = c.req.valid('query');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const period = from && to ? { from, to } : undefined;
    const stats = await flightPlanService.getFlightPlanStats(tenantId, period);

    return c.json({ success: true, data: stats });
  }
);

flightPlanRoutes.get(
  '/:id',
  authenticate,
  requirePermissions('flight_plan:create'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.getFlightPlan(id, tenantId);

    return c.json({ success: true, data: flightPlan });
  }
);

flightPlanRoutes.patch(
  '/:id',
  authenticate,
  requirePermissions('flight_plan:create'),
  zValidator('json', updateFlightPlanSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    // For now, re-file with updated data (only draft/filed plans can be updated)
    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.getFlightPlan(id, tenantId);

    if (!['draft', 'filed'].includes(flightPlan.status)) {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Cannot update flight plan in '${flightPlan.status}' status. Only draft or filed plans can be edited.`,
        },
      }, 400);
    }

    // Return current data for now - full update support requires re-filing
    return c.json({ success: true, data: flightPlan });
  }
);

// ─── Authorization ───

flightPlanRoutes.post(
  '/:id/authorize',
  authenticate,
  requirePermissions('flight_plan:authorize'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.authorizeFlightPlan(id, tenantId);

    logger.info({ flightPlanId: id, tenantId }, 'Flight plan authorized');

    return c.json({ success: true, data: flightPlan });
  }
);

flightPlanRoutes.post(
  '/:id/deny',
  authenticate,
  requirePermissions('flight_plan:authorize'),
  zValidator('json', denySchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const { reason } = c.req.valid('json');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.denyFlightPlan(id, tenantId, reason);

    logger.warn({ flightPlanId: id, reason, tenantId }, 'Flight plan denied');

    return c.json({ success: true, data: flightPlan });
  }
);

// ─── Flight Lifecycle ───

flightPlanRoutes.post(
  '/:id/activate',
  authenticate,
  requirePermissions('flight_plan:operate'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.activateFlightPlan(id, tenantId);

    logger.info({ flightPlanId: id, tenantId }, 'Flight plan activated');

    return c.json({ success: true, data: flightPlan });
  }
);

flightPlanRoutes.post(
  '/:id/position',
  authenticate,
  requirePermissions('flight_plan:operate'),
  zValidator('json', positionUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const position = c.req.valid('json');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const result = await flightPlanService.updatePosition(id, tenantId, position);

    return c.json({ success: true, data: result });
  }
);

flightPlanRoutes.post(
  '/:id/close',
  authenticate,
  requirePermissions('flight_plan:operate'),
  zValidator('json', closeSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const { reason } = c.req.valid('json');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.closeFlightPlan(id, tenantId, reason);

    logger.info({ flightPlanId: id, reason, tenantId }, 'Flight plan closed');

    return c.json({ success: true, data: flightPlan });
  }
);

// ─── Deviation Alerts ───

flightPlanRoutes.get(
  '/:id/deviations',
  authenticate,
  requirePermissions('flight_plan:create'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const flightPlan = await flightPlanService.getFlightPlan(id, tenantId);

    return c.json({ success: true, data: flightPlan.deviationAlerts ?? [] });
  }
);

flightPlanRoutes.post(
  '/:id/deviations/:alertId/resolve',
  authenticate,
  requirePermissions('flight_plan:operate'),
  zValidator('json', resolveDeviationSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const alertId = c.req.param('alertId');
    const { resolution } = c.req.valid('json');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const result = await flightPlanService.resolveDeviationAlert(alertId, tenantId, resolution);

    logger.info({ alertId, tenantId }, 'Deviation alert resolved');

    return c.json({ success: true, data: result });
  }
);

// ─── Pre-filing Checks ───

flightPlanRoutes.post(
  '/check-airspace',
  authenticate,
  requirePermissions('flight_plan:create'),
  zValidator('json', checkAirspaceSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { waypoints, departureTime, arrivalTime, altitudeFt } = c.req.valid('json');

    const { flightPlanService } = await import('../services/flightplan/flightplan.service.js');
    const result = await flightPlanService.checkAirspaceConflicts(
      tenantId,
      waypoints,
      departureTime,
      arrivalTime,
      altitudeFt
    );

    return c.json({ success: true, data: result });
  }
);

flightPlanRoutes.post(
  '/check-weather',
  authenticate,
  requirePermissions('flight_plan:create'),
  zValidator('json', checkWeatherSchema),
  async (c) => {
    // Weather briefing placeholder — would integrate with NWS/ADDS API
    const { waypoints, time } = c.req.valid('json');

    return c.json({
      success: true,
      data: {
        briefingTime: new Date().toISOString(),
        requestedTime: time,
        waypointCount: waypoints.length,
        message: 'Weather briefing service integration pending. Check aviationweather.gov for current conditions.',
        source: 'placeholder',
      },
    });
  }
);

export { flightPlanRoutes };
