import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { checkDatabaseHealth } from './utils/db.js';
import { requestId, requestLogger } from './middleware/audit.js';
import { rateLimit } from './middleware/rate-limit.js';
import { toHttpException } from './utils/errors.js';

// Route imports
import { authRoutes } from './routes/auth.routes.js';
import { airspaceRoutes } from './routes/airspace.routes.js';
import { laancRoutes } from './routes/laanc.routes.js';
import { fleetRoutes } from './routes/fleet.routes.js';
import { missionRoutes } from './routes/mission.routes.js';
import { agencyRoutes } from './routes/agency.routes.js';
import { developerRoutes } from './routes/developer.routes.js';
import { complianceRoutes } from './routes/compliance.routes.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { billingRoutes } from './routes/billing.routes.js';
import { registrationRoutes } from './routes/registration.routes.js';
import { whiteLabelRoutes } from './routes/whitelabel.routes.js';
import { flightPlanRoutes } from './routes/flightplan.routes.js';

// ─── App Setup ───

const app = new Hono();

// ─── Global Middleware ───

// Security headers
app.use('*', secureHeaders({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use('*', cors({
  origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  exposeHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
  credentials: true,
}));

// Request ID & logging
app.use('*', requestId);
app.use('*', requestLogger);

// Global rate limit
app.use('*', rateLimit());

// ─── Health Check ───

app.get('/health', async (c) => {
  const dbHealthy = await checkDatabaseHealth();

  const status = dbHealthy ? 200 : 503;

  return c.json({
    status: dbHealthy ? 'healthy' : 'degraded',
    version: process.env.npm_package_version ?? '0.1.0',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      api: 'running',
    },
  }, status);
});

// ─── API Routes ───

const api = new Hono();

// Auth (no /api/v1 prefix for these)
api.route('/auth', authRoutes);

// Core services
api.route('/airspace', airspaceRoutes);
api.route('/laanc', laancRoutes);
api.route('/fleet', fleetRoutes);
api.route('/missions', missionRoutes);

// Enterprise
api.route('/agencies', agencyRoutes);
api.route('/compliance', complianceRoutes);
api.route('/analytics', analyticsRoutes);

// Developer platform
api.route('/developer', developerRoutes);

// Sky Warden monetization
api.route('/billing', billingRoutes);
api.route('/registrations', registrationRoutes);
api.route('/whitelabel', whiteLabelRoutes);

// Flight plan / waypath authorization
api.route('/flight-plans', flightPlanRoutes);

// Mount versioned API
app.route(`/api/${env.API_VERSION}`, api);

// ─── API Documentation Redirect ───

app.get('/api', (c) => {
  return c.json({
    name: 'C6macEye API',
    version: env.API_VERSION,
    description: 'UAV/Drone Fleet & Airspace Management Platform',
    documentation: '/api/docs',
    endpoints: {
      auth: `/api/${env.API_VERSION}/auth`,
      airspace: `/api/${env.API_VERSION}/airspace`,
      laanc: `/api/${env.API_VERSION}/laanc`,
      fleet: `/api/${env.API_VERSION}/fleet`,
      missions: `/api/${env.API_VERSION}/missions`,
      agencies: `/api/${env.API_VERSION}/agencies`,
      compliance: `/api/${env.API_VERSION}/compliance`,
      analytics: `/api/${env.API_VERSION}/analytics`,
      developer: `/api/${env.API_VERSION}/developer`,
      billing: `/api/${env.API_VERSION}/billing`,
      registrations: `/api/${env.API_VERSION}/registrations`,
      whitelabel: `/api/${env.API_VERSION}/whitelabel`,
      flightPlans: `/api/${env.API_VERSION}/flight-plans`,
    },
    personas: [
      { name: 'Individual Pilot', description: 'B4UFLY checks, LAANC auth, flight logging, Remote ID compliance' },
      { name: 'Enterprise UAS Manager', description: 'Fleet tracking, user management, reporting, SOC2/ISO27001' },
      { name: 'Airspace/Local Agency', description: 'Rule authoring, geofence management, incident reporting' },
      { name: 'Developer', description: 'REST APIs, webhooks, SDK, sandbox environment' },
    ],
    compliance: {
      faa: ['B4UFLY', 'LAANC', 'Part 107', 'Remote ID (14 CFR Part 89)', 'UAS Facility Maps'],
      security: ['SOC 2 Type II', 'ISO 27001:2022'],
    },
  });
});

// ─── 404 Handler ───

app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
      requestId: c.get('requestId'),
    },
  }, 404);
});

// ─── Error Handler ───

app.onError((err, c) => {
  const httpError = toHttpException(err);
  const requestIdVal = c.get('requestId') ?? 'unknown';

  if (httpError.status >= 500) {
    logger.error({
      error: err,
      requestId: requestIdVal,
      method: c.req.method,
      path: c.req.path,
    }, 'Unhandled server error');
  }

  return c.json({
    success: false,
    error: {
      code: httpError.status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: httpError.status >= 500
        ? (env.NODE_ENV === 'production' ? 'Internal server error' : err.message)
        : err.message,
      requestId: requestIdVal,
    },
  }, httpError.status);
});

// ─── Server Start ───

const port = env.PORT;
const hostname = env.HOST;

logger.info({
  port,
  hostname,
  env: env.NODE_ENV,
  apiVersion: env.API_VERSION,
}, `C6macEye API server starting`);

serve({
  fetch: app.fetch,
  port,
  hostname,
}, (info) => {
  logger.info(`C6macEye API running at http://${info.address}:${info.port}`);
  logger.info(`API docs: http://${info.address}:${info.port}/api`);
  logger.info(`Health check: http://${info.address}:${info.port}/health`);
});

export default app;
export { app };
