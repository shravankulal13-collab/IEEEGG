// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Operational Intelligence & Analytics Service
// ============================================================

import { query } from '../../config/database';

// ============================================================
// SLA Configuration
// SLA = ambulance must arrive at the scene within this many
// seconds of the incident being reported.
// Adjust to match operational policy; currently 15 minutes.
// ============================================================
const SLA_ARRIVAL_THRESHOLD_SECONDS = 900;

// ============================================================
// Return-type interfaces
// ============================================================

export interface OperationalOverview {
  total_incidents: number;
  active_incidents: number;
  resolved_today: number;
  cancelled_today: number;
  available_ambulances: number;
  dispatched_ambulances: number;
  total_ambulances: number;
  /** Average ambulance-at-scene time in seconds. Null if no data. */
  average_response_time_seconds: number | null;
  /** SLA compliance percentage (0–100). Null if no completed dispatches. */
  sla_compliance_percent: number | null;
}

export interface IncidentBreakdown {
  by_status: Array<{ status: string; count: number }>;
  by_type: Array<{ emergency_type: string; count: number }>;
  by_severity: Array<{ severity: number | null; count: number }>;
}

export interface ResponseTimeMetrics {
  /** Average seconds from reported_at to dispatched_at. */
  avg_dispatch_time_seconds: number | null;
  /** Average seconds from reported_at to arrived_at (on-scene). */
  avg_arrival_time_seconds: number | null;
  /** Average seconds from reported_at to resolved_at. */
  avg_resolution_time_seconds: number | null;
  /** Median arrival time (P50). */
  p50_arrival_seconds: number | null;
  /** 90th-percentile arrival time (P90). */
  p90_arrival_seconds: number | null;
  fastest_arrival_seconds: number | null;
  slowest_arrival_seconds: number | null;
  /** Number of dispatches included in the computation. */
  sample_count: number;
}

export interface SLAMetrics {
  sla_threshold_seconds: number;
  total_evaluated: number;
  compliant: number;
  breached: number;
  compliance_percent: number | null;
  /** Average number of seconds by which breached dispatches exceeded the SLA. */
  average_breach_excess_seconds: number | null;
}

export interface AmbulanceUtilization {
  total: number;
  available: number;
  dispatched: number;
  on_scene: number;
  transporting: number;
  returning: number;
  offline: number;
  maintenance: number;
  /** Percentage of fleet actively engaged (not available/offline/maintenance). */
  utilization_percent: number | null;
}

export interface AuditLogEntry {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogPage {
  entries: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================
// Helper
// ============================================================

function toNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = parseFloat(String(val));
  return isNaN(n) ? null : n;
}

function toInt(val: unknown): number {
  return parseInt(String(val ?? '0'), 10) || 0;
}

// ============================================================
// Service
// ============================================================

export class AnalyticsService {
  // ----------------------------------------------------------
  // 1. Operational Overview
  // ----------------------------------------------------------

  /**
   * Returns a high-level snapshot of the current operational state.
   * Used by the Command Center dashboard header panel.
   */
  async getOperationalOverview(): Promise<OperationalOverview> {
    const [incidents, ambulances, avgResponse, slaCompliance] = await Promise.all([
      this._incidentCounts(),
      this._ambulanceCounts(),
      this._avgArrivalTime(),
      this._slaCompliancePercent(),
    ]);

    return {
      total_incidents: incidents.total,
      active_incidents: incidents.active,
      resolved_today: incidents.resolved_today,
      cancelled_today: incidents.cancelled_today,
      available_ambulances: ambulances.available,
      dispatched_ambulances: ambulances.dispatched,
      total_ambulances: ambulances.total,
      average_response_time_seconds: avgResponse,
      sla_compliance_percent: slaCompliance,
    };
  }

  private async _incidentCounts() {
    const res = await query(
      `SELECT
         COUNT(*)::INT                                                              AS total,
         COUNT(*) FILTER (
           WHERE status NOT IN ('resolved','cancelled','false_report','expired')
         )::INT                                                                     AS active,
         COUNT(*) FILTER (
           WHERE status = 'resolved' AND resolved_at >= CURRENT_DATE
         )::INT                                                                     AS resolved_today,
         COUNT(*) FILTER (
           WHERE status IN ('cancelled','false_report')
             AND updated_at >= CURRENT_DATE
         )::INT                                                                     AS cancelled_today
       FROM incidents`
    );
    const r = res.rows[0];
    return {
      total: toInt(r.total),
      active: toInt(r.active),
      resolved_today: toInt(r.resolved_today),
      cancelled_today: toInt(r.cancelled_today),
    };
  }

  private async _ambulanceCounts() {
    const res = await query(
      `SELECT
         COUNT(*)::INT                                                              AS total,
         COUNT(*) FILTER (WHERE status = 'available')::INT                         AS available,
         COUNT(*) FILTER (
           WHERE status IN (
             'dispatched','en_route_to_incident','on_scene',
             'transporting','at_hospital','returning','reserved'
           )
         )::INT                                                                     AS dispatched
       FROM ambulances`
    );
    const r = res.rows[0];
    return {
      total: toInt(r.total),
      available: toInt(r.available),
      dispatched: toInt(r.dispatched),
    };
  }

  private async _avgArrivalTime(): Promise<number | null> {
    const res = await query(
      `SELECT AVG(
         EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at))
       )::NUMERIC(10,2) AS avg_seconds
       FROM dispatches d
       JOIN incidents i ON d.incident_id = i.id
       WHERE d.arrived_at IS NOT NULL
         AND d.status IN ('arrived','transporting','completed')`
    );
    return toNum(res.rows[0]?.avg_seconds);
  }

  private async _slaCompliancePercent(): Promise<number | null> {
    const res = await query(
      `SELECT
         COUNT(*)::INT AS total,
         COUNT(*) FILTER (
           WHERE EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at)) <= $1
         )::INT        AS compliant
       FROM dispatches d
       JOIN incidents i ON d.incident_id = i.id
       WHERE d.arrived_at IS NOT NULL
         AND d.status IN ('arrived','transporting','completed')`,
      [SLA_ARRIVAL_THRESHOLD_SECONDS]
    );
    const total = toInt(res.rows[0]?.total);
    const compliant = toInt(res.rows[0]?.compliant);
    if (total === 0) return null;
    return Math.round((compliant / total) * 1000) / 10; // one decimal
  }

  // ----------------------------------------------------------
  // 2. Incident Breakdown
  // ----------------------------------------------------------

  /**
   * Break down incidents by status, emergency type, and severity
   * over a configurable time window.
   *
   * @param windowHours Look-back window in hours (1–720). Default 24.
   */
  async getIncidentBreakdown(windowHours = 24): Promise<IncidentBreakdown> {
    const [byStatus, byType, bySeverity] = await Promise.all([
      query(
        `SELECT status, COUNT(*)::INT AS count
         FROM incidents
         WHERE created_at >= NOW() - ($1 * INTERVAL '1 hour')
         GROUP BY status
         ORDER BY count DESC`,
        [windowHours]
      ),
      query(
        `SELECT emergency_type, COUNT(*)::INT AS count
         FROM incidents
         WHERE created_at >= NOW() - ($1 * INTERVAL '1 hour')
         GROUP BY emergency_type
         ORDER BY count DESC`,
        [windowHours]
      ),
      query(
        `SELECT severity, COUNT(*)::INT AS count
         FROM incidents
         WHERE created_at >= NOW() - ($1 * INTERVAL '1 hour')
         GROUP BY severity
         ORDER BY severity ASC NULLS LAST`,
        [windowHours]
      ),
    ]);

    return {
      by_status: byStatus.rows.map((r) => ({ status: r.status, count: toInt(r.count) })),
      by_type: byType.rows.map((r) => ({
        emergency_type: r.emergency_type,
        count: toInt(r.count),
      })),
      by_severity: bySeverity.rows.map((r) => ({
        severity: r.severity !== null ? toInt(r.severity) : null,
        count: toInt(r.count),
      })),
    };
  }

  // ----------------------------------------------------------
  // 3. Response Time Metrics
  // ----------------------------------------------------------

  /**
   * Compute detailed response-time statistics with percentiles.
   *
   * @param windowHours Look-back window in hours (1–720). Default 24.
   */
  async getResponseTimeMetrics(windowHours = 24): Promise<ResponseTimeMetrics> {
    const res = await query(
      `SELECT
         AVG(
           EXTRACT(EPOCH FROM (d.dispatched_at - i.reported_at))
         )::NUMERIC(10,2)                                                         AS avg_dispatch_time,
         AVG(
           EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at))
         )::NUMERIC(10,2)                                                         AS avg_arrival_time,
         AVG(
           EXTRACT(EPOCH FROM (i.resolved_at - i.reported_at))
         )::NUMERIC(10,2)                                                         AS avg_resolution_time,
         PERCENTILE_CONT(0.5) WITHIN GROUP (
           ORDER BY EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at))
         )::NUMERIC(10,2)                                                         AS p50_arrival,
         PERCENTILE_CONT(0.9) WITHIN GROUP (
           ORDER BY EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at))
         )::NUMERIC(10,2)                                                         AS p90_arrival,
         MIN(
           EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at))
         )::NUMERIC(10,2)                                                         AS fastest_arrival,
         MAX(
           EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at))
         )::NUMERIC(10,2)                                                         AS slowest_arrival,
         COUNT(d.arrived_at)::INT                                                  AS sample_count
       FROM dispatches d
       JOIN incidents i ON d.incident_id = i.id
       WHERE d.created_at >= NOW() - ($1 * INTERVAL '1 hour')
         AND d.arrived_at IS NOT NULL`,
      [windowHours]
    );

    const r = res.rows[0];
    return {
      avg_dispatch_time_seconds: toNum(r.avg_dispatch_time),
      avg_arrival_time_seconds: toNum(r.avg_arrival_time),
      avg_resolution_time_seconds: toNum(r.avg_resolution_time),
      p50_arrival_seconds: toNum(r.p50_arrival),
      p90_arrival_seconds: toNum(r.p90_arrival),
      fastest_arrival_seconds: toNum(r.fastest_arrival),
      slowest_arrival_seconds: toNum(r.slowest_arrival),
      sample_count: toInt(r.sample_count),
    };
  }

  // ----------------------------------------------------------
  // 4. SLA Metrics
  // ----------------------------------------------------------

  /**
   * Compute SLA compliance for the specified time window.
   * SLA = ambulance arrived at scene within SLA_ARRIVAL_THRESHOLD_SECONDS
   * of the incident being reported.
   *
   * @param windowHours Look-back window in hours (1–720). Default 24.
   */
  async getSLAMetrics(windowHours = 24): Promise<SLAMetrics> {
    const res = await query(
      `SELECT
         COUNT(*)::INT                                                AS total_evaluated,
         COUNT(*) FILTER (
           WHERE EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at)) <= $2
         )::INT                                                       AS compliant,
         COUNT(*) FILTER (
           WHERE EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at)) > $2
         )::INT                                                       AS breached,
         AVG(
           CASE
             WHEN EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at)) > $2
             THEN EXTRACT(EPOCH FROM (d.arrived_at - i.reported_at)) - $2
           END
         )::NUMERIC(10,2)                                             AS avg_breach_excess
       FROM dispatches d
       JOIN incidents i ON d.incident_id = i.id
       WHERE d.created_at >= NOW() - ($1 * INTERVAL '1 hour')
         AND d.arrived_at IS NOT NULL`,
      [windowHours, SLA_ARRIVAL_THRESHOLD_SECONDS]
    );

    const r = res.rows[0];
    const total = toInt(r.total_evaluated);
    const compliant = toInt(r.compliant);
    const breached = toInt(r.breached);

    return {
      sla_threshold_seconds: SLA_ARRIVAL_THRESHOLD_SECONDS,
      total_evaluated: total,
      compliant,
      breached,
      compliance_percent: total > 0 ? Math.round((compliant / total) * 1000) / 10 : null,
      average_breach_excess_seconds: toNum(r.avg_breach_excess),
    };
  }

  // ----------------------------------------------------------
  // 5. Ambulance Utilization
  // ----------------------------------------------------------

  /**
   * Current fleet utilization snapshot broken down by status.
   */
  async getAmbulanceUtilization(): Promise<AmbulanceUtilization> {
    const res = await query(
      `SELECT
         COUNT(*)::INT                                                                      AS total,
         COUNT(*) FILTER (WHERE status = 'available')::INT                                 AS available,
         COUNT(*) FILTER (WHERE status IN ('dispatched','reserved'))::INT                  AS dispatched,
         COUNT(*) FILTER (WHERE status = 'on_scene')::INT                                  AS on_scene,
         COUNT(*) FILTER (WHERE status IN ('transporting','at_hospital'))::INT             AS transporting,
         COUNT(*) FILTER (WHERE status = 'returning')::INT                                 AS returning,
         COUNT(*) FILTER (WHERE status = 'offline')::INT                                   AS offline,
         COUNT(*) FILTER (WHERE status = 'maintenance')::INT                               AS maintenance
       FROM ambulances`
    );

    const r = res.rows[0];
    const total = toInt(r.total);
    const active =
      toInt(r.dispatched) +
      toInt(r.on_scene) +
      toInt(r.transporting) +
      toInt(r.returning);

    return {
      total,
      available: toInt(r.available),
      dispatched: toInt(r.dispatched),
      on_scene: toInt(r.on_scene),
      transporting: toInt(r.transporting),
      returning: toInt(r.returning),
      offline: toInt(r.offline),
      maintenance: toInt(r.maintenance),
      utilization_percent: total > 0 ? Math.round((active / total) * 1000) / 10 : null,
    };
  }

  // ----------------------------------------------------------
  // 6. Audit Logs
  // ----------------------------------------------------------

  /**
   * Retrieve paginated audit log entries.
   * Supports optional filters by entity type and actor user ID.
   *
   * @param limit    Max rows to return (1–200). Default 50.
   * @param offset   Row offset for pagination. Default 0.
   * @param entityType  Filter by entity_type (e.g. 'incident', 'ambulance').
   * @param actorUserId Filter by the UUID of the user who performed the action.
   */
  async getAuditLogs(
    limit = 50,
    offset = 0,
    entityType?: string,
    actorUserId?: string
  ): Promise<AuditLogPage> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (entityType) {
      conditions.push(`entity_type = $${idx++}`);
      params.push(entityType);
    }
    if (actorUserId) {
      conditions.push(`actor_user_id = $${idx++}`);
      params.push(actorUserId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [dataRes, countRes] = await Promise.all([
      query(
        `SELECT * FROM audit_logs
         ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*)::INT AS total FROM audit_logs ${where}`, params),
    ]);

    return {
      entries: dataRes.rows as AuditLogEntry[],
      total: toInt(countRes.rows[0]?.total),
      limit,
      offset,
    };
  }
}

export const analyticsService = new AnalyticsService();
