import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(20),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default('c6maceye'),
  JWT_AUDIENCE: z.string().default('c6maceye-api'),
  JWT_ACCESS_TOKEN_TTL: z.coerce.number().default(900), // 15 minutes
  JWT_REFRESH_TOKEN_TTL: z.coerce.number().default(604800), // 7 days

  // Encryption
  ENCRYPTION_KEY: z.string().min(32),

  // FAA Integration
  FAA_LAANC_API_URL: z.string().url().default('https://api.faa.gov/laanc'),
  FAA_LAANC_API_KEY: z.string().optional(),
  FAA_LAANC_USS_ID: z.string().default('C6M'), // 3-char USS identifier
  FAA_UDDS_URL: z.string().url().default('https://udds-faa.opendata.arcgis.com'),

  // Weather
  WEATHER_API_KEY: z.string().optional(),
  WEATHER_API_URL: z.string().url().default('https://api.openweathermap.org/data/3.0'),

  // Maps
  MAPBOX_ACCESS_TOKEN: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@c6maceye.com'),

  // S3-compatible storage
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().default('c6maceye'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In development, provide sensible defaults
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/c6maceye',
      SUPABASE_URL: process.env.SUPABASE_URL ?? 'http://localhost:54321',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? 'dev-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'dev-service-role-key',
      JWT_SECRET: process.env.JWT_SECRET ?? 'dev-jwt-secret-minimum-32-characters-long',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? 'dev-encryption-key-minimum-32-chars',
    });
  }
  return result.data;
}

export const env = loadEnv();
