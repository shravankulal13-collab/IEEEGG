// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital & Resource API Routes
// ============================================================
import { Router } from 'express';
import { HospitalController } from '../modules/hospitals/hospital.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Hospital directory & details (Read access)
router.get('/', optionalAuthenticate, HospitalController.getAll);
router.get('/doctors', optionalAuthenticate, HospitalController.getAllDoctors);
router.get('/:id', optionalAuthenticate, HospitalController.getById);
router.get('/:id/dashboard', optionalAuthenticate, HospitalController.getDashboard);

// Doctors management
router.get('/:id/doctors', optionalAuthenticate, HospitalController.getDoctors);
router.post(
  '/:id/doctors',
  authenticate,
  requireRole('hospital_admin', 'system_admin'),
  HospitalController.createDoctor
);
router.patch(
  '/:id/doctors/:doctorId',
  authenticate,
  requireRole('hospital_admin', 'system_admin'),
  HospitalController.updateDoctor
);
router.delete(
  '/:id/doctors/:doctorId',
  authenticate,
  requireRole('hospital_admin', 'system_admin'),
  HospitalController.deleteDoctor
);

// Resources & capacity management (Hospital Admin / Hospital Staff only - strictly prohibits drivers/citizens)
router.get('/:id/resources', optionalAuthenticate, HospitalController.getResources);
router.patch(
  '/:id/resources/:resourceId',
  authenticate,
  requireRole('hospital_admin', 'hospital_staff', 'system_admin'),
  HospitalController.updateResource
);
router.put(
  '/:id/capacity',
  authenticate,
  requireRole('hospital_admin', 'hospital_staff', 'system_admin'),
  HospitalController.updateCapacity
);
router.patch(
  '/:id/capacity',
  authenticate,
  requireRole('hospital_admin', 'hospital_staff', 'system_admin'),
  HospitalController.updateCapacity
);
router.post(
  '/:id/roster',
  authenticate,
  requireRole('hospital_admin', 'system_admin'),
  HospitalController.updateRoster
);

export default router;