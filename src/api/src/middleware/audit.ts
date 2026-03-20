import { createMiddleware } from 'hono/factory';
import { logger } from '../utils/logger.js';
import type { AuditAction } from '../../../shared/types/common.js';

interface AuditContext {
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ─── Request ID Middleware ───

export const requestId = createMiddleware(async (c, next) => {
  const id = c.req.header('X-Request-ID') ?? crypto.randomUUID();
  c.set('requestId', id);
  c.header('X-Request-ID', id);
  await next();
});

// ─── Request Logging Middleware ───

export const requestLogger = createMiddleware(async (c, next) => {
  const start = performance.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Math.round(performance.now() - start);
  const status = c.res.status;

  const logData = {
    method,
    path,
    status,
    duration,
    requestId: c.get('requestId'),
    userId: c.get('userId'),
    tenantId: c.get('tenantId'),
    ip: c.req.header('X-Forwarded-For') ?? c.req.header('X-Real-IP'),
    userAgent: c.req.header('User-Agent'),
  };

  if (status >= 500) {
    logger.error(logData, 'Request completed with server error');
  } else if (status >= 400) {
    logger.warn(logData, 'Request completed with client error');
  } else {
    logger.info(logData, 'Request completed');
  }
});

// ─── Audit Log Writer ───

export async function writeAuditLog(
  ctx: {
    userId: string;
    tenantId: string;
    email: string;
    requestId: string;
    ipAddress: string;
    userAgent: string;
  },
  audit: AuditContext,
  db: any // Database pool
): Promise<void> {
  try {
    const retentionDays = 2555; // ~7 years for compliance
    const retentionExpiry = new Date();
    retentionExpiry.setDate(retentionExpiry.getDate() + retentionDays);

    await db.query(
      `INSERT INTO audit_logs (
        tenant_id, user_id, user_email, action, resource_type, resource_id,
        resource_name, previous_state, new_state, ip_address, user_agent,
        session_id, request_id, risk_score, flagged, retention_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        ctx.tenantId,
        ctx.userId,
        ctx.email,
        audit.action,
        audit.resourceType,
        audit.resourceId,
        audit.metadata?.resourceName ?? null,
        audit.previousState ? JSON.stringify(audit.previousState) : null,
        audit.newState ? JSON.stringify(audit.newState) : null,
        ctx.ipAddress,
        ctx.userAgent,
        null, // session_id from session management
        ctx.requestId,
        calculateRiskScore(audit),
        shouldFlagAction(audit),
        retentionExpiry.toISOString(),
      ]
    );
  } catch (error) {
    // Audit logging failures must not break the request but must be alerted
    logger.error({ error, audit, userId: ctx.userId }, 'CRITICAL: Audit log write failed');
  }
}

// ─── Risk Scoring ───

function calculateRiskScore(audit: AuditContext): number {
  let score = 0;

  // High-risk actions
  const highRiskActions: AuditAction[] = ['DELETE', 'ESCALATE', 'EXPORT'];
  if (highRiskActions.includes(audit.action)) score += 30;

  // Sensitive resource types
  const sensitiveResources = ['user', 'api_key', 'tenant', 'compliance_control', 'abac_policy'];
  if (sensitiveResources.includes(audit.resourceType)) score += 20;

  // Bulk operations
  if (audit.metadata?.bulk) score += 25;

  // Off-hours (UTC)
  const hour = new Date().getUTCHours();
  if (hour < 6 || hour > 22) score += 10;

  return Math.min(score, 100);
}

function shouldFlagAction(audit: AuditContext): boolean {
  const riskScore = calculateRiskScore(audit);
  if (riskScore >= 50) return true;

  // Always flag certain actions
  const alwaysFlag: AuditAction[] = ['DELETE', 'ESCALATE'];
  if (alwaysFlag.includes(audit.action)) return true;

  // Flag if modifying IAM resources
  const iamResources = ['user', 'api_key', 'abac_policy', 'tenant'];
  if (iamResources.includes(audit.resourceType) && audit.action !== 'READ') return true;

  return false;
}
