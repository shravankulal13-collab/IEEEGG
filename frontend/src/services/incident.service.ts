// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident API Client Service
// ============================================================

import { apiRequest } from './api';

export type EmergencyType =
  | 'medical'
  | 'accident'
  | 'fire'
  | 'police'
  | 'natural_disaster'
  | 'industrial'
  | 'other';

export type IncidentStatus =
  | 'reported'
  | 'verifying'
  | 'verified'
  | 'dispatching'
  | 'dispatched'
  | 'en_route'
  | 'arrived'
  | 'transporting'
  | 'resolved'
  | 'cancelled'
  | 'false_report'
  | 'expired';

export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'suspicious'
  | 'rejected'
  | 'manual_review';

/** Incident record as returned by the backend (snake_case). */
export interface IncidentRecord {
  id: string;
  incident_number: number;
  reported_by: string | null;
  emergency_type: EmergencyType | string;
  title: string | null;
  description: string | null;
  status: IncidentStatus | string;
  verification_status: VerificationStatus | string;
  verification_score: number | null;
  severity: number | null;
  people_affected: number | null;
  latitude: number;
  longitude: number;
  address: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  reported_at: string;
  verified_at: string | null;
  resolved_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  source: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IncidentListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface IncidentListParams {
  status?: string;
  emergencyType?: string;
  verificationStatus?: string;
  city?: string;
  severity?: number;
  page?: number;
  limit?: number;
}

interface IncidentEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: IncidentListMeta;
}

function buildQuery(params: IncidentListParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.emergencyType) search.set('emergencyType', params.emergencyType);
  if (params.verificationStatus) search.set('verificationStatus', params.verificationStatus);
  if (params.city) search.set('city', params.city);
  if (params.severity != null) search.set('severity', String(params.severity));
  if (params.page != null) search.set('page', String(params.page));
  if (params.limit != null) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export class IncidentService {
  async list(params: IncidentListParams = {}): Promise<{ items: IncidentRecord[]; meta: IncidentListMeta }> {
    const res = await apiRequest<IncidentEnvelope<IncidentRecord[]>>(`/incidents${buildQuery(params)}`);
    return {
      items: res.data ?? [],
      meta: res.meta ?? { page: params.page ?? 1, limit: params.limit ?? 20, total: res.data?.length ?? 0 },
    };
  }

  async getById(id: string): Promise<IncidentRecord> {
    const res = await apiRequest<IncidentEnvelope<IncidentRecord>>(`/incidents/${id}`);
    return res.data;
  }

  async listActive(limit = 100): Promise<IncidentRecord[]> {
    const { items } = await this.list({ page: 1, limit });
    return items;
  }
}

export const incidentService = new IncidentService();
