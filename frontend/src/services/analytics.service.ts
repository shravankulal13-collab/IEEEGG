// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Operational Analytics Client Service
// ============================================================

import { apiRequest } from './api';

export interface SystemKPIs {
  active_incidents?: number;
  critical_incidents?: number;
  available_ambulances?: number;
  dispatched_ambulances?: number;
  total_ambulances?: number;
  avg_response_time_seconds?: number;
  sla_compliance_percent?: number;
  active_alarms?: number;
  active_emergencies_count?: number;
  ambulances_en_route_count?: number;
  available_ambulances_count?: number;
  hospital_bed_occupancy_pct?: number;
  average_dispatch_latency_seconds?: number;
  average_response_time_minutes?: number;
  sla_compliance_pct?: number;
  resolved_today_count?: number;
}

export interface IncidentBreakdownData {
  window_hours: number;
  total_incidents: number;
  by_status: Record<string, number>;
  by_emergency_type: Record<string, number>;
  by_severity: Record<string, number>;
  hourly_trend: { hour: string; count: number }[];
}

export interface ResponseTimeMetrics {
  window_hours: number;
  avg_dispatch_seconds: number;
  p50_dispatch_seconds: number;
  p90_dispatch_seconds: number;
  avg_on_scene_minutes: number;
  p50_on_scene_minutes: number;
  p90_on_scene_minutes: number;
  avg_hospital_arrival_minutes: number;
}

export interface SLAMetrics {
  window_hours: number;
  total_dispatches: number;
  met_sla_count: number;
  breached_sla_count: number;
  compliance_percentage: number;
  target_response_minutes: number;
}

export interface AmbulanceUtilization {
  total_ambulances: number;
  dispatched: number;
  available: number;
  maintenance: number;
  offline: number;
  utilization_pct: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_user_id?: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  ip_address?: string;
}

export interface PaginatedAuditLogs {
  total: number;
  limit: number;
  offset: number;
  logs: AuditLogEntry[];
}

export class AnalyticsService {
  async getKPIs(): Promise<SystemKPIs> {
    const res = await apiRequest<{ success: boolean; data: SystemKPIs }>('/analytics/kpis');
    return res.data;
  }

  async getIncidentBreakdown(windowHours: number = 24): Promise<IncidentBreakdownData> {
    const res = await apiRequest<{ success: boolean; data: IncidentBreakdownData }>(`/analytics/incidents?window=${windowHours}`);
    return res.data;
  }

  async getResponseTimes(windowHours: number = 24): Promise<ResponseTimeMetrics> {
    const res = await apiRequest<{ success: boolean; data: ResponseTimeMetrics }>(`/analytics/response-times?window=${windowHours}`);
    return res.data;
  }

  async getSLAMetrics(windowHours: number = 24): Promise<SLAMetrics> {
    const res = await apiRequest<{ success: boolean; data: SLAMetrics }>(`/analytics/sla?window=${windowHours}`);
    return res.data;
  }

  async getAmbulanceUtilization(): Promise<AmbulanceUtilization> {
    const res = await apiRequest<{ success: boolean; data: AmbulanceUtilization }>('/analytics/ambulances');
    return res.data;
  }

  async getAuditLogs(limit: number = 50, offset: number = 0, entityType?: string, actorUserId?: string): Promise<PaginatedAuditLogs> {
    let query = `/analytics/audit?limit=${limit}&offset=${offset}`;
    if (entityType) query += `&entityType=${encodeURIComponent(entityType)}`;
    if (actorUserId) query += `&actorUserId=${encodeURIComponent(actorUserId)}`;

    const res = await apiRequest<{ success: boolean; data: PaginatedAuditLogs }>(query);
    return res.data || { total: 0, limit, offset, logs: [] };
  }
}

export const analyticsService = new AnalyticsService();
