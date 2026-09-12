// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Telemetry History Repository Access
// ============================================================

import { query } from '../../config/database';

export interface LocationHistoryRecord {
  id: string;
  ambulance_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  speed_kmh?: number;
  heading?: number;
  source: string;
  recorded_at: string;
}

export class TrackingRepository {
  async logLocation(data: {
    ambulance_id: string;
    latitude: number;
    longitude: number;
    accuracy_meters?: number;
    speed_kmh?: number;
    heading?: number;
    source?: string;
  }): Promise<LocationHistoryRecord> {
    const res = await query<LocationHistoryRecord>(
      `INSERT INTO ambulance_location_history (
        ambulance_id, latitude, longitude, accuracy_meters, speed_kmh, heading, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        data.ambulance_id,
        data.latitude,
        data.longitude,
        data.accuracy_meters || null,
        data.speed_kmh || null,
        data.heading || null,
        data.source || 'ambulance_app',
      ]
    );
    return res.rows[0];
  }

  async getLatestLocation(ambulanceId: string): Promise<LocationHistoryRecord | null> {
    const res = await query<LocationHistoryRecord>(
      `SELECT * FROM ambulance_location_history
       WHERE ambulance_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [ambulanceId]
    );
    return res.rows[0] || null;
  }

  async getLocationHistory(
    ambulanceId: string,
    limit = 50
  ): Promise<LocationHistoryRecord[]> {
    const res = await query<LocationHistoryRecord>(
      `SELECT * FROM ambulance_location_history
       WHERE ambulance_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [ambulanceId, limit]
    );
    return res.rows;
  }
}

export const trackingRepository = new TrackingRepository();
