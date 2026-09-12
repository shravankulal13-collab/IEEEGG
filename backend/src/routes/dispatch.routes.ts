// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch API Routes
// ============================================================
import { Router } from 'express';
import { DispatchController } from '../modules/dispatch/dispatch.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/request', authenticate, DispatchController.requestDispatch);

export default router;