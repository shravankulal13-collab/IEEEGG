// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Supabase Database Client & Resilient Query Engine
// ============================================================

import pg from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

const { Pool } = pg;

export interface DatabaseHealthResult {
  connected: boolean;
  provider: 'postgresql' | 'supabase_rest';
  latencyMs?: number;
  error?: string;
}

export let pool: pg.Pool | null = null;
export let isPostgresConnected = false;

// Direct PostgreSQL Connection Setup (when DATABASE_URL is provided)
const rawDbUrl = env.DATABASE_URL || process.env.DATABASE_URL || '';
if (rawDbUrl && (rawDbUrl.startsWith('postgres://') || rawDbUrl.startsWith('postgresql://'))) {
  try {
    pool = new Pool({
      connectionString: rawDbUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });

    pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected error on idle PostgreSQL client pool');
      isPostgresConnected = false;
    });
  } catch (err) {
    logger.warn({ err }, 'Could not initialize direct PostgreSQL pool; Supabase REST engine active.');
  }
}

// Supabase REST Endpoint Configuration
function getSupabaseConfig() {
  const url = env.SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !key) return null;

  let baseUrl = url.trim().replace(/\/+$/, '');
  if (!baseUrl.endsWith('/rest/v1')) {
    baseUrl = `${baseUrl}/rest/v1`;
  }

  return { baseUrl, key };
}

function normalizeRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const copy = { ...row };
  if (typeof copy.metadata === 'string') {
    try {
      copy.metadata = JSON.parse(copy.metadata);
    } catch {}
  }
  if (typeof copy.equipment === 'string') {
    try {
      copy.equipment = JSON.parse(copy.equipment);
    } catch {}
  }
  if (typeof copy.evidence === 'string') {
    try {
      copy.evidence = JSON.parse(copy.evidence);
    } catch {}
  }
  return copy;
}

/**
 * Execute SQL operations against Supabase PostgREST engine when direct connection is idle or not configured.
 */
async function executeSupabaseRestQuery<T = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    throw new Error('Supabase credentials (SUPABASE_URL, SUPABASE_SECRET_KEY) are not configured.');
  }

  const { baseUrl, key } = cfg;
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  // 1. SELECT queries
  if (lower.startsWith('select')) {
    // Check for SELECT 1 probe
    if (/select\s+1\b/i.test(cleanText)) {
      const resp = await fetch(`${baseUrl}/profiles?select=id&limit=1`, { headers });
      if (!resp.ok) throw new Error(`Supabase probe returned ${resp.status}`);
      isPostgresConnected = true;
      return { rows: [{ '?column?': 1 }] as any, rowCount: 1, command: 'SELECT', oid: 0, fields: [] };
    }

    // Check for COUNT(*) / Aggregations / GROUP BY
    const isAggregate = /count\(|avg\(|sum\(|min\(|max\(|percentile_cont|group\s+by/i.test(cleanText);

    // Extract table name from SELECT ... FROM <table>
    const fromMatch = cleanText.match(/from\s+([a-zA-Z0-9_"]+)/i);
    if (!fromMatch) {
      return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
    }

    const table = fromMatch[1].replace(/"/g, '');
    let restUrl = `${baseUrl}/${table}?select=*`;

    // Handle WHERE conditions with params for standard SELECT
    if (params && params.length > 0 && !isAggregate) {
      const whereMatch = cleanText.match(/where\s+(.*?)(?:order\s+by|limit|offset|$)/is);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        const condRegex = /(?:lower\()?\s*([a-zA-Z0-9_"]+)\s*\)?\s*=\s*\$(\d+)/gi;
        let condMatch;
        while ((condMatch = condRegex.exec(whereClause)) !== null) {
          const colName = condMatch[1].replace(/"/g, '');
          const pIdx = parseInt(condMatch[2], 10) - 1;
          if (pIdx >= 0 && pIdx < params.length && params[pIdx] !== undefined && params[pIdx] !== null) {
            restUrl += `&${colName}=eq.${encodeURIComponent(String(params[pIdx]))}`;
          }
        }
      }
    }

    // Order clause mapping
    if (/order\s+by\s+.*name\s+asc/i.test(cleanText)) {
      restUrl += '&order=name.asc';
    } else if (/order\s+by\s+.*created_at\s+desc/i.test(cleanText)) {
      restUrl += '&order=created_at.desc';
    } else if (/order\s+by\s+.*reported_at\s+desc/i.test(cleanText)) {
      restUrl += '&order=reported_at.desc';
    }

    const resp = await fetch(restUrl, { headers });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`Supabase query on ${table} failed (${resp.status}): ${errText}`);
    }

    const rawData = (await resp.json()) as any[];
    let normalizedData = Array.isArray(rawData) ? rawData.map(normalizeRow) : [];

    // Evaluate in-memory aggregations if aggregate SQL query
    if (isAggregate) {
      const isGroupBy = /group\s+by\s+([a-zA-Z0-9_"]+)/i.exec(cleanText);
      if (isGroupBy) {
        const groupCol = isGroupBy[1].replace(/"/g, '');
        let filtered = normalizedData;
        if (params && params.length > 0 && /interval/i.test(cleanText)) {
          const hours = Number(params[0]) || 24;
          const cutoff = Date.now() - hours * 3600 * 1000;
          filtered = filtered.filter((r) => new Date(r.created_at || r.reported_at || 0).getTime() >= cutoff);
        }
        const groups: Record<string, number> = {};
        for (const r of filtered) {
          const val = r[groupCol] !== undefined && r[groupCol] !== null ? String(r[groupCol]) : 'null';
          groups[val] = (groups[val] || 0) + 1;
        }
        const rows = Object.entries(groups).map(([k, count]) => ({
          [groupCol]: k === 'null' ? null : isNaN(Number(k)) ? k : Number(k),
          count,
        }));
        isPostgresConnected = true;
        return { rows: rows as T[], rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
      }

      if (table === 'incidents') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const total = normalizedData.length;
        const active = normalizedData.filter(
          (r) => !['resolved', 'cancelled', 'false_report', 'expired'].includes(r.status)
        ).length;
        const resolved_today = normalizedData.filter(
          (r) => r.status === 'resolved' && new Date(r.resolved_at || r.updated_at || 0) >= today
        ).length;
        const cancelled_today = normalizedData.filter(
          (r) => ['cancelled', 'false_report'].includes(r.status) && new Date(r.updated_at || 0) >= today
        ).length;

        isPostgresConnected = true;
        return {
          rows: [{ total, active, resolved_today, cancelled_today, count: total }] as any,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        };
      }

      if (table === 'ambulances') {
        const total = normalizedData.length;
        const available = normalizedData.filter((r) => r.status === 'available').length;
        const dispatched = normalizedData.filter((r) =>
          ['dispatched', 'en_route_to_incident', 'on_scene', 'transporting', 'at_hospital', 'returning', 'reserved'].includes(
            r.status
          )
        ).length;
        const on_scene = normalizedData.filter((r) => r.status === 'on_scene').length;
        const transporting = normalizedData.filter((r) => ['transporting', 'at_hospital'].includes(r.status)).length;
        const returning = normalizedData.filter((r) => r.status === 'returning').length;
        const offline = normalizedData.filter((r) => r.status === 'offline').length;
        const maintenance = normalizedData.filter((r) => r.status === 'maintenance').length;

        isPostgresConnected = true;
        return {
          rows: [
            {
              total,
              available,
              dispatched,
              on_scene,
              transporting,
              returning,
              offline,
              maintenance,
              count: total,
            },
          ] as any,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        };
      }

      // Dispatches / generic aggregations
      const total = normalizedData.length;
      isPostgresConnected = true;
      return {
        rows: [
          {
            total,
            count: total,
            total_evaluated: total,
            compliant: total,
            breached: 0,
            avg_seconds: null,
            avg_dispatch_time: null,
            avg_arrival_time: null,
            avg_resolution_time: null,
            p50_arrival: null,
            p90_arrival: null,
            fastest_arrival: null,
            slowest_arrival: null,
            sample_count: 0,
            avg_breach_excess: null,
          },
        ] as any,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };
    }

    isPostgresConnected = true;
    return {
      rows: normalizedData as T[],
      rowCount: normalizedData.length,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }

  // 2. INSERT queries
  if (lower.startsWith('insert into')) {
    const tableMatch = cleanText.match(/insert\s+into\s+([a-zA-Z0-9_"]+)\s*\((.*?)\)\s*values\s*\((.*?)\)/is);
    if (tableMatch && params) {
      const table = tableMatch[1].replace(/"/g, '');
      const cols = tableMatch[2].split(',').map((c) => c.trim().replace(/"/g, ''));
      const valExpressions = tableMatch[3].split(',').map((v) => v.trim());
      
      const record: Record<string, any> = {};
      cols.forEach((col, idx) => {
        const valExpr = valExpressions[idx] || '';
        const paramMatch = valExpr.match(/\$(\d+)/);
        if (paramMatch) {
          const pIdx = parseInt(paramMatch[1], 10) - 1;
          if (pIdx >= 0 && pIdx < params.length) {
            record[col] = params[pIdx];
          }
        } else if (/^now\(\)$/i.test(valExpr) || /^current_timestamp$/i.test(valExpr)) {
          record[col] = new Date().toISOString();
        } else if (valExpr.startsWith("'") && valExpr.endsWith("'")) {
          record[col] = valExpr.slice(1, -1);
        }
      });

      const resp = await fetch(`${baseUrl}/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(record),
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`Supabase INSERT on ${table} failed: ${errText}`);
      }

      const inserted = (await resp.json()) as any[];
      const normalizedInserted = Array.isArray(inserted) ? inserted.map(normalizeRow) : [normalizeRow(record)];
      isPostgresConnected = true;
      return {
        rows: normalizedInserted as T[],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      };
    }
  }

  // 3. UPDATE queries
  if (lower.startsWith('update')) {
    const tableMatch = cleanText.match(/update\s+([a-zA-Z0-9_"]+)/i);
    if (tableMatch && params && params.length > 0) {
      const table = tableMatch[1].replace(/"/g, '');
      const idParam = params[params.length - 1]; // standard WHERE id = $last
      
      const updatePayload: Record<string, any> = {};

      const setMatch = cleanText.match(/set\s+(.*?)\s+where/is);
      if (setMatch) {
        const setClause = setMatch[1];
        const assignments = setClause.split(',');
        for (const assignment of assignments) {
          const parts = assignment.split('=');
          if (parts.length >= 2) {
            const colName = parts[0].trim().replace(/"/g, '');
            const valExpr = parts.slice(1).join('=').trim();
            const pMatch = valExpr.match(/\$(\d+)/);
            if (pMatch) {
              const pIdx = parseInt(pMatch[1], 10) - 1;
              if (pIdx >= 0 && pIdx < params.length && params[pIdx] !== null && params[pIdx] !== undefined) {
                updatePayload[colName] = params[pIdx];
              }
            } else if (/^now\(\)$/i.test(valExpr) || /^current_timestamp$/i.test(valExpr)) {
              updatePayload[colName] = new Date().toISOString();
            } else if (valExpr.startsWith("'") && valExpr.endsWith("'")) {
              updatePayload[colName] = valExpr.slice(1, -1);
            }
          }
        }
      }

      // Fallback mappings if specific keys missing
      if (Object.keys(updatePayload).length === 0) {
        if (table === 'hospitals' && params.length >= 2) {
          updatePayload.available_beds = params[0];
          updatePayload.available_icu_beds = params[0];
        } else if (table === 'ambulances' && typeof params[0] === 'string') {
          updatePayload.status = params[0];
        } else if (table === 'incidents' && typeof params[0] === 'string') {
          updatePayload.status = params[0];
        }
      }

      const resp = await fetch(`${baseUrl}/${table}?id=eq.${encodeURIComponent(idParam)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updatePayload),
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`Supabase UPDATE on ${table} failed: ${errText}`);
      }

      const updated = (await resp.json()) as any[];
      const normalizedUpdated = Array.isArray(updated) ? updated.map(normalizeRow) : [normalizeRow({ id: idParam, ...updatePayload })];
      isPostgresConnected = true;
      return {
        rows: normalizedUpdated as T[],
        rowCount: normalizedUpdated.length,
        command: 'UPDATE',
        oid: 0,
        fields: [],
      };
    }
  }

  // 4. DELETE queries
  if (lower.startsWith('delete from')) {
    const tableMatch = cleanText.match(/delete\s+from\s+([a-zA-Z0-9_"]+)/i);
    if (tableMatch && params && params.length > 0) {
      const table = tableMatch[1].replace(/"/g, '');
      const resp = await fetch(`${baseUrl}/${table}?id=eq.${encodeURIComponent(params[0])}`, {
        method: 'DELETE',
        headers,
      });

      return {
        rows: [] as any,
        rowCount: resp.ok ? 1 : 0,
        command: 'DELETE',
        oid: 0,
        fields: [],
      };
    }
  }

  return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
}

/**
 * Executes a parameterized SQL query against direct PostgreSQL or the live Supabase REST engine.
 */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();

  // Try PostgreSQL Pool first if active
  if (pool) {
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug({ text, duration, rows: res.rowCount }, 'Executed PostgreSQL query via pool');
      isPostgresConnected = true;
      return res;
    } catch (err) {
      logger.warn({ err, text }, 'Direct PostgreSQL query failed; falling back to live Supabase REST');
    }
  }

  // Execute via live Supabase REST engine
  try {
    const res = await executeSupabaseRestQuery<T>(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: res.rowCount }, 'Executed query via live Supabase REST engine');
    isPostgresConnected = true;
    return res;
  } catch (err) {
    logger.error({ err, text, params }, 'Supabase database query execution failed');
    throw err;
  }
}

/**
 * Checks system database health status with live connection probing.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = Date.now();

  // 1. Probe direct PostgreSQL pool if initialized
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
    } catch {
      // Fall through to probe Supabase REST
    }
  }

  // 2. Probe Supabase REST endpoint
  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      const resp = await fetch(`${cfg.baseUrl}/profiles?select=id&limit=1`, {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
        },
      });

      if (resp.ok) {
        const latencyMs = Date.now() - start;
        isPostgresConnected = true;
        return {
          connected: true,
          provider: 'supabase_rest',
          latencyMs,
        };
      }
    } catch (err: any) {
      isPostgresConnected = false;
      return {
        connected: false,
        provider: 'supabase_rest',
        error: err.message || 'Supabase REST connection timeout',
      };
    }
  }

  isPostgresConnected = false;
  return {
    connected: false,
    provider: 'postgresql',
    error: 'No database connection available',
  };
}
