// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde / SK
// ROLE: Decision Intelligence & Audit Trail Routes
// MODULE: Decision Trace & Audit API Endpoints
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import { decisionService } from '../modules/dispatch/decision.service.js';
import { auditService } from '../modules/audit/audit.service.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

/**
 * GET /api/decisions/:incidentId
 * Returns explainable decision trace for an incident
 */
router.get(
  '/:incidentId',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.incidentId;
    const incidentId = Array.isArray(rawId) ? rawId[0] : rawId;
    const trace = await decisionService.getDecisionTrace(incidentId);
    res.json({ success: true, data: trace });
  })
);

/**
 * GET /api/decisions
 * Default evaluation trace
 */
router.get(
  '/',
  optionalAuthenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const trace = await decisionService.getDecisionTrace('ER-77');
    res.json({ success: true, data: trace });
  })
);

export default router;
