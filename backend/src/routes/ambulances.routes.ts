// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance REST API Routes
// ============================================================

import { Router } from 'express';
import { ambulanceController } from '../modules/ambulances/ambulance.controller';
import { trackingService } from '../modules/tracking/tracking.service';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, (req, res, next) => ambulanceController.getAllAmbulances(req, res, next));
router.post(
  '/',
  authenticate,
  requireRole('dispatcher', 'system_admin'),
  (req, res, next) => ambulanceController.create(req, res, next)
);
router.get('/driver/:driverId', optionalAuthenticate, (req, res, next) => ambulanceController.getDriverAmbulance(req, res, next));
router.get('/incident/:incidentId', optionalAuthenticate, (req, res, next) => ambulanceController.getIncidentAmbulance(req, res, next));
router.get('/:id', optionalAuthenticate, (req, res, next) => ambulanceController.getAmbulanceById(req, res, next));
router.patch(
  '/:id/status',
  authenticate,
  requireRole('ambulance_driver', 'dispatcher', 'system_admin'),
  (req, res, next) => ambulanceController.updateStatus(req, res, next)
);
router.post(
  '/:id/location',
  authenticate,
  requireRole('ambulance_driver', 'system_admin'),
  (req, res, next) => ambulanceController.updateLocation(req, res, next)
);

router.get('/:id/tracking', async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetLat = req.query.targetLat ? Number(req.query.targetLat) : undefined;
    const targetLng = req.query.targetLng ? Number(req.query.targetLng) : undefined;

    const tracking = await trackingService.getLatestTracking(id, targetLat, targetLng);
    if (!tracking) {
      res.status(404).json({ success: false, error: 'Tracking data unavailable for this ambulance' });
      return;
    }
    res.json({ success: true, data: tracking });
  } catch (error: any) {
    next(error);
  }
});

export default router;
