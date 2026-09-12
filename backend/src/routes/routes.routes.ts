// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Routing API Endpoints
// ============================================================
/**
 * routes.routes.ts
 * Owner: Anush KD
 *
 * Exposes: POST /api/routes/compute
 *          GET  /api/routes/health
 *
 * Mounted in the shared router index (backend/src/routes/index.ts, SK-owned)
 * as: router.use('/routes', routesRouter)
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { resolveRoute } from '../providers/routing/fallback.provider.js';
import { RoutingProviderError } from '../providers/routing/routing.provider.js';
import type { RouteRequest } from '../providers/routing/routing.provider.js';
import { getAllProviderHealth } from '../providers/traffic/provider-health.service.js';
import { authenticate } from '../middleware/auth.middleware.js'; // SK-owned, shared
import { logger } from '../config/logger.js';

const router = Router();

const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const computeRouteSchema = z.object({
  origin: latLngSchema,
  destination: latLngSchema,
  waypoints: z.array(latLngSchema).optional(),
  avoidTolls: z.boolean().optional(),
  avoidHighways: z.boolean().optional(),
  profile: z.enum(['driving', 'emergency']).optional(),
});

/** Thin async wrapper so route handlers can `throw` and hit SK's error.middleware. */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

/**
 * POST /api/routes/compute
 * Computes a resilient route between two (or more) points. Tries Mappls
 * first, silently falls back to OSRM on failure — callers get a
 * `degraded: true` flag rather than an error when that happens, so the
 * dispatch engine and frontend can show a "using backup routing" badge
 * instead of hard-failing an active emergency.
 */
router.post(
  '/compute',
  authenticate,
  asyncHandler(async (req, res) => {
    const parsed = computeRouteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid request body', details: parsed.error.flatten() });
      return;
    }

    try {
      const routeRequest: RouteRequest = {
        origin: parsed.data.origin,
        destination: parsed.data.destination,
      };
      if (parsed.data.waypoints !== undefined) routeRequest.waypoints = parsed.data.waypoints;
      if (parsed.data.avoidTolls !== undefined) routeRequest.avoidTolls = parsed.data.avoidTolls;
      if (parsed.data.avoidHighways !== undefined) routeRequest.avoidHighways = parsed.data.avoidHighways;
      if (parsed.data.profile !== undefined) routeRequest.profile = parsed.data.profile;

      const result = await resolveRoute(routeRequest);
      res.status(200).json({ data: result });
    } catch (err) {
      if (err instanceof RoutingProviderError) {
        logger.error({ error: err.message }, 'all routing providers exhausted for request');
        res.status(503).json({
          error: 'routing temporarily unavailable',
          detail: err.message,
        });
        return;
      }
      throw err;
    }
  }),
);

/**
 * GET /api/routes/health
 * Ops-facing circuit breaker snapshot for routing + traffic providers.
 * Used by khushi's operational BI dashboard and providerHealth.job.ts logs.
 */
router.get(
  '/health',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(200).json({ data: getAllProviderHealth() });
  }),
);

export default router;