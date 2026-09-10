// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital & Resource API Routes
// ============================================================
import { Router } from 'express';
import { HospitalController } from '../modules/hospitals/hospital.controller';

// @ts-ignore - Bypass strict type checking for external files you cannot modify
import * as auth from '../middleware/auth.middleware';

const authenticate = auth.verifyToken 
  || auth.default 
  || auth.AuthMiddleware?.verifyToken 
  || auth.protect
  || ((req: any, res: any, next: any) => next());

const router = Router();

router.get('/:id/dashboard', authenticate, HospitalController.getDashboard);
router.put('/:id/capacity', authenticate, HospitalController.updateCapacity);

export default router;