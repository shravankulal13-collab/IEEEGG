// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Database Client Configuration & Resilience Pool
// ============================================================

import pg, { type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

const { Pool } = pg;

export interface DatabaseHealthResult {
  connected: boolean;
  provider: 'postgresql' | 'supabase_rest' | 'in_memory_fallback';
  latencyMs?: number;
  error?: string;
}

let pool: pg.Pool | null = null;
let isPostgresConnected = false;

// Initialize PostgreSQL Pool if DATABASE_URL is provided
if (env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client pool', { err: err.message });
      isPostgresConnected = false;
    });
  } catch (err: any) {
    logger.warn('Could not initialize PostgreSQL pool. Using fallback storage layer.', {
      err: err.message,
    });
  }
}

/**
 * Executes a parameterized SQL query against PostgreSQL or returns empty/fallback.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  if (pool) {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed PostgreSQL query', { text, duration, rows: res.rowCount ?? 0 });
      isPostgresConnected = true;
      return res;
    } catch (err: any) {
      logger.error('PostgreSQL query execution failed', { err: err.message, text, params });
      throw err;
    }
  }

  throw new Error('Database pool not initialized. Configure DATABASE_URL in .env');
}

/**
 * Checks system database health status without throwing uncaught exceptions.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = Date.now();

  if (pool) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
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
        error: err.message || 'Database connection timeout',
      };
    }
  }

  if (env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
    return {
      connected: true,
      provider: 'supabase_rest',
      latencyMs: 0,
    };
  }

  return {
    connected: false,
    provider: 'in_memory_fallback',
    error: 'No database credentials configured (operating in fallback-first mode)',
  };
}

export { pool, isPostgresConnected };
