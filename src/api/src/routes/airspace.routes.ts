import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { logger } from '../utils/logger.js';

const airspaceRoutes = new Hono();

// ─── Schemas ───

const airspaceCheckSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeFt: z.number().min(0).max(400).default(400),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
});

const boundingBoxSchema = z.object({
  northEastLat: z.number().min(-90).max(90),
  northEastLng: z.number().min(-180).max(180),
  southWestLat: z.number().min(-90).max(90),
  southWestLng: z.number().min(-180).max(180),
});

const geofenceCreateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['inclusion', 'exclusion', 'advisory']),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  altitude: z.object({
    floorFt: z.number().min(0).max(400),
    ceilingFt: z.number().min(0).max(400),
  }).optional(),
  action: z.enum(['block', 'warn', 'log']).default('warn'),
  active: z.boolean().default(true),
});

// ─── B4UFLY / Airspace Check (Core Feature) ───

airspaceRoutes.post(
  '/check',
  authenticate,
  requirePermissions('airspace:read'),
  rateLimit({ maxRequests: 120, windowMs: 60_000 }),
  zValidator('json', airspaceCheckSchema),
  async (c) => {
    const body = c.req.valid('json');
    const requestId = c.get('requestId');

    try {
      // Import service dynamically to avoid circular deps
      const { airspaceService } = await import('../services/airspace/airspace.service.js');

      const result = await airspaceService.checkAirspace(
        body.latitude,
        body.longitude,
        body.altitudeFt,
        body.startTime ? new Date(body.startTime) : new Date()
      );

      return c.json({
        success: true,
        data: result,
        meta: { requestId },
      });
    } catch (error) {
      logger.error({ error, body, requestId }, 'Airspace check failed');
      return c.json({
        success: false,
        error: {
          code: 'AIRSPACE_CHECK_FAILED',
          message: 'Failed to check airspace status',
          requestId,
        },
      }, 500);
    }
  }
);

// ─── Get UASFM Grid Data ───

airspaceRoutes.get(
  '/uasfm',
  authenticate,
  requirePermissions('airspace:read'),
  zValidator('query', z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  })),
  async (c) => {
    const { latitude, longitude } = c.req.valid('query');
    const { airspaceService } = await import('../services/airspace/airspace.service.js');

    const grid = await airspaceService.getUasfmGrid(latitude, longitude);

    return c.json({
      success: true,
      data: grid,
    });
  }
);

// ─── Active TFRs ───

airspaceRoutes.get(
  '/tfrs',
  authenticate,
  requirePermissions('airspace:read'),
  zValidator('query', boundingBoxSchema),
  async (c) => {
    const bbox = c.req.valid('query');
    const { airspaceService } = await import('../services/airspace/airspace.service.js');

    const tfrs = await airspaceService.getActiveTfrs({
      northEast: { latitude: bbox.northEastLat, longitude: bbox.northEastLng },
      southWest: { latitude: bbox.southWestLat, longitude: bbox.southWestLng },
    });

    return c.json({
      success: true,
      data: tfrs,
      meta: { count: tfrs.length },
    });
  }
);

// ─── Active NOTAMs ───

airspaceRoutes.get(
  '/notams',
  authenticate,
  requirePermissions('airspace:read'),
  zValidator('query', boundingBoxSchema.extend({
    uasOnly: z.coerce.boolean().default(true),
  })),
  async (c) => {
    const { uasOnly, ...bbox } = c.req.valid('query');
    const { airspaceService } = await import('../services/airspace/airspace.service.js');

    const notams = await airspaceService.getActiveNotams({
      northEast: { latitude: bbox.northEastLat, longitude: bbox.northEastLng },
      southWest: { latitude: bbox.southWestLat, longitude: bbox.southWestLng },
    });

    return c.json({
      success: true,
      data: notams,
      meta: { count: notams.length },
    });
  }
);

// ─── Geofences ───

airspaceRoutes.get(
  '/geofences',
  authenticate,
  requirePermissions('airspace:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { queryWithTenant } = await import('../utils/db.js');

    const result = await queryWithTenant(tenantId,
      'SELECT id, name, type, ST_AsGeoJSON(geometry)::jsonb as geometry, altitude, action, active, created_at FROM geofences WHERE active = true ORDER BY name'
    );

    return c.json({
      success: true,
      data: result.rows,
    });
  }
);

airspaceRoutes.post(
  '/geofences',
  authenticate,
  requirePermissions('airspace:manage_geofences'),
  zValidator('json', geofenceCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const { queryWithTenant } = await import('../utils/db.js');

    const result = await queryWithTenant(tenantId,
      `INSERT INTO geofences (tenant_id, name, type, geometry, altitude, action, active, created_by)
       VALUES ($1, $2, $3, ST_GeomFromGeoJSON($4), $5, $6, $7, $8)
       RETURNING id, name, type, ST_AsGeoJSON(geometry)::jsonb as geometry, altitude, action, active, created_at`,
      [tenantId, body.name, body.type, JSON.stringify(body.geometry), body.altitude ? JSON.stringify(body.altitude) : null, body.action, body.active, userId]
    );

    return c.json({
      success: true,
      data: result.rows[0],
    }, 201);
  }
);

airspaceRoutes.delete(
  '/geofences/:id',
  authenticate,
  requirePermissions('airspace:manage_geofences'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const { queryWithTenant } = await import('../utils/db.js');

    const result = await queryWithTenant(tenantId,
      'DELETE FROM geofences WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    );

    if (result.rowCount === 0) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Geofence not found', requestId: c.get('requestId') } }, 404);
    }

    return c.json({ success: true, data: { deleted: true } });
  }
);

export { airspaceRoutes };
