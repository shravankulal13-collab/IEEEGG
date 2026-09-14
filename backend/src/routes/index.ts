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

router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseHealth();
  const isHealthy = dbStatus.connected === true;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'down',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    services: {
      auth: isHealthy ? 'operational' : 'degraded',
      incidents: isHealthy ? 'operational' : 'degraded',
      verification: isHealthy ? 'operational' : 'degraded',
      ambulances: isHealthy ? 'operational' : 'degraded',
      hospitals: isHealthy ? 'operational' : 'degraded',
      dispatch: isHealthy ? 'operational' : 'degraded',
      routing: isHealthy ? 'operational' : 'degraded',
      traffic: isHealthy ? 'operational' : 'degraded',
      analytics: isHealthy ? 'operational' : 'degraded',
      realtime: isHealthy ? 'operational' : 'degraded',
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
