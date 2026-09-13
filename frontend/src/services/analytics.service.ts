// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Operational Analytics Client Service
// ============================================================

import { apiRequest } from './api';

export interface OperationalOverview {
  total_incidents: number;
  active_incidents: number;
  resolved_today: number;
  cancelled_today: number;
  available_ambulances: number;
  dispatched_ambulances: number;
  total_ambulances: number;
  average_response_time_seconds: number | null;
  sla_compliance_percent: number | null;
}

export interface IncidentBreakdown {
  by_status: Array<{ status: string; count: number }>;
  by_type: Array<{ emergency_type: string; count: number }>;
  by_severity: Array<{ severity: number | null; count: number }>;
}

export interface ResponseTimeMetrics {
  avg_dispatch_time_seconds: number | null;
  avg_arrival_time_seconds: number | null;
  avg_resolution_time_seconds: number | null;
  p50_arrival_seconds: number | null;
  p90_arrival_seconds: number | null;
  fastest_arrival_seconds: number | null;
  slowest_arrival_seconds: number | null;
  sample_count: number;
}

export interface SLAMetrics {
  sla_threshold_seconds: number;
  total_evaluated: number;
  compliant: number;
  breached: number;
  compliance_percent: number | null;
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

interface Envelope<T> {
  success: boolean;
  data: T;
}

export class AnalyticsClient {
  async getOverview(): Promise<OperationalOverview> {
    const res = await apiRequest<Envelope<OperationalOverview>>('/analytics/overview');
    return res.data;
  }

  async getIncidentBreakdown(windowHours = 24): Promise<IncidentBreakdown> {
    const res = await apiRequest<Envelope<IncidentBreakdown>>(`/analytics/incidents?window=${windowHours}`);
    return res.data;
  }

  async getResponseTimes(windowHours = 24): Promise<ResponseTimeMetrics> {
    const res = await apiRequest<Envelope<ResponseTimeMetrics>>(`/analytics/response-times?window=${windowHours}`);
    return res.data;
  }

  async getSla(windowHours = 24): Promise<SLAMetrics> {
    const res = await apiRequest<Envelope<SLAMetrics>>(`/analytics/sla?window=${windowHours}`);
    return res.data;
  }

  async getAmbulanceUtilization(): Promise<AmbulanceUtilization> {
    const res = await apiRequest<Envelope<AmbulanceUtilization>>('/analytics/ambulances');
    return res.data;
  }

  async getAuditLogs(params: {
    limit?: number;
    offset?: number;
    entityType?: string;
    actorUserId?: string;
  } = {}): Promise<AuditLogPage> {
    const search = new URLSearchParams();
    search.set('limit', String(params.limit ?? 50));
    search.set('offset', String(params.offset ?? 0));
    if (params.entityType) search.set('entityType', params.entityType);
    if (params.actorUserId) search.set('actorUserId', params.actorUserId);
    const res = await apiRequest<Envelope<AuditLogPage>>(`/analytics/audit?${search.toString()}`);
    return res.data;
  }
}

export const analyticsService = new AnalyticsClient();
