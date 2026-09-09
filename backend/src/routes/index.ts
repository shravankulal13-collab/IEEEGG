// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Central API Router
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { Router } from 'express';
import ambulanceRoutes from './ambulances.routes';

const router = Router();

router.use('/ambulances', ambulanceRoutes);

export default router;
