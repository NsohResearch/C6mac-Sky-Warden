import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// In-memory rate limiter (production should use Redis-backed)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000);

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: any) => string;
  message?: string;
}

export function rateLimit(config?: Partial<RateLimitConfig>) {
  const windowMs = config?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = config?.maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS;
  const message = config?.message ?? 'Too many requests, please try again later';

  return createMiddleware(async (c, next) => {
    const key = config?.keyGenerator?.(c)
      ?? c.get('userId')
      ?? c.req.header('X-Forwarded-For')
      ?? c.req.header('X-Real-IP')
      ?? 'anonymous';

    const rateLimitKey = `rl:${key}`;
    const now = Date.now();
    const entry = rateLimitStore.get(rateLimitKey);

    if (!entry || entry.resetAt < now) {
      rateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + windowMs });
      setRateLimitHeaders(c, maxRequests, maxRequests - 1, Math.ceil(windowMs / 1000));
      await next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      setRateLimitHeaders(c, maxRequests, 0, retryAfter);

      logger.warn({ key, count: entry.count, maxRequests }, 'Rate limit exceeded');

      throw new HTTPException(429, { message });
    }

    setRateLimitHeaders(c, maxRequests, maxRequests - entry.count, Math.ceil((entry.resetAt - now) / 1000));
    await next();
  });
}

function setRateLimitHeaders(c: any, limit: number, remaining: number, reset: number) {
  c.header('X-RateLimit-Limit', String(limit));
  c.header('X-RateLimit-Remaining', String(Math.max(0, remaining)));
  c.header('X-RateLimit-Reset', String(reset));
}

// Stricter rate limit for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 900_000,     // 15 minutes
  maxRequests: 10,        // 10 attempts per 15 min
  keyGenerator: (c: any) => {
    const ip = c.req.header('X-Forwarded-For') ?? c.req.header('X-Real-IP') ?? 'unknown';
    return `auth:${ip}`;
  },
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// Rate limit for LAANC submissions
export const laancRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 30,
  message: 'Too many LAANC requests. Please try again in a minute.',
});
