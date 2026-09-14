// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Supabase PostgreSQL Client & Connection Manager
// ============================================================

import pg, { type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';
import { DatabaseUnavailableError, DatabaseQueryError } from '../middleware/error.middleware.js';

const { Pool } = pg;

export interface DatabaseHealthResult {
  connected: boolean;
  provider: 'postgresql';
  latencyMs?: number;
  error?: string;
}

let pool: pg.Pool | null = null;
let isPostgresConnected = false;

// Initialize PostgreSQL Pool if DATABASE_URL is provided
if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
  try {
    const isSupabase =
      env.DATABASE_URL.includes('supabase') ||
      env.DATABASE_URL.includes('pooler.supabase.com') ||
      env.DATABASE_URL.includes('aws-0-');

    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isSupabase || env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      logger.error('PostgreSQL background pool error', { error: err.message });
      isPostgresConnected = false;
    });
  } catch (err: any) {
    logger.error('Failed to initialize PostgreSQL pool', { error: err.message });
    pool = null;
    isPostgresConnected = false;
  }
} else {
  logger.info('No DATABASE_URL configured. PostgreSQL pool inactive.');
}

/**
 * Executes a parameterized SQL query against Supabase PostgreSQL.
 * Throws DatabaseUnavailableError (503) or DatabaseQueryError (500) when execution fails.
 * NO silent in-memory fake data fallback.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  if (!pool) {
    isPostgresConnected = false;
    throw new DatabaseUnavailableError('PostgreSQL database connection is not configured or offline.');
  }

  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed PostgreSQL query', { duration, rows: res.rowCount ?? 0 });
    isPostgresConnected = true;
    return res;
  } catch (err: any) {
    const isConnError =
      err.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ETIMEDOUT' ||
      err.code === '57P01' || // admin_shutdown
      err.code === '57P02' || // crash_shutdown
      err.code === '57P03' || // cannot_connect_now
      err.code === '28P01' || // invalid_password
      err.message?.includes('Connection terminated') ||
      err.message?.includes('timeout') ||
      err.message?.includes('Connection refused');

    if (isConnError) {
      isPostgresConnected = false;
      logger.error('Database connection failed during query execution', { error: err.message, code: err.code });
      throw new DatabaseUnavailableError(`Database is unavailable: ${err.message}`, { code: err.code });
    }

    logger.error('Database query execution error', { error: err.message, code: err.code, query: text });
    throw new DatabaseQueryError(`Database query failed: ${err.message}`, {
      code: err.code,
      detail: err.detail,
    });
  }
}

/**
 * Checks system database health status via a real 'SELECT 1' query.
 * Never reports healthy simply from environment variables.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = Date.now();

  if (!pool) {
    isPostgresConnected = false;
    return {
      connected: false,
      provider: 'postgresql',
      error: 'PostgreSQL connection pool is not initialized (missing DATABASE_URL)',
    };
  }

  let client: pg.PoolClient | null = null;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    const latencyMs = Date.now() - start;
    isPostgresConnected = true;
    return {
      connected: true,
      provider: 'postgresql',
      latencyMs,
    };
  } catch (err: any) {
    isPostgresConnected = false;
    return {
      connected: false,
      provider: 'postgresql',
      error: err.message || 'Failed to connect to PostgreSQL database',
    };
  } finally {
    if (client) {
      try {
        client.release();
      } catch {
        // ignore release errors
      }
    }
  }
}

export { pool, isPostgresConnected };
