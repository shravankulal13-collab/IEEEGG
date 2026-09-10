// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Resource Stale State Expiry Job
// ============================================================
// @ts-ignore
// @ts-ignore
import cron from 'node-cron';
import { query } from '../config/database';

cron.schedule('*/15 * * * *', async () => {
  console.log('Running Hospital Resource Expiry Job...');
  
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
  } catch (error) {
    console.error('Error in Resource Expiry Job:', error);
  }
});