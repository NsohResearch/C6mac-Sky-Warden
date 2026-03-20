import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import * as jose from 'jose';
import { env } from '../config/env.js';
import type { Permission, SystemRole, JwtPayload } from '../../../shared/types/auth.js';
import { ROLE_PERMISSIONS } from '../../../shared/types/auth.js';
import { logger } from '../utils/logger.js';

// Extend Hono context with auth info
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    tenantId: string;
    email: string;
    roles: SystemRole[];
    permissions: Permission[];
    persona: string;
    jwtPayload: JwtPayload;
    requestId: string;
  }
}

// ─── JWT Authentication Middleware ───

export const authenticate = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const apiKey = c.req.header('X-API-Key');

  if (apiKey) {
    return authenticateApiKey(c, apiKey, next);
  }

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    const jwtPayload = payload as unknown as JwtPayload;

    // Resolve effective permissions from roles + explicit permissions
    const rolePermissions = jwtPayload.roles.flatMap(
      (role) => ROLE_PERMISSIONS[role] ?? []
    );
    const effectivePermissions = [
      ...new Set([...rolePermissions, ...jwtPayload.permissions]),
    ] as Permission[];

    c.set('userId', jwtPayload.sub);
    c.set('tenantId', jwtPayload.tenantId);
    c.set('email', jwtPayload.email);
    c.set('roles', jwtPayload.roles);
    c.set('permissions', effectivePermissions);
    c.set('persona', jwtPayload.persona);
    c.set('jwtPayload', jwtPayload);

    await next();
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new HTTPException(401, { message: 'Token expired' });
    }
    if (error instanceof jose.errors.JWTClaimValidationFailed) {
      throw new HTTPException(401, { message: 'Invalid token claims' });
    }
    if (error instanceof HTTPException) throw error;

    logger.warn({ error }, 'JWT verification failed');
    throw new HTTPException(401, { message: 'Invalid token' });
  }
});

// ─── API Key Authentication ───

async function authenticateApiKey(c: any, apiKeyValue: string, next: () => Promise<void>) {
  // API key format: c6m_{environment}_{random} — e.g., c6m_prod_abc123def456
  const parts = apiKeyValue.split('_');
  if (parts.length !== 3 || parts[0] !== 'c6m') {
    throw new HTTPException(401, { message: 'Invalid API key format' });
  }

  // Hash the key and look it up
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKeyValue);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashedKey = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // TODO: Look up hashed key in database, validate scopes, check expiry
  // For now, this is the integration point
  logger.debug({ keyPrefix: apiKeyValue.slice(0, 12) }, 'API key authentication attempt');

  throw new HTTPException(401, { message: 'API key authentication not yet configured' });
}

// ─── Authorization: Require Specific Permissions ───

export function requirePermissions(...requiredPermissions: Permission[]) {
  return createMiddleware(async (c, next) => {
    const userPermissions = c.get('permissions') as Permission[];

    const missing = requiredPermissions.filter(
      (p) => !userPermissions.includes(p)
    );

    if (missing.length > 0) {
      logger.warn({
        userId: c.get('userId'),
        tenantId: c.get('tenantId'),
        required: requiredPermissions,
        missing,
      }, 'Permission denied');

      throw new HTTPException(403, {
        message: `Insufficient permissions. Missing: ${missing.join(', ')}`,
      });
    }

    await next();
  });
}

// ─── Authorization: Require Any of the Specified Permissions ───

export function requireAnyPermission(...requiredPermissions: Permission[]) {
  return createMiddleware(async (c, next) => {
    const userPermissions = c.get('permissions') as Permission[];

    const hasAny = requiredPermissions.some((p) => userPermissions.includes(p));

    if (!hasAny) {
      throw new HTTPException(403, {
        message: `Insufficient permissions. Requires one of: ${requiredPermissions.join(', ')}`,
      });
    }

    await next();
  });
}

// ─── Authorization: Require Specific Roles ───

export function requireRoles(...requiredRoles: SystemRole[]) {
  return createMiddleware(async (c, next) => {
    const userRoles = c.get('roles') as SystemRole[];

    const hasRole = requiredRoles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      throw new HTTPException(403, {
        message: `Insufficient role. Requires one of: ${requiredRoles.join(', ')}`,
      });
    }

    await next();
  });
}

// ─── Tenant Context Middleware ───

export const tenantContext = createMiddleware(async (c, next) => {
  const tenantId = c.get('tenantId');
  if (!tenantId) {
    throw new HTTPException(400, { message: 'Tenant context required' });
  }
  // Set tenant context for RLS queries
  // This is set in the database connection pool per-request
  await next();
});

// ─── JWT Token Generation ───

export async function generateTokens(payload: Omit<JwtPayload, 'iss' | 'aud' | 'iat' | 'exp' | 'jti'>) {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const jti = crypto.randomUUID();

  const accessToken = await new jose.SignJWT({
    ...payload,
    jti,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setExpirationTime(`${env.JWT_ACCESS_TOKEN_TTL}s`)
    .sign(secret);

  const refreshToken = await new jose.SignJWT({
    sub: payload.sub,
    tenantId: payload.tenantId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setExpirationTime(`${env.JWT_REFRESH_TOKEN_TTL}s`)
    .sign(secret);

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_TOKEN_TTL,
    tokenType: 'Bearer' as const,
  };
}
