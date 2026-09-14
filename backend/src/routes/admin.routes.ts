// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Administration & Platform Diagnostic Routes
// ============================================================

import { Router } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { env } from '../config/env.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';
import { authRepository } from '../modules/auth/auth.repository.js';
import { incidentRepository } from '../modules/incidents/incident.repository.js';

const router = Router();

router.get('/system-status', optionalAuthenticate, async (_req, res, next) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    let userCount = 0;
    let incidentCount = 0;

    if (dbHealth.connected) {
      userCount = await authRepository.count().catch(() => 0);
      const activeIncidents = await incidentRepository.list({
        page: 1,
        limit: 1,
      }).catch(() => ({ total: 0, items: [] }));
      incidentCount = activeIncidents.total;
    }

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
          incidents: incidentCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
