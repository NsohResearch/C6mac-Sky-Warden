import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { queryWithTenant } from '../utils/db.js';
import { logger } from '../utils/logger.js';

const complianceRoutes = new Hono();

// ─── Audit Logs ───

complianceRoutes.get(
  '/audit-logs',
  authenticate,
  requirePermissions('compliance:audit'),
  zValidator('query', z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(50),
    userId: z.string().uuid().optional(),
    action: z.string().optional(),
    resourceType: z.string().optional(),
    resourceId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    flaggedOnly: z.coerce.boolean().default(false),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const {
      page, pageSize, userId, action, resourceType, resourceId,
      startDate, endDate, flaggedOnly, sortOrder,
    } = c.req.valid('query');
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE al.tenant_id = $1';
    const params: unknown[] = [tenantId];
    let paramIdx = 2;

    if (userId) {
      whereClause += ` AND al.user_id = $${paramIdx}`;
      params.push(userId);
      paramIdx++;
    }
    if (action) {
      whereClause += ` AND al.action = $${paramIdx}::audit_action`;
      params.push(action);
      paramIdx++;
    }
    if (resourceType) {
      whereClause += ` AND al.resource_type = $${paramIdx}`;
      params.push(resourceType);
      paramIdx++;
    }
    if (resourceId) {
      whereClause += ` AND al.resource_id = $${paramIdx}`;
      params.push(resourceId);
      paramIdx++;
    }
    if (startDate) {
      whereClause += ` AND al.timestamp >= $${paramIdx}`;
      params.push(startDate);
      paramIdx++;
    }
    if (endDate) {
      whereClause += ` AND al.timestamp <= $${paramIdx}`;
      params.push(endDate);
      paramIdx++;
    }
    if (flaggedOnly) {
      whereClause += ' AND al.flagged = TRUE';
    }

    // Note: audit_logs has RLS disabled (no tenant_id FK), so we filter explicitly
    const countResult = await queryWithTenant(tenantId,
      `SELECT COUNT(*) FROM audit_logs al ${whereClause}`,
      params
    );

    params.push(pageSize, offset);
    const result = await queryWithTenant(tenantId,
      `SELECT al.id, al.timestamp, al.user_id, al.user_email, al.action,
              al.resource_type, al.resource_id, al.resource_name,
              al.ip_address, al.risk_score, al.flagged, al.flag_reason
       FROM audit_logs al
       ${whereClause}
       ORDER BY al.timestamp ${sortOrder}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      params
    );

    const totalItems = parseInt(countResult.rows[0]?.count ?? '0');

    return c.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasNext: page * pageSize < totalItems,
        hasPrevious: page > 1,
      },
    });
  }
);

// ─── Compliance Controls ───

complianceRoutes.get(
  '/controls',
  authenticate,
  requirePermissions('compliance:read'),
  zValidator('query', z.object({
    framework: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { framework, status, category } = c.req.valid('query');

    let whereClause = 'WHERE tenant_id = $1';
    const params: unknown[] = [tenantId];
    let paramIdx = 2;

    if (framework) {
      whereClause += ` AND framework = $${paramIdx}`;
      params.push(framework);
      paramIdx++;
    }
    if (status) {
      whereClause += ` AND status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }
    if (category) {
      whereClause += ` AND category = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    const result = await queryWithTenant(tenantId,
      `SELECT id, framework, control_id, title, description, category,
              status, evidence, last_assessed_at, next_assessment_due, assigned_to, notes
       FROM compliance_controls
       ${whereClause}
       ORDER BY framework, control_id`,
      params
    );

    return c.json({ success: true, data: result.rows });
  }
);

complianceRoutes.patch(
  '/controls/:id',
  authenticate,
  requirePermissions('compliance:write'),
  zValidator('json', z.object({
    status: z.enum(['compliant', 'non_compliant', 'partial', 'not_applicable', 'under_review']).optional(),
    notes: z.string().optional(),
    assignedTo: z.string().uuid().optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const sets: string[] = [];
    const params: unknown[] = [id, tenantId];
    let paramIdx = 3;

    if (body.status) {
      sets.push(`status = $${paramIdx}`);
      params.push(body.status);
      paramIdx++;
    }
    if (body.notes !== undefined) {
      sets.push(`notes = $${paramIdx}`);
      params.push(body.notes);
      paramIdx++;
    }
    if (body.assignedTo) {
      sets.push(`assigned_to = $${paramIdx}`);
      params.push(body.assignedTo);
      paramIdx++;
    }
    sets.push('last_assessed_at = NOW()');

    const result = await queryWithTenant(tenantId,
      `UPDATE compliance_controls SET ${sets.join(', ')}
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, framework, control_id, title, status, last_assessed_at`,
      params
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found', requestId: c.get('requestId') } }, 404);
    }

    return c.json({ success: true, data: result.rows[0] });
  }
);

// ─── Compliance Dashboard ───

complianceRoutes.get(
  '/dashboard',
  authenticate,
  requirePermissions('compliance:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const frameworkStats = await queryWithTenant(tenantId,
      `SELECT framework,
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE status = 'compliant') as compliant,
              COUNT(*) FILTER (WHERE status = 'non_compliant') as non_compliant,
              COUNT(*) FILTER (WHERE status = 'partial') as partial,
              COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
              COUNT(*) FILTER (WHERE status = 'not_applicable') as not_applicable
       FROM compliance_controls
       WHERE tenant_id = $1
       GROUP BY framework
       ORDER BY framework`,
      [tenantId]
    );

    const expiringCerts = await queryWithTenant(tenantId,
      `SELECT
        COUNT(*) FILTER (WHERE faa_registration_expiry < NOW() + INTERVAL '30 days') as expiring_registrations,
        COUNT(*) FILTER (WHERE faa_registration_expiry < NOW()) as expired_registrations,
        COUNT(*) FILTER (WHERE NOT remote_id_compliant) as non_compliant_remote_id
       FROM drones
       WHERE tenant_id = $1 AND status != 'decommissioned'`,
      [tenantId]
    );

    const pilotCerts = await queryWithTenant(tenantId,
      `SELECT
        COUNT(*) FILTER (WHERE part107_expires_at < NOW() + INTERVAL '30 days') as expiring_part107,
        COUNT(*) FILTER (WHERE part107_expires_at < NOW()) as expired_part107
       FROM pilot_profiles
       WHERE tenant_id = $1`,
      [tenantId]
    );

    const recentFlags = await queryWithTenant(tenantId,
      `SELECT COUNT(*) as count
       FROM audit_logs
       WHERE tenant_id = $1 AND flagged = TRUE AND timestamp > NOW() - INTERVAL '7 days'`,
      [tenantId]
    );

    return c.json({
      success: true,
      data: {
        frameworks: frameworkStats.rows.map((row: any) => ({
          framework: row.framework,
          total: parseInt(row.total),
          compliant: parseInt(row.compliant),
          nonCompliant: parseInt(row.non_compliant),
          partial: parseInt(row.partial),
          underReview: parseInt(row.under_review),
          score: Math.round(
            (parseInt(row.compliant) / Math.max(parseInt(row.total) - parseInt(row.not_applicable), 1)) * 100
          ),
        })),
        fleet: {
          expiringRegistrations: parseInt(expiringCerts.rows[0]?.expiring_registrations ?? '0'),
          expiredRegistrations: parseInt(expiringCerts.rows[0]?.expired_registrations ?? '0'),
          nonCompliantRemoteId: parseInt(expiringCerts.rows[0]?.non_compliant_remote_id ?? '0'),
        },
        pilots: {
          expiringPart107: parseInt(pilotCerts.rows[0]?.expiring_part107 ?? '0'),
          expiredPart107: parseInt(pilotCerts.rows[0]?.expired_part107 ?? '0'),
        },
        security: {
          flaggedActionsLast7Days: parseInt(recentFlags.rows[0]?.count ?? '0'),
        },
      },
    });
  }
);

// ─── Export Compliance Report ───

complianceRoutes.post(
  '/reports/generate',
  authenticate,
  requirePermissions('compliance:export'),
  zValidator('json', z.object({
    framework: z.string(),
    format: z.enum(['pdf', 'csv', 'json']).default('json'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    // Get all controls for the framework
    const controls = await queryWithTenant(tenantId,
      `SELECT id, framework, control_id, title, description, category,
              status, evidence, last_assessed_at, notes
       FROM compliance_controls
       WHERE tenant_id = $1 AND framework = $2
       ORDER BY control_id`,
      [tenantId, body.framework]
    );

    const summary = {
      totalControls: controls.rows.length,
      compliant: controls.rows.filter((r: any) => r.status === 'compliant').length,
      nonCompliant: controls.rows.filter((r: any) => r.status === 'non_compliant').length,
      partial: controls.rows.filter((r: any) => r.status === 'partial').length,
      notApplicable: controls.rows.filter((r: any) => r.status === 'not_applicable').length,
      overallScore: 0,
    };

    const applicable = summary.totalControls - summary.notApplicable;
    summary.overallScore = applicable > 0
      ? Math.round((summary.compliant / applicable) * 100)
      : 100;

    logger.info({ framework: body.framework, format: body.format, tenantId, userId }, 'Compliance report generated');

    return c.json({
      success: true,
      data: {
        framework: body.framework,
        generatedAt: new Date().toISOString(),
        generatedBy: userId,
        summary,
        controls: controls.rows,
        format: body.format,
      },
    });
  }
);

// ─── Access Review ───

complianceRoutes.get(
  '/access-reviews',
  authenticate,
  requirePermissions('compliance:audit'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const users = await queryWithTenant(tenantId,
      `SELECT u.id, u.email, u.display_name, u.roles, u.permissions,
              u.last_login_at, u.mfa_enabled, u.created_at
       FROM users u
       WHERE u.tenant_id = $1
       ORDER BY u.last_login_at ASC NULLS FIRST`,
      [tenantId]
    );

    const reviewEntries = users.rows.map((user: any) => {
      const flags: string[] = [];
      if (!user.mfa_enabled) flags.push('MFA not enabled');
      if (!user.last_login_at) flags.push('Never logged in');
      if (user.last_login_at && new Date(user.last_login_at) < new Date(Date.now() - 90 * 86_400_000)) {
        flags.push('Inactive > 90 days');
      }
      if (user.roles.includes('super_admin') || user.roles.includes('tenant_admin')) {
        flags.push('Admin role — verify necessity');
      }

      return {
        userId: user.id,
        email: user.email,
        displayName: user.display_name,
        roles: user.roles,
        permissionCount: user.permissions.length,
        mfaEnabled: user.mfa_enabled,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        flags,
        riskLevel: flags.length >= 3 ? 'high' : flags.length >= 1 ? 'medium' : 'low',
      };
    });

    return c.json({
      success: true,
      data: {
        reviewDate: new Date().toISOString(),
        totalUsers: reviewEntries.length,
        highRisk: reviewEntries.filter((e: any) => e.riskLevel === 'high').length,
        mediumRisk: reviewEntries.filter((e: any) => e.riskLevel === 'medium').length,
        lowRisk: reviewEntries.filter((e: any) => e.riskLevel === 'low').length,
        entries: reviewEntries,
      },
    });
  }
);

export { complianceRoutes };
