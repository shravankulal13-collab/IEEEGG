// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance REST API Routes
// ============================================================

import { Router } from 'express';
import { ambulanceController } from '../modules/ambulances/ambulance.controller';
import { trackingService } from '../modules/tracking/tracking.service';

const router = Router();

router.get('/', ambulanceController.getAllAmbulances.bind(ambulanceController));
router.post('/', ambulanceController.create.bind(ambulanceController));
router.get('/driver/:driverId', ambulanceController.getDriverAmbulance.bind(ambulanceController));
router.get('/incident/:incidentId', ambulanceController.getIncidentAmbulance.bind(ambulanceController));
router.get('/:id', ambulanceController.getAmbulanceById.bind(ambulanceController));
router.patch('/:id/status', ambulanceController.updateStatus.bind(ambulanceController));
router.post('/:id/location', ambulanceController.updateLocation.bind(ambulanceController));

router.get('/:id/tracking', async (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
