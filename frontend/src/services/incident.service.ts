// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident API Client Service
// ============================================================

import { apiRequest } from './api';

export interface IncidentRecord {
  id: string;
  incident_number?: number | string;
  emergency_type: string;
  incident_type?: string;
  severity: number | 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'verifying' | 'verified' | 'dispatching' | 'dispatched' | 'en_route' | 'on_scene' | 'arrived' | 'transporting' | 'resolved' | 'cancelled';
  description?: string;
  title?: string;
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  reporter_id?: string;
  reporter_name?: string;
  reporter_phone?: string;
  assigned_ambulance_id?: string;
  assigned_ambulance_number?: string;
  assigned_hospital_id?: string;
  assigned_hospital_name?: string;
  metadata?: Record<string, any>;
  reported_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentPayload {
  emergencyType?: 'medical' | 'accident' | 'fire' | 'police' | 'natural_disaster' | 'industrial' | 'other';
  incident_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical' | number;
  title?: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  reporter_name?: string;
  reporter_phone?: string;
  assigned_ambulance_id?: string;
  assigned_ambulance_number?: string;
  assigned_hospital_id?: string;
  assigned_hospital_name?: string;
  metadata?: Record<string, any>;
}

export interface IncidentQueryParams {
  status?: string;
  severity?: string;
  emergencyType?: string;
  page?: number;
  limit?: number;
}

export const incidentService = {
  async create(payload: CreateIncidentPayload): Promise<IncidentRecord> {
    const rawType = (payload.emergencyType || payload.incident_type || 'medical').toLowerCase();
    const typeMap: Record<string, string> = {
      cardiac: 'medical',
      trauma: 'medical',
      respiratory: 'medical',
      accident: 'accident',
      fire: 'fire',
      police: 'police',
      other: 'other',
    };
    const emergencyType = typeMap[rawType] || (['medical', 'accident', 'fire', 'police', 'natural_disaster', 'industrial', 'other'].includes(rawType) ? rawType : 'medical');

    let severityNum = 3;
    if (typeof payload.severity === 'number') {
      severityNum = Math.max(1, Math.min(5, payload.severity));
    } else if (payload.severity === 'critical') {
      severityNum = 5;
    } else if (payload.severity === 'high') {
      severityNum = 4;
    } else if (payload.severity === 'medium') {
      severityNum = 3;
    } else if (payload.severity === 'low') {
      severityNum = 2;
    }

    const body = {
      emergencyType,
      title: payload.title || `Emergency SOS (${emergencyType.toUpperCase()})`,
      description: payload.description || 'Immediate emergency paramedical assistance requested.',
      latitude: payload.latitude,
      longitude: payload.longitude,
      severity: severityNum,
      address: payload.address || 'Bengaluru Metro Area',
      source: 'citizen_app',
      metadata: {
        ...(payload.metadata || {}),
        reporter_name: payload.reporter_name,
        reporter_phone: payload.reporter_phone,
        assigned_ambulance_id: payload.assigned_ambulance_id,
        assigned_ambulance_number: payload.assigned_ambulance_number,
        assigned_hospital_id: payload.assigned_hospital_id,
        assigned_hospital_name: payload.assigned_hospital_name,
      },
    };

    const res = await apiRequest<{ success: boolean; data: any }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const raw = res.data;
    const meta = raw.metadata || {};
    return {
      ...raw,
      incident_type: raw.emergency_type || emergencyType,
      reporter_name: meta.reporter_name || payload.reporter_name || 'Citizen User',
      reporter_phone: meta.reporter_phone || payload.reporter_phone || '+91 98765 43210',
      assigned_ambulance_id: raw.assigned_ambulance_id || meta.assigned_ambulance_id || payload.assigned_ambulance_id,
      assigned_ambulance_number: meta.assigned_ambulance_number || payload.assigned_ambulance_number,
      assigned_hospital_id: raw.assigned_hospital_id || meta.assigned_hospital_id || payload.assigned_hospital_id,
      assigned_hospital_name: meta.assigned_hospital_name || payload.assigned_hospital_name,
    };
  },

  async list(params?: IncidentQueryParams): Promise<{ items: IncidentRecord[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.emergencyType) query.append('emergencyType', params.emergencyType);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: any[]; meta?: { total: number; page: number; limit: number } }>(
      `/incidents${queryString}`,
      { method: 'GET' }
    );

    const items = (res.data || []).map((raw) => {
      const meta = raw.metadata || {};
      return {
        ...raw,
        incident_type: raw.emergency_type || 'medical',
        reporter_name: meta.reporter_name || 'Citizen User',
        reporter_phone: meta.reporter_phone || '+91 98765 43210',
        assigned_ambulance_id: raw.assigned_ambulance_id || meta.assigned_ambulance_id,
        assigned_ambulance_number: meta.assigned_ambulance_number,
        assigned_hospital_id: raw.assigned_hospital_id || meta.assigned_hospital_id,
        assigned_hospital_name: meta.assigned_hospital_name,
      };
    });

    return {
      items,
      total: res.meta?.total || items.length,
      page: res.meta?.page || 1,
      limit: res.meta?.limit || 20,
    };
  },

  async getById(id: string): Promise<IncidentRecord> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/incidents/${id}`, {
      method: 'GET',
    });
    const raw = res.data;
    const meta = raw.metadata || {};
    return {
      ...raw,
      incident_type: raw.emergency_type || 'medical',
      reporter_name: meta.reporter_name || 'Citizen User',
      reporter_phone: meta.reporter_phone || '+91 98765 43210',
      assigned_ambulance_id: raw.assigned_ambulance_id || meta.assigned_ambulance_id,
      assigned_ambulance_number: meta.assigned_ambulance_number,
      assigned_hospital_id: raw.assigned_hospital_id || meta.assigned_hospital_id,
      assigned_hospital_name: meta.assigned_hospital_name,
    };
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<IncidentRecord> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    const raw = res.data;
    const meta = raw.metadata || {};
    return {
      ...raw,
      incident_type: raw.emergency_type || 'medical',
      reporter_name: meta.reporter_name || 'Citizen User',
      reporter_phone: meta.reporter_phone || '+91 98765 43210',
      assigned_ambulance_id: raw.assigned_ambulance_id || meta.assigned_ambulance_id,
      assigned_ambulance_number: meta.assigned_ambulance_number,
      assigned_hospital_id: raw.assigned_hospital_id || meta.assigned_hospital_id,
      assigned_hospital_name: meta.assigned_hospital_name,
    };
  },

  async verify(id: string, verified: boolean, notes?: string): Promise<IncidentRecord> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/incidents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'dispatcher_review',
        result: verified ? 'verified' : 'rejected',
        notes,
      }),
    });
    return res.data;
  },

  async cancel(id: string, reason?: string): Promise<IncidentRecord> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/incidents/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancellationReason: reason || 'Cancelled by user' }),
    });
    return res.data;
  },

  async recordLocation(id: string, latitude: number, longitude: number, accuracy?: number): Promise<void> {
    await apiRequest(`/incidents/${id}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, accuracyMeters: accuracy }),
    });
  },
};
