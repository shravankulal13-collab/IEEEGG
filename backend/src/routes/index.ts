// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Central API Router
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { Router } from 'express';
import ambulanceRoutes from './ambulances.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/ambulances', ambulanceRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
