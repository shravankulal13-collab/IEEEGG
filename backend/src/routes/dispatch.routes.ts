// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch API Routes
// ============================================================
import { Router } from 'express';
import { DispatchController } from '../modules/dispatch/dispatch.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.post('/request', authenticate, requireRole('dispatcher', 'system_admin'), DispatchController.requestDispatch);
router.post('/geoagent/evaluate', authenticate, requireRole('dispatcher', 'system_admin'), DispatchController.evaluateGeoAgent);
router.post('/geoagent/simulate', authenticate, requireRole('dispatcher', 'system_admin'), DispatchController.evaluateGeoAgent);

export default router;