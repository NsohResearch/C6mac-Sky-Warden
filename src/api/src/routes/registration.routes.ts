import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const registrationRoutes = new Hono();

// ─── Schemas ───

const registrationCreateSchema = z.object({
  droneId: z.string().uuid(),
  registrationType: z.enum(['commercial', 'recreational', 'government', 'public_safety', 'educational']),
  region: z.string().min(1).max(10), // e.g., 'US-CA', 'US-TX'
  faaRegistrationNumber: z.string().min(1).optional(),
  purpose: z.string().max(500).optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceExpiry: z.string().datetime().optional(),
});

const registrationListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['active', 'expired', 'suspended', 'revoked', 'pending', 'transferred']).optional(),
  type: z.enum(['commercial', 'recreational', 'government', 'public_safety', 'educational']).optional(),
  expiryBefore: z.string().datetime().optional(),
  expiryAfter: z.string().datetime().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'expires_at', 'registration_type', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const registrationTransferSchema = z.object({
  newOwnerId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

const registrationSuspendSchema = z.object({
  reason: z.string().min(1).max(1000),
  suspendUntil: z.string().datetime().optional(),
});

const registrationRevokeSchema = z.object({
  reason: z.string().min(1).max(1000),
  violationCodes: z.array(z.string()).optional(),
});

const temporaryPermitCreateSchema = z.object({
  droneId: z.string().uuid().optional(),
  droneSerialNumber: z.string().min(1),
  droneManufacturer: z.string().min(1),
  droneModel: z.string().min(1),
  droneWeightGrams: z.number().positive(),
  permitType: z.enum(['tourist', 'researcher', 'media', 'emergency', 'event']),
  region: z.string().min(1).max(10),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  operationArea: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }).optional(),
  maxAltitudeFt: z.number().min(0).max(400).default(400),
  purpose: z.string().min(1).max(1000),
  applicantCountry: z.string().length(2), // ISO 3166-1 alpha-2
  applicantIdType: z.enum(['passport', 'national_id', 'drivers_license']),
  applicantIdNumber: z.string().min(1),
  emergencyContactPhone: z.string().min(10).max(15),
  documents: z.array(z.object({
    type: z.enum(['id_scan', 'insurance_cert', 'pilot_cert', 'authorization_letter']),
    fileId: z.string().uuid(),
  })).optional(),
});

const temporaryPermitListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'approved', 'active', 'expired', 'denied', 'revoked']).optional(),
  permitType: z.enum(['tourist', 'researcher', 'media', 'emergency', 'event']).optional(),
  region: z.string().optional(),
  sortBy: z.enum(['created_at', 'start_date', 'end_date', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const temporaryPermitUpdateSchema = z.object({
  documents: z.array(z.object({
    type: z.enum(['id_scan', 'insurance_cert', 'pilot_cert', 'authorization_letter']),
    fileId: z.string().uuid(),
  })).optional(),
  emergencyContactPhone: z.string().min(10).max(15).optional(),
  operationArea: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }).optional(),
  purpose: z.string().min(1).max(1000).optional(),
});

// ─── Drone Registration CRUD ───

registrationRoutes.post(
  '/',
  authenticate,
  requirePermissions('drone:register'),
  zValidator('json', registrationCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const registration = await registrationService.registerDrone(tenantId, userId, body);

    logger.info({
      registrationId: registration.id,
      droneId: body.droneId,
      type: body.registrationType,
      region: body.region,
      tenantId,
    }, 'Drone registered');

    return c.json({ success: true, data: registration }, 201);
  }
);

registrationRoutes.get(
  '/',
  authenticate,
  requirePermissions('drone:register'),
  zValidator('query', registrationListSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const result = await registrationService.listRegistrations(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

registrationRoutes.get(
  '/stats',
  authenticate,
  requirePermissions('drone:register'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const stats = await registrationService.getRegistrationStats(tenantId);

    return c.json({ success: true, data: stats });
  }
);

registrationRoutes.get(
  '/verify/:code',
  async (c) => {
    const code = c.req.param('code');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const result = await registrationService.verifyByCode(code);

    return c.json({ success: true, data: result });
  }
);

registrationRoutes.get(
  '/lookup/:ddid',
  async (c) => {
    const ddid = c.req.param('ddid');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const result = await registrationService.lookupByDigitalDroneId(ddid);

    return c.json({ success: true, data: result });
  }
);

registrationRoutes.get(
  '/:id',
  authenticate,
  requirePermissions('drone:register'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const registration = await registrationService.getRegistration(id, tenantId);

    return c.json({ success: true, data: registration });
  }
);

registrationRoutes.post(
  '/:id/renew',
  authenticate,
  requirePermissions('drone:register'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const registration = await registrationService.renewRegistration(id, tenantId, userId);

    logger.info({ registrationId: id, tenantId, userId }, 'Registration renewed');

    return c.json({ success: true, data: registration });
  }
);

registrationRoutes.post(
  '/:id/transfer',
  authenticate,
  requirePermissions('drone:register'),
  zValidator('json', registrationTransferSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const registration = await registrationService.transferRegistration(id, tenantId, userId, body);

    logger.info({
      registrationId: id,
      newOwnerId: body.newOwnerId,
      tenantId,
      userId,
    }, 'Registration transferred');

    return c.json({ success: true, data: registration });
  }
);

registrationRoutes.post(
  '/:id/suspend',
  authenticate,
  requirePermissions('registration:admin'),
  zValidator('json', registrationSuspendSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const registration = await registrationService.suspendRegistration(id, tenantId, userId, body);

    logger.info({
      registrationId: id,
      reason: body.reason,
      tenantId,
      userId,
    }, 'Registration suspended');

    return c.json({ success: true, data: registration });
  }
);

registrationRoutes.post(
  '/:id/revoke',
  authenticate,
  requirePermissions('registration:admin'),
  zValidator('json', registrationRevokeSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const registration = await registrationService.revokeRegistration(id, tenantId, userId, body);

    logger.info({
      registrationId: id,
      reason: body.reason,
      violationCodes: body.violationCodes,
      tenantId,
      userId,
    }, 'Registration revoked');

    return c.json({ success: true, data: registration });
  }
);

// ─── Temporary Permits ───

registrationRoutes.post(
  '/temporary',
  authenticate,
  requirePermissions('drone:register'),
  zValidator('json', temporaryPermitCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const permit = await registrationService.createTemporaryPermit(tenantId, userId, body);

    logger.info({
      permitId: permit.id,
      permitType: body.permitType,
      region: body.region,
      tenantId,
    }, 'Temporary permit application submitted');

    return c.json({ success: true, data: permit }, 201);
  }
);

registrationRoutes.get(
  '/temporary',
  authenticate,
  requirePermissions('drone:register'),
  zValidator('query', temporaryPermitListSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const result = await registrationService.listTemporaryPermits(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

registrationRoutes.get(
  '/temporary/:id',
  authenticate,
  requirePermissions('drone:register'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const permit = await registrationService.getTemporaryPermit(id, tenantId);

    return c.json({ success: true, data: permit });
  }
);

registrationRoutes.post(
  '/temporary/:id/renew',
  authenticate,
  requirePermissions('drone:register'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const permit = await registrationService.renewTemporaryPermit(id, tenantId, userId);

    logger.info({ permitId: id, tenantId, userId }, 'Temporary permit renewed');

    return c.json({ success: true, data: permit });
  }
);

registrationRoutes.patch(
  '/temporary/:id',
  authenticate,
  requirePermissions('drone:register'),
  zValidator('json', temporaryPermitUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { registrationService } = await import('../services/registration/registration.service.js');
    const permit = await registrationService.updateTemporaryPermit(id, tenantId, userId, body);

    logger.info({ permitId: id, tenantId, userId }, 'Temporary permit updated');

    return c.json({ success: true, data: permit });
  }
);

export { registrationRoutes };
