// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Directory & Status Controller
// ============================================================

import { Request, Response } from 'express';
import { HospitalService } from './hospital.service';
import { HospitalValidator } from './hospital.validator';

const hospitalService = new HospitalService();

export class HospitalController {
  public static async updateCapacity(req: Request, res: Response) {
    try {
      const { type, count } = HospitalValidator.validateCapacityUpdate(req.body);
      
      const updated = await hospitalService.capacity.updateBedCount(
        req.params.id as string, 
        type as 'ICU' | 'EMERGENCY', 
        Number(count)
      );
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async updateRoster(req: Request, res: Response) {
    try {
      const specialists = req.body.specialists;
      
      if (!Array.isArray(specialists)) {
        return res.status(400).json({ success: false, message: 'Specialists must be an array of strings' });
      }

      const result = await hospitalService.resources.updateDoctorRoster(
        req.params.id as string, 
        specialists
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getDashboard(req: Request, res: Response) {
    try {
      const data = await hospitalService.getHospitalDashboard(req.params.id as string);
      
      if (!data) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }
      
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}