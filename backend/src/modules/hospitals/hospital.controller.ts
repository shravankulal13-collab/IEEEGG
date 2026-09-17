// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Directory & Status Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { HospitalService } from './hospital.service';
import { HospitalValidator } from './hospital.validator';

const hospitalService = new HospitalService();

export class HospitalController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const hospitals = await hospitalService.getAllHospitals();
      res.json({ success: true, data: hospitals });
    } catch (error: any) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const hospitalId = String(req.params.id);
      const hospital = await hospitalService.getHospitalById(hospitalId);
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }
      res.json({ success: true, data: hospital });
    } catch (error: any) {
      next(error);
    }
  }

  public static async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id ? String(req.params.id) : undefined;
      const doctors = id ? await hospitalService.getDoctors(id) : await hospitalService.getAllDoctors();
      res.json({ success: true, data: doctors });
    } catch (error: any) {
      next(error);
    }
  }

  public static async getAllDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const doctors = await hospitalService.getAllDoctors();
      res.json({ success: true, data: doctors });
    } catch (error: any) {
      next(error);
    }
  }

  public static async createDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id || req.body.hospital_id || req.body.hospitalId);
      const { name, specialization, department, phone, available, onDuty } = req.body;
      if (!name || !specialization) {
        return res.status(400).json({ success: false, message: 'Doctor name and specialization are required' });
      }
      const doctor = await hospitalService.createDoctor({
        hospitalId: id,
        name,
        specialization,
        department,
        phone,
        available,
        onDuty,
      });
      res.status(201).json({ success: true, data: doctor });
    } catch (error: any) {
      next(error);
    }
  }

  public static async updateDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = String(req.params.doctorId);
      const updated = await hospitalService.updateDoctor(doctorId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  public static async deleteDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = String(req.params.doctorId);
      const deleted = await hospitalService.deleteDoctor(doctorId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  public static async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const resources = await hospitalService.getResources(id);
      res.json({ success: true, data: resources });
    } catch (error: any) {
      next(error);
    }
  }

  public static async updateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resourceId = String(req.params.resourceId);
      const { availableQuantity, totalQuantity } = req.body;
      const updated = await hospitalService.updateResource(resourceId, Number(availableQuantity), totalQuantity ? Number(totalQuantity) : undefined);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Resource not found' });
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  public static async updateCapacity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      // If structured payload with full bed metrics
      if (req.body.available_beds !== undefined || req.body.available_icu_beds !== undefined || req.body.availableEmergencyBeds !== undefined) {
        const payload = {
          available_beds: req.body.available_beds ?? req.body.availableEmergencyBeds,
          total_beds: req.body.total_beds,
          available_icu_beds: req.body.available_icu_beds ?? req.body.availableICUBeds,
          total_icu_beds: req.body.total_icu_beds,
          available_doctors: req.body.available_doctors,
          total_doctors: req.body.total_doctors,
        };
        const updated = await hospitalService.updateHospitalMetrics(id, payload);
        return res.json({ success: true, data: updated });
      }

      const { type, count } = HospitalValidator.validateCapacityUpdate(req.body);
      
      const updated = await hospitalService.capacity.updateBedCount(
        id, 
        type as 'ICU' | 'EMERGENCY', 
        Number(count)
      );
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }

      res.json({ success: true, data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  public static async updateRoster(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const specialists = req.body.specialists;
      
      if (!Array.isArray(specialists)) {
        return res.status(400).json({ success: false, message: 'Specialists must be an array of strings' });
      }

      const result = await hospitalService.resources.updateDoctorRoster(
        id, 
        specialists
      );
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  public static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await hospitalService.getHospitalDashboard(id);
      
      if (!data) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }
      
      res.json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }
}