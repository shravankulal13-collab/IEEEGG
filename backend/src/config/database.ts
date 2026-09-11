// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Database Client Configuration
// ============================================================

import pg, { type QueryResultRow } from 'pg';
import { env } from './env.js';

const { Pool } = pg;
export const pool = new Pool({ connectionString: env.DATABASE_URL });

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
	const result = await pool.query<T>(text, values);
	return result.rows;
}
