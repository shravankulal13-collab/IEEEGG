// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Analytics & Operational Intelligence API Routes
// ============================================================

import { Router, Request, Response } from 'express';
import { analyticsService } from '../modules/analytics/analytics.service';

const router = Router();

// ============================================================
// Input helpers
// ============================================================

/**
 * Parse and validate the `window` query parameter (hours).
 * Returns null if the value is invalid.
 */
function parseWindowHours(raw: unknown): number | null {
  const n = parseInt(String(raw ?? '24'), 10);
  if (isNaN(n) || n < 1 || n > 720) return null;
  return n;
}

// ============================================================
// Routes
// ============================================================

/**
 * GET /api/analytics/overview
 *
 * High-level operational snapshot for the Command Center dashboard.
 *
 * Response: OperationalOverview
 */
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getOperationalOverview();
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * GET /api/analytics/incidents?window=24
 *
 * Incident breakdown by status, emergency type, and severity
 * over the last N hours (1–720). Default window = 24 h.
 *
 * Response: IncidentBreakdown
 */
router.get('/incidents', async (req: Request, res: Response) => {
  try {
    const windowHours = parseWindowHours(req.query.window);
    if (windowHours === null) {
      res.status(400).json({
        success: false,
        error: 'Query param "window" must be an integer between 1 and 720 (hours)',
      });
      return;
    }
    const data = await analyticsService.getIncidentBreakdown(windowHours);
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * GET /api/analytics/response-times?window=24
 *
 * Response-time metrics with P50/P90 percentiles over the last N hours.
 *
 * Response: ResponseTimeMetrics
 */
router.get('/response-times', async (req: Request, res: Response) => {
  try {
    const windowHours = parseWindowHours(req.query.window);
    if (windowHours === null) {
      res.status(400).json({
        success: false,
        error: 'Query param "window" must be an integer between 1 and 720 (hours)',
      });
      return;
    }
    const data = await analyticsService.getResponseTimeMetrics(windowHours);
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * GET /api/analytics/sla?window=24
 *
 * SLA compliance metrics over the last N hours.
 * SLA threshold = 900 seconds (15 min) from reported_at to arrived_at.
 *
 * Response: SLAMetrics
 */
router.get('/sla', async (req: Request, res: Response) => {
  try {
    const windowHours = parseWindowHours(req.query.window);
    if (windowHours === null) {
      res.status(400).json({
        success: false,
        error: 'Query param "window" must be an integer between 1 and 720 (hours)',
      });
      return;
    }
    const data = await analyticsService.getSLAMetrics(windowHours);
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * GET /api/analytics/ambulances
 *
 * Current ambulance fleet utilization snapshot.
 *
 * Response: AmbulanceUtilization
 */
router.get('/ambulances', async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getAmbulanceUtilization();
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * GET /api/analytics/audit
 *
 * Paginated audit log entries.
 *
 * Query params:
 *   limit       — rows per page (1–200, default 50)
 *   offset      — row offset (default 0)
 *   entityType  — filter by entity_type string (e.g. "incident")
 *   actorUserId — filter by actor UUID
 *
 * Response: AuditLogPage
 */
router.get('/audit', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const offset = parseInt(String(req.query.offset ?? '0'), 10);
    const entityType = req.query.entityType ? String(req.query.entityType) : undefined;
    const actorUserId = req.query.actorUserId ? String(req.query.actorUserId) : undefined;

    if (isNaN(limit) || limit < 1 || limit > 200) {
      res.status(400).json({
        success: false,
        error: 'Query param "limit" must be an integer between 1 and 200',
      });
      return;
    }
    if (isNaN(offset) || offset < 0) {
      res.status(400).json({ success: false, error: 'Query param "offset" must be >= 0' });
      return;
    }

    const data = await analyticsService.getAuditLogs(limit, offset, entityType, actorUserId);
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
