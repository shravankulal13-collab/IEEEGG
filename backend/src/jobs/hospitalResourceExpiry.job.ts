// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Resource Stale State Expiry Job
// ============================================================

import { query, pool, isPostgresConnected } from '../config/database.js';
import { logger } from '../config/logger.js';

export class HospitalResourceExpiryJob {
  async runExpiryCheck(): Promise<void> {
    if (!pool || !isPostgresConnected) return;

    try {
      await query(`
        UPDATE hospitals h
        SET "availableEmergencyBeds" = h."availableEmergencyBeds" + 1
        FROM dispatch_logs d 
        WHERE h.id = d."targetHospitalId"
        AND d.status = 'CANCELLED' 
        AND d.bed_held = true 
        AND d.updated_at < NOW() - INTERVAL '2 hours'
      `);
    } catch (error: any) {
      logger.error({ err: error.message }, 'Error in Resource Expiry Job');
    }
  }

  startPeriodicCheck(intervalMs = 900000): NodeJS.Timeout {
    return setInterval(async () => {
      await this.runExpiryCheck();
    }, intervalMs);
  }
}

export const hospitalResourceExpiryJob = new HospitalResourceExpiryJob();