// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Ambulance Acceptance Timeout & Reassignment Job
// ============================================================
// @ts-ignore
// @ts-ignore
import cron from 'node-cron';
import { DispatchRepository } from '../modules/dispatch/dispatch.repository';

cron.schedule('* * * * *', async () => {
  const repo = new DispatchRepository();
  console.log('Running Dispatch Timeout Engine...');
  
  try {
    const timedOutDispatches = await repo.getTimedOutDispatches();
    
    for (const dispatch of timedOutDispatches) {
      await repo.updateDispatchStatus(dispatch.id, 'REASSIGNMENT_REQUIRED');
    }
  } catch (error) {
    console.error('Error in Dispatch Timeout Job:', error);
  }
});