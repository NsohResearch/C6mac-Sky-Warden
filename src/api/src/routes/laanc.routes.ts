import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { laancRateLimit } from '../middleware/rate-limit.js';
import { logger } from '../utils/logger.js';

const laancRoutes = new Hono();

// ─── Schemas ───

const laancSubmitSchema = z.object({
  operationType: z.enum(['part_107', 'recreational']),
  pilotCertificateNumber: z.string().optional(),
  trustCompletionId: z.string().optional(),
  faaRegistrationNumber: z.string().min(1),
  droneSerialNumber: z.string().min(1),
  remoteIdSerialNumber: z.string().optional(),
  operationArea: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  requestedAltitudeFt: z.number().min(0).max(400),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  nightOperations: z.boolean().default(false),
  antiCollisionLight: z.boolean().default(false),
  emergencyContactPhone: z.string().min(10).max(15),
  missionId: z.string().uuid().optional(),
});

const laancListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  airportCode: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'requested_start', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Submit LAANC Authorization Request ───

laancRoutes.post(
  '/',
  authenticate,
  requirePermissions('laanc:request'),
  laancRateLimit,
  zValidator('json', laancSubmitSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const requestId = c.get('requestId');

    try {
      const { laancService } = await import('../services/laanc/laanc.service.js');

      const authorization = await laancService.submitAuthorization(tenantId, userId, {
        ...body,
        startTime: body.startTime,
        endTime: body.endTime,
      });

      logger.info({
        referenceCode: authorization.referenceCode,
        status: authorization.status,
        authType: authorization.authorizationType,
        airport: authorization.airportCode,
        userId,
        tenantId,
      }, 'LAANC authorization submitted');

      const statusCode = authorization.status === 'auto_approved' ? 200 : 202;

      return c.json({
        success: true,
        data: authorization,
        meta: {
          requestId,
          message: authorization.status === 'auto_approved'
            ? 'Authorization approved in near-real-time'
            : authorization.status === 'pending_review'
            ? 'Authorization submitted for further coordination. Expected response within 72 hours.'
            : 'Authorization request submitted',
        },
      }, statusCode);
    } catch (error) {
      logger.error({ error, body, requestId }, 'LAANC authorization submission failed');
      throw error;
    }
  }
);

// ─── Get Authorization by ID ───

laancRoutes.get(
  '/:id',
  authenticate,
  requirePermissions('laanc:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { laancService } = await import('../services/laanc/laanc.service.js');
    const authorization = await laancService.getAuthorization(id, tenantId);

    return c.json({
      success: true,
      data: authorization,
    });
  }
);

// ─── List Authorizations ───

laancRoutes.get(
  '/',
  authenticate,
  requirePermissions('laanc:read'),
  zValidator('query', laancListSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { laancService } = await import('../services/laanc/laanc.service.js');
    const result = await laancService.listAuthorizations(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

// ─── Cancel Authorization ───

laancRoutes.post(
  '/:id/cancel',
  authenticate,
  requirePermissions('laanc:request'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { laancService } = await import('../services/laanc/laanc.service.js');
    const result = await laancService.cancelAuthorization(id, tenantId);

    logger.info({ authId: id, userId, tenantId }, 'LAANC authorization cancelled');

    return c.json({
      success: true,
      data: result,
    });
  }
);

// ─── Get LAANC Statistics ───

laancRoutes.get(
  '/stats/summary',
  authenticate,
  requirePermissions('laanc:read'),
  zValidator('query', z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { period } = c.req.valid('query');

    const { laancService } = await import('../services/laanc/laanc.service.js');
    const stats = await laancService.getStats(tenantId, period);

    return c.json({
      success: true,
      data: stats,
    });
  }
);

export { laancRoutes };
