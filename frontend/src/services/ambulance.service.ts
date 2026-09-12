// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Frontend Ambulance API Client Service
// ============================================================

import { apiRequest } from './api';

export interface AmbulanceData {
  id: string;
  ambulance_number: string;
  driver_name?: string;
  driver_phone?: string;
  status: string;
  ui_state: 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'OFFLINE';
  emergency_capable: boolean;
  ambulance_type?: string;
  current_latitude?: number;
  current_longitude?: number;
  current_speed_kmh?: number;
  current_heading?: number;
  gps_accuracy_meters?: number;
  last_gps_update?: string;
  current_incident_id?: string;
  current_hospital_id?: string;
}

export interface TelemetryData {
  ambulance_id: string;
  latitude: number;
  longitude: number;
  speed_kmh?: number;
  heading?: number;
  accuracy_meters?: number;
  last_updated: string;
  telemetry_status: 'live' | 'stale' | 'invalid';
  eta?: {
    distance_km: number;
    eta_minutes: number;
    formatted_eta: string;
    speed_kmh: number;
  };
}

export class AmbulanceService {
  async getAllAmbulances(): Promise<AmbulanceData[]> {
    const res = await apiRequest('/ambulances');
    return res.data;
  }

  async getAmbulanceById(id: string): Promise<AmbulanceData> {
    const res = await apiRequest(`/ambulances/${id}`);
    return res.data;
  }

  async getDriverAmbulance(driverId: string): Promise<AmbulanceData> {
    const res = await apiRequest(`/ambulances/driver/${driverId}`);
    return res.data;
  }

  async getIncidentAmbulance(incidentId: string): Promise<AmbulanceData> {
    const res = await apiRequest(`/ambulances/incident/${incidentId}`);
    return res.data;
  }

  async updateStatus(
    ambulanceId: string,
    status: string,
    incidentId?: string,
    hospitalId?: string
  ): Promise<AmbulanceData> {
    const res = await apiRequest(`/ambulances/${ambulanceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, incident_id: incidentId, hospital_id: hospitalId }),
    });
    return res.data;
  }

  async updateLocation(
    ambulanceId: string,
    location: {
      latitude: number;
      longitude: number;
      speed_kmh?: number;
      heading?: number;
      accuracy_meters?: number;
    }
  ): Promise<AmbulanceData> {
    const res = await apiRequest(`/ambulances/${ambulanceId}/location`, {
      method: 'POST',
      body: JSON.stringify(location),
    });
    return res.data;
  }

  async getTracking(
    ambulanceId: string,
    targetLat?: number,
    targetLng?: number
  ): Promise<TelemetryData> {
    let url = `/ambulances/${ambulanceId}/tracking`;
    if (targetLat && targetLng) {
      url += `?targetLat=${targetLat}&targetLng=${targetLng}`;
    }
    const res = await apiRequest(url);
    return res.data;
  }
}

export const ambulanceService = new AmbulanceService();
