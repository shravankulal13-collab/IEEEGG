// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch API Routes
// ============================================================
import { Router } from 'express';
import { DispatchController } from '../modules/dispatch/dispatch.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/request', authenticate, DispatchController.requestDispatch);
router.post('/geoagent/evaluate', optionalAuthenticate, DispatchController.evaluateGeoAgent);
router.post('/geoagent/simulate', optionalAuthenticate, DispatchController.evaluateGeoAgent);

export default router;