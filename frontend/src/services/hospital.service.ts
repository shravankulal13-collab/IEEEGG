// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital API Client Service
// ============================================================

import { apiRequest } from './api';

export interface HospitalData {
  id: string;
  name: string;
  code?: string;
  address?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  trauma_level?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  total_beds?: number;
  available_beds?: number;
  total_icu_beds?: number;
  available_icu_beds?: number;
  total_ventilators?: number;
  available_ventilators?: number;
  total_oxygen_units?: number;
  available_oxygen_units?: number;
  blood_bank_status?: 'ADEQUATE' | 'CRITICAL' | 'RESTOCKED';
  operational_status?: 'OPEN' | 'DIVERT' | 'FULL';
  active?: boolean;
  availableICUBeds?: number;
  availableEmergencyBeds?: number;
  onCallSpecialists?: string[];
  distance_km?: number;
  eta_minutes?: number;
}

export interface DoctorOnCall {
  id: string;
  name: string;
  specialty: string;
  department: string;
  phone: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'SURGERY' | 'OFF_DUTY';
  shift_end: string;
}

export interface IncomingPatient {
  incident_id: string;
  ambulance_number: string;
  driver_name: string;
  patient_condition: string;
  triage_level: 'RED' | 'YELLOW' | 'GREEN';
  eta_minutes: number;
  vitals: {
    heart_rate?: number;
    bp?: string;
    spo2?: number;
  };
}

export interface HospitalDashboardData {
  hospital: HospitalData;
  doctors: DoctorOnCall[];
  incoming_patients: IncomingPatient[];
  occupancy_rate: number;
  icu_occupancy_rate: number;
  ventilator_occupancy_rate: number;
  recent_admissions_count: number;
}

export interface HospitalCapacityUpdate {
  type: 'ICU' | 'EMERGENCY';
  count: number;
}

export class HospitalService {
  async getAllHospitals(): Promise<HospitalData[]> {
    const res = await apiRequest<{ success: boolean; data: HospitalData[] }>('/hospitals');
    return res.data || [];
  }

  async getHospitalDashboard(hospitalId: string): Promise<HospitalDashboardData> {
    const res = await apiRequest<{ success: boolean; data: HospitalDashboardData }>(`/hospitals/${hospitalId}/dashboard`);
    return res.data;
  }

  async updateCapacity(hospitalId: string, payload: HospitalCapacityUpdate): Promise<HospitalData> {
    const res = await apiRequest<{ success: boolean; data: HospitalData }>(`/hospitals/${hospitalId}/capacity`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  async updateSpecialists(hospitalId: string, specialists: string[]): Promise<void> {
    await apiRequest(`/hospitals/${hospitalId}/roster`, {
      method: 'PUT',
      body: JSON.stringify({ specialists }),
    });
  }

  async updateDoctorStatus(hospitalId: string, doctorId: string, status: DoctorOnCall['status']): Promise<void> {
    await apiRequest(`/hospitals/${hospitalId}/doctors/${doctorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }
}

export const hospitalService = new HospitalService();
