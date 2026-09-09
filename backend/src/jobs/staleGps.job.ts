// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Stale GPS Detection Background Job
// ============================================================

import { query } from '../config/database';

export class StaleGpsJob {
  private readonly STALE_THRESHOLD_SECONDS = 60;

  async detectAndFlagStaleTelemetry(): Promise<string[]> {
    try {
      const res = await query(
        `SELECT id, ambulance_number, last_gps_update, status
         FROM ambulances
         WHERE status IN ('dispatched', 'en_route_to_incident', 'on_scene', 'transporting')
           AND (last_gps_update IS NULL OR last_gps_update < NOW() - INTERVAL '60 seconds')`
      );

      const staleAmbulances = res.rows.map((row) => row.id);
      return staleAmbulances;
    } catch (error) {
      return [];
    }
  }

  startPeriodicCheck(intervalMs = 30000): NodeJS.Timeout {
    return setInterval(async () => {
      await this.detectAndFlagStaleTelemetry();
    }, intervalMs);
  }
}

export const staleGpsJob = new StaleGpsJob();
