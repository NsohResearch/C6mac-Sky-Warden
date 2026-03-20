import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { queryWithTenant } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { RATE_LIMIT_CONFIG } from '../../../shared/types/developer.js';

const developerRoutes = new Hono();

// ─── Schemas ───

const appCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  callbackUrls: z.array(z.string().url()).max(10).default([]),
  scopes: z.array(z.string()).default([]),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),
});

const webhookCreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum([
    'mission.created', 'mission.started', 'mission.completed', 'mission.aborted',
    'laanc.submitted', 'laanc.approved', 'laanc.denied', 'laanc.expired',
    'drone.status_changed', 'drone.telemetry', 'drone.maintenance_due',
    'tfr.new', 'tfr.updated', 'tfr.cancelled',
    'compliance.alert', 'incident.reported', 'airspace.rule_changed',
  ])).min(1),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    backoffMs: z.number().min(100).max(60000).default(1000),
    backoffMultiplier: z.number().min(1).max(10).default(2),
  }).optional(),
});

// ─── Developer Apps ───

developerRoutes.post(
  '/apps',
  authenticate,
  requirePermissions('api:manage_keys'),
  zValidator('json', appCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    // Generate client credentials
    const { nanoid } = await import('nanoid');
    const clientId = `c6m_${body.environment}_${nanoid(16)}`;
    const clientSecret = `c6ms_${nanoid(48)}`;

    // Hash client secret
    const encoder = new TextEncoder();
    const data = encoder.encode(clientSecret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const clientSecretHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const result = await queryWithTenant(tenantId,
      `INSERT INTO developer_apps (
        tenant_id, user_id, name, description, website,
        callback_urls, client_id, client_secret_hash,
        environment, scopes, rate_limit_tier
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'free')
       RETURNING id, name, description, client_id, environment, scopes, rate_limit_tier, status, created_at`,
      [
        tenantId, userId, body.name, body.description ?? null, body.website ?? null,
        body.callbackUrls, clientId, clientSecretHash,
        body.environment, body.scopes,
      ]
    );

    logger.info({ appId: result.rows[0]!.id, name: body.name, tenantId }, 'Developer app created');

    return c.json({
      success: true,
      data: {
        ...result.rows[0],
        clientSecret, // Only shown once at creation time
        rateLimits: RATE_LIMIT_CONFIG.free,
      },
    }, 201);
  }
);

developerRoutes.get(
  '/apps',
  authenticate,
  requirePermissions('api:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const result = await queryWithTenant(tenantId,
      `SELECT id, name, description, client_id, environment, scopes,
              rate_limit_tier, status, created_at, updated_at
       FROM developer_apps
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );

    return c.json({ success: true, data: result.rows });
  }
);

developerRoutes.get(
  '/apps/:id',
  authenticate,
  requirePermissions('api:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const result = await queryWithTenant(tenantId,
      `SELECT id, name, description, website, callback_urls, client_id,
              environment, scopes, rate_limit_tier, status, created_at, updated_at
       FROM developer_apps
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'App not found', requestId: c.get('requestId') } }, 404);
    }

    return c.json({ success: true, data: result.rows[0] });
  }
);

// ─── API Keys ───

developerRoutes.post(
  '/apps/:appId/keys',
  authenticate,
  requirePermissions('api:manage_keys'),
  zValidator('json', z.object({
    name: z.string().min(1).max(100),
    scopes: z.array(z.string()).default([]),
    environment: z.enum(['sandbox', 'production']).default('sandbox'),
    expiresInDays: z.number().min(1).max(365).optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const appId = c.req.param('appId');
    const body = c.req.valid('json');

    const { nanoid } = await import('nanoid');
    const apiKey = `c6m_${body.environment === 'production' ? 'prod' : 'test'}_${nanoid(32)}`;
    const keyPrefix = apiKey.slice(0, 12);

    // Hash the key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashedKey = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 86_400_000).toISOString()
      : null;

    const result = await queryWithTenant(tenantId,
      `INSERT INTO api_keys (tenant_id, user_id, name, key_prefix, hashed_key, scopes, environment, rate_limit, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, key_prefix, scopes, environment, rate_limit, expires_at, created_at`,
      [tenantId, userId, body.name, keyPrefix, hashedKey, body.scopes, body.environment, 60, expiresAt]
    );

    logger.info({ keyId: result.rows[0]!.id, appId, tenantId }, 'API key created');

    return c.json({
      success: true,
      data: {
        ...result.rows[0],
        apiKey, // Only shown once at creation time
      },
    }, 201);
  }
);

// ─── Webhooks ───

developerRoutes.post(
  '/apps/:appId/webhooks',
  authenticate,
  requirePermissions('api:manage_webhooks'),
  zValidator('json', webhookCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const appId = c.req.param('appId');
    const body = c.req.valid('json');

    const { nanoid } = await import('nanoid');
    const secret = `whsec_${nanoid(32)}`;

    const result = await queryWithTenant(tenantId,
      `INSERT INTO webhooks (app_id, tenant_id, url, events, secret, retry_policy)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, url, events, status, created_at`,
      [
        appId, tenantId, body.url, body.events, secret,
        JSON.stringify(body.retryPolicy ?? { maxRetries: 3, backoffMs: 1000, backoffMultiplier: 2 }),
      ]
    );

    return c.json({
      success: true,
      data: {
        ...result.rows[0],
        secret, // Only shown once
      },
    }, 201);
  }
);

developerRoutes.get(
  '/apps/:appId/webhooks',
  authenticate,
  requirePermissions('api:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const appId = c.req.param('appId');

    const result = await queryWithTenant(tenantId,
      `SELECT id, url, events, status, failure_count,
              last_delivered_at, last_response_code, created_at
       FROM webhooks
       WHERE app_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC`,
      [appId, tenantId]
    );

    return c.json({ success: true, data: result.rows });
  }
);

// ─── API Usage Stats ───

developerRoutes.get(
  '/apps/:appId/usage',
  authenticate,
  requirePermissions('api:read'),
  zValidator('query', z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    interval: z.enum(['hour', 'day', 'week']).default('day'),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const appId = c.req.param('appId');
    const { startDate, endDate, interval } = c.req.valid('query');

    const start = startDate ?? new Date(Date.now() - 30 * 86_400_000).toISOString();
    const end = endDate ?? new Date().toISOString();

    const result = await queryWithTenant(tenantId,
      `SELECT
        time_bucket('1 ${interval}', time) as bucket,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status_code < 400) as successful,
        COUNT(*) FILTER (WHERE status_code >= 400) as failed,
        AVG(response_time_ms)::integer as avg_response_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms)::integer as p95_ms
       FROM api_usage
       WHERE app_id = $1 AND tenant_id = $2
         AND time BETWEEN $3 AND $4
       GROUP BY bucket
       ORDER BY bucket`,
      [appId, tenantId, start, end]
    );

    return c.json({ success: true, data: result.rows });
  }
);

// ─── Rate Limit Tiers ───

developerRoutes.get(
  '/rate-limits',
  async (c) => {
    return c.json({
      success: true,
      data: RATE_LIMIT_CONFIG,
    });
  }
);

export { developerRoutes };
