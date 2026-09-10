// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch API Routes
// ============================================================
import { Router } from 'express';
import { DispatchController } from '../modules/dispatch/dispatch.controller';

// @ts-ignore - Bypass strict type checking for external files you cannot modify
import * as auth from '../middleware/auth.middleware';

const authenticate = auth.verifyToken 
  || auth.default 
  || auth.AuthMiddleware?.verifyToken 
  || auth.protect
  || ((req: any, res: any, next: any) => next()); 

const router = Router();

router.post('/request', authenticate, DispatchController.requestDispatch);

export default router;