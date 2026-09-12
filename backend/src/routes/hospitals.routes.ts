// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital & Resource API Routes
// ============================================================
import { Router } from 'express';
import { HospitalController } from '../modules/hospitals/hospital.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id/dashboard', authenticate, HospitalController.getDashboard);
router.put('/:id/capacity', authenticate, HospitalController.updateCapacity);

export default router;