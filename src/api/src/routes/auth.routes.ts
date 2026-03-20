import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, generateTokens, requirePermissions, requireRoles } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rate-limit.js';
import { writeAuditLog } from '../middleware/audit.js';
import { logger } from '../utils/logger.js';
import { query, queryWithTenant, pool } from '../utils/db.js';
import { ROLE_PERMISSIONS, type PersonaType, type SystemRole } from '../../../shared/types/auth.js';

const authRoutes = new Hono();

// ─── Schemas ───

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  displayName: z.string().min(1).max(100),
  persona: z.enum(['individual_pilot', 'enterprise_manager', 'agency_representative', 'developer']),
  organizationName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  mfaCode: z.string().length(6).optional(),
});

const mfaSetupSchema = z.object({
  method: z.enum(['totp', 'webauthn']),
});

const mfaVerifySchema = z.object({
  code: z.string().length(6),
});

// ─── Registration ───

authRoutes.post(
  '/register',
  authRateLimit,
  zValidator('json', registerSchema),
  async (c) => {
    const body = c.req.valid('json');
    const requestId = c.get('requestId');

    try {
      // Check for existing user
      const existing = await query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [body.email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        return c.json({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists', requestId },
        }, 409);
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(body.password, 12);

      // Determine default role based on persona
      const defaultRoles: Record<PersonaType, SystemRole> = {
        individual_pilot: 'pilot',
        enterprise_manager: 'tenant_admin',
        agency_representative: 'agency_admin',
        developer: 'developer',
      };

      const role = defaultRoles[body.persona];
      const permissions = ROLE_PERMISSIONS[role] ?? [];

      // Create tenant
      const tenantType = {
        individual_pilot: 'individual',
        enterprise_manager: 'enterprise',
        agency_representative: 'agency',
        developer: 'developer',
      } as const;

      const tenantPlan = {
        individual_pilot: 'free',
        enterprise_manager: 'enterprise',
        agency_representative: 'agency',
        developer: 'developer',
      } as const;

      const slug = body.email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);

      const tenantResult = await query(
        `INSERT INTO tenants (name, slug, type, plan)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          body.organizationName ?? body.displayName,
          slug,
          tenantType[body.persona],
          tenantPlan[body.persona],
        ]
      );

      const tenantId = tenantResult.rows[0]!.id;

      // Create user
      const userResult = await query(
        `INSERT INTO users (tenant_id, email, display_name, persona, roles, permissions, password_hash, email_verified, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8)
         RETURNING id, email, display_name, persona, roles, created_at`,
        [
          tenantId,
          body.email.toLowerCase(),
          body.displayName,
          body.persona,
          [role],
          permissions,
          passwordHash,
          JSON.stringify({
            organizationName: body.organizationName,
            phoneNumber: body.phoneNumber,
            preferences: {
              theme: 'system',
              units: 'imperial',
              mapStyle: 'satellite',
              notifications: { email: true, push: true, sms: false, tfrAlerts: true, laancUpdates: true, maintenanceReminders: true },
            },
          }),
        ]
      );

      const user = userResult.rows[0]!;

      // Create pilot profile if applicable
      if (body.persona === 'individual_pilot' || body.persona === 'enterprise_manager') {
        await query(
          'INSERT INTO pilot_profiles (user_id, tenant_id) VALUES ($1, $2)',
          [user.id, tenantId]
        );
      }

      // Generate tokens
      const tokens = await generateTokens({
        sub: user.id,
        email: user.email,
        tenantId,
        persona: body.persona,
        roles: [role],
        permissions,
      });

      logger.info({ userId: user.id, persona: body.persona }, 'User registered');

      return c.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            persona: user.persona,
            roles: [role],
            tenantId,
          },
          tokens,
        },
      }, 201);
    } catch (error) {
      logger.error({ error, email: body.email }, 'Registration failed');
      return c.json({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message: 'Registration failed', requestId },
      }, 500);
    }
  }
);

// ─── Login ───

authRoutes.post(
  '/login',
  authRateLimit,
  zValidator('json', loginSchema),
  async (c) => {
    const body = c.req.valid('json');
    const requestId = c.get('requestId');

    const result = await query(
      `SELECT u.id, u.email, u.display_name, u.persona, u.roles, u.permissions,
              u.password_hash, u.mfa_enabled, u.mfa_method, u.mfa_secret_encrypted,
              u.tenant_id, u.email_verified
       FROM users u
       WHERE u.email = $1
       LIMIT 1`,
      [body.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Constant-time delay to prevent timing attacks
      const bcrypt = await import('bcryptjs');
      await bcrypt.compare(body.password, '$2a$12$dummy_hash_for_timing_attack_prevention');
      return c.json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', requestId },
      }, 401);
    }

    const user = result.rows[0]!;

    // Verify password
    const bcrypt = await import('bcryptjs');
    const validPassword = await bcrypt.compare(body.password, user.password_hash);
    if (!validPassword) {
      logger.warn({ email: body.email }, 'Failed login attempt');
      return c.json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', requestId },
      }, 401);
    }

    // MFA check
    if (user.mfa_enabled) {
      if (!body.mfaCode) {
        return c.json({
          success: false,
          error: { code: 'MFA_REQUIRED', message: 'MFA code required', requestId },
          data: { mfaRequired: true, mfaMethod: user.mfa_method },
        }, 403);
      }
      // TODO: Verify TOTP/WebAuthn code
    }

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Generate tokens
    const tokens = await generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      persona: user.persona,
      roles: user.roles,
      permissions: user.permissions,
    });

    // Audit log
    await writeAuditLog(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        email: user.email,
        requestId,
        ipAddress: c.req.header('X-Forwarded-For') ?? c.req.header('X-Real-IP') ?? '0.0.0.0',
        userAgent: c.req.header('User-Agent') ?? 'unknown',
      },
      {
        action: 'LOGIN',
        resourceType: 'user',
        resourceId: user.id,
      },
      pool
    );

    logger.info({ userId: user.id, persona: user.persona }, 'User logged in');

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          persona: user.persona,
          roles: user.roles,
          tenantId: user.tenant_id,
          mfaEnabled: user.mfa_enabled,
          emailVerified: user.email_verified,
        },
        tokens,
      },
    });
  }
);

// ─── Get Current User ───

authRoutes.get(
  '/me',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const tenantId = c.get('tenantId');

    const result = await queryWithTenant(tenantId,
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.persona, u.roles, u.permissions,
              u.mfa_enabled, u.mfa_method, u.email_verified, u.last_login_at, u.metadata,
              u.tenant_id, u.created_at, u.updated_at,
              t.name as tenant_name, t.plan as tenant_plan, t.type as tenant_type
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found', requestId: c.get('requestId') },
      }, 404);
    }

    const user = result.rows[0]!;

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        persona: user.persona,
        roles: user.roles,
        permissions: user.permissions,
        mfaEnabled: user.mfa_enabled,
        mfaMethod: user.mfa_method,
        emailVerified: user.email_verified,
        lastLoginAt: user.last_login_at,
        metadata: user.metadata,
        tenant: {
          id: user.tenant_id,
          name: user.tenant_name,
          plan: user.tenant_plan,
          type: user.tenant_type,
        },
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  }
);

// ─── MFA Setup ───

authRoutes.post(
  '/mfa/setup',
  authenticate,
  zValidator('json', mfaSetupSchema),
  async (c) => {
    const userId = c.get('userId');
    const { method } = c.req.valid('json');

    if (method === 'totp') {
      // Generate TOTP secret
      const { nanoid } = await import('nanoid');
      const secret = nanoid(32);

      // Store encrypted secret (pending verification)
      await query(
        'UPDATE users SET mfa_secret_encrypted = $1, mfa_method = $2 WHERE id = $3',
        [secret, method, userId] // TODO: encrypt secret with ENCRYPTION_KEY
      );

      // Generate provisioning URI
      const email = c.get('email');
      const otpauthUrl = `otpauth://totp/C6macEye:${email}?secret=${secret}&issuer=C6macEye&algorithm=SHA1&digits=6&period=30`;

      return c.json({
        success: true,
        data: {
          method: 'totp',
          secret,
          otpauthUrl,
          message: 'Scan the QR code with your authenticator app, then verify with a code',
        },
      });
    }

    return c.json({
      success: false,
      error: { code: 'UNSUPPORTED', message: `MFA method '${method}' not yet supported`, requestId: c.get('requestId') },
    }, 400);
  }
);

authRoutes.post(
  '/mfa/verify',
  authenticate,
  zValidator('json', mfaVerifySchema),
  async (c) => {
    const userId = c.get('userId');
    const { code } = c.req.valid('json');

    // TODO: Verify TOTP code against stored secret
    // For now, enable MFA
    await query(
      'UPDATE users SET mfa_enabled = TRUE WHERE id = $1',
      [userId]
    );

    logger.info({ userId }, 'MFA enabled');

    return c.json({
      success: true,
      data: { mfaEnabled: true },
    });
  }
);

// ─── User Management (Enterprise) ───

authRoutes.get(
  '/users',
  authenticate,
  requirePermissions('users:read'),
  zValidator('query', z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
    role: z.string().optional(),
    search: z.string().optional(),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { page, pageSize, role, search } = c.req.valid('query');
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const params: unknown[] = [tenantId, pageSize, offset];
    let paramIdx = 4;

    if (role) {
      whereClause += ` AND $${paramIdx}::system_role = ANY(u.roles)`;
      params.push(role);
      paramIdx++;
    }

    if (search) {
      whereClause += ` AND (u.display_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await queryWithTenant(tenantId,
      `SELECT COUNT(*) FROM users u WHERE u.tenant_id = $1 ${whereClause}`,
      [tenantId, ...params.slice(3)]
    );

    const result = await queryWithTenant(tenantId,
      `SELECT u.id, u.email, u.display_name, u.persona, u.roles, u.mfa_enabled,
              u.email_verified, u.last_login_at, u.created_at
       FROM users u
       WHERE u.tenant_id = $1 ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $2 OFFSET $3`,
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

authRoutes.patch(
  '/users/:id/roles',
  authenticate,
  requirePermissions('users:manage_roles'),
  zValidator('json', z.object({
    roles: z.array(z.enum([
      'super_admin', 'tenant_admin', 'fleet_manager', 'pilot',
      'safety_officer', 'agency_admin', 'agency_operator', 'developer', 'viewer',
    ])).min(1),
  })),
  async (c) => {
    const tenantId = c.get('tenantId');
    const targetUserId = c.req.param('id');
    const { roles } = c.req.valid('json');

    // Prevent self-demotion from admin
    if (targetUserId === c.get('userId') && !roles.includes('tenant_admin') && !roles.includes('super_admin')) {
      return c.json({
        success: false,
        error: { code: 'SELF_DEMOTION', message: 'Cannot remove your own admin role', requestId: c.get('requestId') },
      }, 400);
    }

    // Resolve permissions from roles
    const permissions = [...new Set(roles.flatMap((r: SystemRole) => ROLE_PERMISSIONS[r] ?? []))];

    const result = await queryWithTenant(tenantId,
      `UPDATE users SET roles = $1, permissions = $2, updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING id, email, display_name, roles, permissions`,
      [roles, permissions, targetUserId, tenantId]
    );

    if (result.rows.length === 0) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found', requestId: c.get('requestId') },
      }, 404);
    }

    // Audit
    await writeAuditLog(
      {
        userId: c.get('userId'),
        tenantId,
        email: c.get('email'),
        requestId: c.get('requestId'),
        ipAddress: c.req.header('X-Forwarded-For') ?? '0.0.0.0',
        userAgent: c.req.header('User-Agent') ?? 'unknown',
      },
      {
        action: 'UPDATE',
        resourceType: 'user',
        resourceId: targetUserId,
        newState: { roles },
      },
      pool
    );

    logger.info({ targetUserId, roles, updatedBy: c.get('userId') }, 'User roles updated');

    return c.json({ success: true, data: result.rows[0] });
  }
);

export { authRoutes };
