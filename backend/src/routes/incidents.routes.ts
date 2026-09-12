// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident Management API Routes
// ============================================================

import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { incidentController } from '../modules/incidents/incident.controller.js';

const router = Router();

// 1. Report emergency incident (accessible anonymously or by authenticated citizen)
router.post('/', optionalAuthenticate, incidentController.create);

// 2. Query incidents with filtering/pagination
router.get('/', optionalAuthenticate, incidentController.list);

// 3. Query single incident detail
router.get('/:id', optionalAuthenticate, incidentController.getById);

// 4. Update incident status (dispatcher, ambulance, admin)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('dispatcher', 'ambulance_driver', 'hospital_admin', 'system_admin'),
  incidentController.updateStatus
);

// 5. Submit verification evaluation (dispatcher, admin)
router.post(
  '/:id/verify',
  authenticate,
  requireRole('dispatcher', 'system_admin'),
  incidentController.verify
);

// 6. Cancel incident
router.post('/:id/cancel', optionalAuthenticate, incidentController.cancel);

// 7. Record reporter GPS location updates
router.post('/:id/location', optionalAuthenticate, incidentController.recordLocation);

export default router;
