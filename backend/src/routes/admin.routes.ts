// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Administration & Platform Diagnostic Routes
// ============================================================

import { Router } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { authRepository } from '../modules/auth/auth.repository.js';
import { incidentRepository } from '../modules/incidents/incident.repository.js';

const router = Router();


router.use(authenticate, requireRole('system_admin'));

router.get('/system-status', async (_req, res, next) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const userCount = await authRepository.count();
    const activeIncidents = await incidentRepository.list({
      page: 1,
      limit: 10,
    });

    res.status(200).json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        database: dbHealth,
        system: {
          uptimeSeconds: Math.floor(process.uptime()),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
        },
        counts: {
          users: userCount,
          incidents: activeIncidents.total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
