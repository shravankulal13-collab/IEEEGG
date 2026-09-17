// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Ambulance Acceptance Timeout & Reassignment Job
// ============================================================

import { DispatchRepository } from '../modules/dispatch/dispatch.repository.js';
import { logger } from '../config/logger.js';

export class DispatchTimeoutJob {
  private repo = new DispatchRepository();

  async runTimeoutCheck(): Promise<void> {
    try {
      const timedOutDispatches = await this.repo.getTimedOutDispatches();
      
      for (const dispatch of timedOutDispatches) {
        await this.repo.updateDispatchStatus(dispatch.id, 'REASSIGNMENT_REQUIRED');
      }
    } catch (error: any) {
      logger.error({ err: error.message }, 'Error in Dispatch Timeout Job');
    }
  }

  startPeriodicCheck(intervalMs = 60000): NodeJS.Timeout {
    return setInterval(async () => {
      await this.runTimeoutCheck();
    }, intervalMs);
  }
}

export const dispatchTimeoutJob = new DispatchTimeoutJob();