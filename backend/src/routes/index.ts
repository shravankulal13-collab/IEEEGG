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
import dispatchRoutes from './dispatch.routes.js';
import hospitalRoutes from './hospitals.routes.js';
import incidentRoutes from './incidents.routes.js';
import routesRouter from './routes.routes.js';
import trafficRouter from './traffic.routes.js';

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
      hospitals: 'operational',
      dispatch: 'operational',
      routing: 'operational',
      traffic: 'operational',
      analytics: 'operational',
      realtime: 'operational',
    },
  });
});

// Mount all subsystem routes
router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/admin', adminRoutes);
router.use('/ambulances', ambulanceRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/dispatch', dispatchRoutes);
router.use('/routes', routesRouter);
router.use('/traffic', trafficRouter);
router.use('/analytics', analyticsRoutes);

export default router;
