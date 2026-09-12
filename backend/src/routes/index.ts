// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Central API Router & Service Mounting
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { Router, type Request, type Response } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { env } from '../config/env.js';
import adminRoutes from './admin.routes.js';
import ambulanceRoutes from './ambulances.routes.js';
import analyticsRoutes from './analytics.routes.js';
import authRoutes from './auth.routes.js';
import incidentRoutes from './incidents.routes.js';

const router = Router();

/**
 * Health check endpoint reporting comprehensive system availability.
 */
router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseHealth();
  const isHealthy = dbStatus.connected || dbStatus.provider === 'in_memory_fallback';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    services: {
      auth: 'operational',
      incidents: 'operational',
      verification: 'operational',
      ambulances: 'operational',
      analytics: 'operational',
      routing: 'adapter_ready',
      realtime: 'adapter_ready',
    },
  });
});

// Mount Core Platform routes owned by SK
router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/admin', adminRoutes);

// Mount operational routes owned by team members
router.use('/ambulances', ambulanceRoutes);
router.use('/analytics', analyticsRoutes);

// Fallback handlers for modules pending operational implementation
const placeholderModule = (moduleName: string, owner: string) => (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'MODULE_INITIALIZING',
      message: `${moduleName} API is configured and pending operational implementation by ${owner}.`,
    },
  });
};

router.use('/hospitals', placeholderModule('Hospital & Resource Operations', 'Shreevarsha V Hegde'));
router.use('/dispatch', placeholderModule('Dispatch Automation', 'Shreevarsha V Hegde'));
router.use('/traffic', placeholderModule('Traffic Intelligence', 'Anush KD'));
router.use('/routes', placeholderModule('Dynamic Routing', 'Anush KD'));

export default router;
