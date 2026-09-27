// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Traffic Conditions API Endpoints
// ============================================================
/**
 * traffic.routes.ts
 * Owner: Anush KD
 *
 * Exposes: GET /api/traffic/flow?swLat=&swLng=&neLat=&neLng=
 *          GET /api/traffic/incidents?swLat=&swLng=&neLat=&neLng=
 *
 * Both are thin wrappers over traffic.fusion.ts so the frontend's
 * TrafficLayer.tsx / RouteIntelligence page always gets one blended view
 * regardless of which upstream sources are currently healthy.
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getFusedTraffic } from '../providers/traffic/traffic.fusion.js';
import { authenticate } from '../middleware/auth.middleware.js'; // SK-owned, shared

const router = Router();

const bboxQuerySchema = z.object({
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
});

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

const DEFAULT_METRO_BBOX: [number, number, number, number] = [12.8, 77.4, 13.2, 77.8];

function parseBbox(req: Request): [number, number, number, number] {
  const parsed = bboxQuerySchema.safeParse(req.query);
  if (!parsed.success) return DEFAULT_METRO_BBOX;
  const { swLat, swLng, neLat, neLng } = parsed.data;
  return [swLat, swLng, neLat, neLng];
}

/**
 * GET /api/traffic/flow
 * Returns fused congestion segments for a bounding box — used to paint the
 * live traffic heatmap layer.
 */
router.get(
  '/flow',
  asyncHandler(async (req, res) => {
    const bbox = parseBbox(req);
    const view = await getFusedTraffic({ bbox });
    res.status(200).json({
      data: {
        segments: view.segments,
        sourcesUsed: view.sourcesUsed,
        sourcesFailed: view.sourcesFailed,
        fusedAt: view.fusedAt,
      },
    });
  }),
);

/**
 * GET /api/traffic/incidents and GET /api/traffic/events
 * Returns deduplicated incidents (accidents, closures, hazards) for a
 * bounding box — feeds the TrafficAlert component and dispatcher's
 * RouteIntelligence page.
 */
const handleIncidentsOrEvents = asyncHandler(async (req: Request, res: Response) => {
  const bbox = parseBbox(req);
  const view = await getFusedTraffic({ bbox });
  res.status(200).json({
    data: {
      incidents: view.incidents,
      sourcesUsed: view.sourcesUsed,
      sourcesFailed: view.sourcesFailed,
      fusedAt: view.fusedAt,
    },
  });
});

router.get('/incidents', handleIncidentsOrEvents);
router.get('/events', handleIncidentsOrEvents);
router.get('/', handleIncidentsOrEvents);

export default router;