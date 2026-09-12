// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Data Repository Access
// ============================================================

import { query } from '../../config/database';
import { AmbulanceBackendStatus } from './ambulance.state-machine';

export interface AmbulanceRecord {
  id: string;
  ambulance_number: string;
  registration_number?: string;
  organization_name?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  status: AmbulanceBackendStatus;
  emergency_capable: boolean;
  ambulance_type?: string;
  equipment?: Record<string, any>;
  current_latitude?: number;
  current_longitude?: number;
  current_speed_kmh?: number;
  current_heading?: number;
  gps_accuracy_meters?: number;
  last_gps_update?: string;
  current_incident_id?: string;
  current_hospital_id?: string;
  created_at: string;
  updated_at: string;
}

export class AmbulanceRepository {
  async findAll(): Promise<AmbulanceRecord[]> {
    const res = await query<AmbulanceRecord>(
      `SELECT a.*, p.full_name as driver_name, p.phone as driver_phone
       FROM ambulances a
       LEFT JOIN profiles p ON a.driver_id = p.id
       ORDER BY a.created_at DESC`
    );
    return res.rows;
  }

  async findById(id: string): Promise<AmbulanceRecord | null> {
    const res = await query<AmbulanceRecord>(
      `SELECT a.*, p.full_name as driver_name, p.phone as driver_phone
       FROM ambulances a
       LEFT JOIN profiles p ON a.driver_id = p.id
       WHERE a.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByDriverId(driverId: string): Promise<AmbulanceRecord | null> {
    const res = await query<AmbulanceRecord>(
      `SELECT a.*, p.full_name as driver_name, p.phone as driver_phone
       FROM ambulances a
       LEFT JOIN profiles p ON a.driver_id = p.id
       WHERE a.driver_id = $1`,
      [driverId]
    );
    return res.rows[0] || null;
  }

  async findByIncidentId(incidentId: string): Promise<AmbulanceRecord | null> {
    const res = await query<AmbulanceRecord>(
      `SELECT a.*, p.full_name as driver_name, p.phone as driver_phone
       FROM ambulances a
       LEFT JOIN profiles p ON a.driver_id = p.id
       WHERE a.current_incident_id = $1`,
      [incidentId]
    );
    return res.rows[0] || null;
  }

  async updateStatus(
    id: string,
    status: AmbulanceBackendStatus,
    incidentId?: string | null,
    hospitalId?: string | null
  ): Promise<AmbulanceRecord | null> {
    const res = await query<AmbulanceRecord>(
      `UPDATE ambulances
       SET status = $2,
           current_incident_id = COALESCE($3, current_incident_id),
           current_hospital_id = COALESCE($4, current_hospital_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, status, incidentId, hospitalId]
    );
    return res.rows[0] || null;
  }

  async updateLocation(
    id: string,
    lat: number,
    lng: number,
    speed?: number,
    heading?: number,
    accuracy?: number
  ): Promise<AmbulanceRecord | null> {
    const res = await query<AmbulanceRecord>(
      `UPDATE ambulances
       SET current_latitude = $2,
           current_longitude = $3,
           current_speed_kmh = COALESCE($4, current_speed_kmh),
           current_heading = COALESCE($5, current_heading),
           gps_accuracy_meters = COALESCE($6, gps_accuracy_meters),
           last_gps_update = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, lat, lng, speed, heading, accuracy]
    );
    return res.rows[0] || null;
  }

  async create(data: Partial<AmbulanceRecord>): Promise<AmbulanceRecord> {
    const res = await query<AmbulanceRecord>(
      `INSERT INTO ambulances (
        ambulance_number, registration_number, organization_name, driver_id, status, emergency_capable, ambulance_type, equipment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.ambulance_number,
        data.registration_number || null,
        data.organization_name || null,
        data.driver_id || null,
        data.status || 'available',
        data.emergency_capable ?? true,
        data.ambulance_type || 'ALS',
        JSON.stringify(data.equipment || {})
      ]
    );
    return res.rows[0];
  }
}

export const ambulanceRepository = new AmbulanceRepository();
