// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital & Resource API Routes
// ============================================================
import { Router } from 'express';
import { HospitalController } from '../modules/hospitals/hospital.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Hospital directory & details
router.get('/', optionalAuthenticate, HospitalController.getAll);
router.get('/doctors', optionalAuthenticate, HospitalController.getAllDoctors);
router.get('/:id', optionalAuthenticate, HospitalController.getById);
router.get('/:id/dashboard', optionalAuthenticate, HospitalController.getDashboard);

// Doctors management
router.get('/:id/doctors', optionalAuthenticate, HospitalController.getDoctors);
router.post('/:id/doctors', optionalAuthenticate, HospitalController.createDoctor);
router.patch('/:id/doctors/:doctorId', optionalAuthenticate, HospitalController.updateDoctor);
router.delete('/:id/doctors/:doctorId', optionalAuthenticate, HospitalController.deleteDoctor);

// Resources & capacity management
router.get('/:id/resources', optionalAuthenticate, HospitalController.getResources);
router.patch('/:id/resources/:resourceId', optionalAuthenticate, HospitalController.updateResource);
router.put('/:id/capacity', optionalAuthenticate, HospitalController.updateCapacity);
router.patch('/:id/capacity', optionalAuthenticate, HospitalController.updateCapacity);
router.post('/:id/roster', optionalAuthenticate, HospitalController.updateRoster);

export default router;