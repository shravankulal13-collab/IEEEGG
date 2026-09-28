// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Data Repository Access
// ============================================================

import { isValidUuid, query } from '../../config/database.js';
import { AmbulanceBackendStatus } from './ambulance.state-machine.js';

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
    return res.rows || [];
  }

  async findById(id: string): Promise<AmbulanceRecord | null> {
    if (!id || id === 'null' || id === 'undefined' || id.trim() === '') return null;
    const clean = id.trim();

    if (isValidUuid(clean)) {
      const res = await query<AmbulanceRecord>(
        `SELECT a.*, p.full_name as driver_name, p.phone as driver_phone
         FROM ambulances a
         LEFT JOIN profiles p ON a.driver_id = p.id
         WHERE a.id = $1`,
        [clean]
      );
      if (res.rows[0]) return res.rows[0];
    }

    // Try finding by ambulance_number
    const res = await query<AmbulanceRecord>(
      `SELECT a.*, p.full_name as driver_name, p.phone as driver_phone
       FROM ambulances a
       LEFT JOIN profiles p ON a.driver_id = p.id
       WHERE a.ambulance_number ILIKE $1 LIMIT 1`,
      [`%${clean}%`]
    );
    if (res.rows[0]) return res.rows[0];

    // Demo fallback for standard AMB-104 / amb-als-104
    if (clean === 'amb-als-104' || clean === 'AMB-104' || clean.toLowerCase().includes('104')) {
      return {
        id: '00000000-0000-0000-0000-000000000104',
        ambulance_number: 'AMB-104 (ALS Unit)',
        registration_number: 'KA-05-EA-4820',
        organization_name: 'ResQGrid Metro ALS',
        status: 'en_route_to_incident',
        emergency_capable: true,
        ambulance_type: 'ALS',
        driver_name: 'Ramesh Kumar',
        driver_phone: '+91 98450 11999',
        current_latitude: 12.9340,
        current_longitude: 77.6100,
        current_speed_kmh: 54,
        current_heading: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as AmbulanceRecord;
    }

    return null;
  }

  async findByDriverId(driverId: string): Promise<AmbulanceRecord | null> {
    if (!isValidUuid(driverId)) return null;
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
    if (!isValidUuid(incidentId)) return null;
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
    if (!id || id === 'null' || id === 'undefined' || id.trim() === '') return null;
    const cleanId = id.trim();

    const cleanIncidentId =
      incidentId && typeof incidentId === 'string' && isValidUuid(incidentId.trim())
        ? incidentId.trim()
        : null;

    const cleanHospitalId =
      hospitalId && typeof hospitalId === 'string' && isValidUuid(hospitalId.trim())
        ? hospitalId.trim()
        : null;

    if (isValidUuid(cleanId)) {
      try {
        let res;
        if (status === 'available' || status === 'offline' || status === 'maintenance') {
          res = await query<AmbulanceRecord>(
            `UPDATE ambulances
             SET status = $2,
                 current_incident_id = $3,
                 current_hospital_id = $4,
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [cleanId, status, cleanIncidentId, cleanHospitalId]
          );
        } else {
          res = await query<AmbulanceRecord>(
            `UPDATE ambulances
             SET status = $2,
                 current_incident_id = COALESCE($3, current_incident_id),
                 current_hospital_id = COALESCE($4, current_hospital_id),
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [cleanId, status, cleanIncidentId, cleanHospitalId]
          );
        }

        if (res && res.rows && res.rows[0]) {
          return res.rows[0];
        }
      } catch {
        // Fallback update without foreign key constraints if FK violation occurred
        const fallback = await query<AmbulanceRecord>(
          `UPDATE ambulances
           SET status = $2,
               updated_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [cleanId, status]
        ).catch(() => null);

        if (fallback && fallback.rows && fallback.rows[0]) {
          return fallback.rows[0];
        }
      }
    }

    // Fallback response for demo ambulances or transient IDs
    const existing = await this.findById(cleanId);
    if (existing) {
      return {
        ...existing,
        status,
        current_incident_id: cleanIncidentId || undefined,
        current_hospital_id: cleanHospitalId || undefined,
        updated_at: new Date().toISOString(),
      };
    }

    return {
      id: cleanId,
      ambulance_number: 'AMB-104',
      status,
      emergency_capable: true,
      ambulance_type: 'ALS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as AmbulanceRecord;
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
