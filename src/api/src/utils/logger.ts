import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  base: {
    service: 'c6maceye-api',
    version: process.env.npm_package_version ?? '0.1.0',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["x-api-key"]',
      'password',
      'passwordHash',
      'mfaSecret',
      'accessToken',
      'refreshToken',
      'apiKey',
      'clientSecret',
    ],
    remove: true,
  },
  serializers: {
    error: pino.stdSerializers.err,
  },
});
