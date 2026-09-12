// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Database Client Configuration
// ============================================================

import pg, { type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
	connectionString: env.DATABASE_URL,
	ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []): Promise<QueryResult<T>> {
	return pool.query<T>(text, values);
}
