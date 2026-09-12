// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Database Repository
// ============================================================

import { query } from '../../config/database';
import { EmergencyRequest, Ambulance, Hospital } from './dispatch.validator';

export class DispatchRepository {
  public async createDispatchRecord(data: Partial<EmergencyRequest>) {
    // Dynamically build the Postgres INSERT query
    const columns = Object.keys(data).map(key => `"${key}"`).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const sql = `INSERT INTO dispatch_logs (${columns}) VALUES (${placeholders}) RETURNING id`;
    const result = await query<{ id: string }>(sql, values);
    
    return { insertId: result.rows[0].id };
  }

  public async getAvailableAmbulances(location: any): Promise<Ambulance[]> {
    const result = await query<Ambulance>('SELECT * FROM ambulances WHERE status = $1', ['AVAILABLE']);
    return result.rows;
  }

  public async getHospitalsWithinRadius(location: any, radiusKm: number): Promise<Hospital[]> {
    const result = await query<Hospital>('SELECT * FROM hospitals WHERE active = $1', [true]);
    return result.rows;
  }

  public async updateDispatchStatus(dispatchId: string, status: string) {
    const result = await query('UPDATE dispatch_logs SET status = $1 WHERE id = $2', [status, dispatchId]);
    return result.rowCount; 
  }

  public async getTimedOutDispatches() {
    const result = await query<{ id: string }>(`
      SELECT id FROM dispatch_logs 
      WHERE status = 'PENDING_ACCEPTANCE' 
      AND created_at < NOW() - INTERVAL '2 minutes'
    `);
    return result.rows;
  }
}