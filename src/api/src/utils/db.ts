import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const { Pool } = pg;

// Connection pool with tenant isolation support
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  min: env.DATABASE_POOL_MIN,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 30_000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
});

pool.on('error', (err) => {
  logger.error({ error: err }, 'Unexpected database pool error');
});

pool.on('connect', (client) => {
  logger.debug('New database client connected');
});

// Execute a query within a tenant context (sets RLS parameter)
export async function queryWithTenant<T extends pg.QueryResultRow = any>(
  tenantId: string,
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
    const result = await client.query<T>(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Execute a query without tenant context (for cross-tenant operations)
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

// Transaction helper with tenant context
export async function withTransaction<T>(
  tenantId: string,
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rows[0]?.health === 1;
  } catch {
    return false;
  }
}
