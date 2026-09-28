// ============================================================
// PRIMARY OWNER: SK / Anush KD / Shreevarsha V Hegde
// ROLE: Core Platform + Simulation & Demo Controls
// MODULE: Demo Scenario & Traffic Event API Endpoints
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import { demoScenarioService } from '../modules/dispatch/demo-scenario.service.js';
import { auditService } from '../modules/audit/audit.service.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

/**
 * POST /api/demo/traffic-events
 * Injects a controlled simulated traffic event into the route monitoring pipeline
 */
router.post(
  '/traffic-events',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const event = await demoScenarioService.injectTrafficEvent(req.body);
    res.status(201).json({ success: true, data: event });
  })
);

/**
 * GET /api/demo/traffic-events
 * Returns active simulated traffic events
 */
router.get(
  '/traffic-events',
  optionalAuthenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const events = demoScenarioService.getActiveTrafficEvents();
    res.json({ success: true, data: events });
  })
);

/**
 * POST /api/demo/reset
 * Resets the master deterministic demo scenario to baseline state
 */
router.post(
  '/reset',
  optionalAuthenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await demoScenarioService.resetDemoScenario();
    res.json(result);
  })
);

/**
 * GET /api/demo/audit/:incidentId
 * Returns audit trail for an incident
 */
router.get(
  '/audit/:incidentId',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.incidentId;
    const incidentId = Array.isArray(rawId) ? rawId[0] : rawId;
    const trail = await auditService.getIncidentAuditTrail(incidentId);
    res.json({ success: true, data: trail });
  })
);

/**
 * POST /api/demo/route-change
 * Persists a driver route change decision and writes audit event
 */
router.post(
  '/route-change',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { incidentId, previousRoute, newRoute, reason, source } = req.body;
    await auditService.logEvent({
      action: 'ROUTE_CHANGED',
      entityType: 'ROUTES',
      incidentId: incidentId || 'ER-77',
      actorName: source || 'AMBULANCE_DRIVER',
      reason: reason || 'Driver selected alternative detour route due to traffic degradation',
      details: {
        previousRoute: previousRoute || 'Primary Green Corridor (7 min)',
        newRoute: newRoute || 'Elevated Flyover Bypass (5 min)',
        timeSavingsMinutes: 2,
        source: source || 'SIMULATION'
      }
    });
    res.json({ success: true, message: 'Route change recorded and audited' });
  })
);

export default router;
