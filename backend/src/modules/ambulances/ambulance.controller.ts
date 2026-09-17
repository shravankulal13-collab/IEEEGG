// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance HTTP API Controllers
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ambulanceService } from './ambulance.service';
import { updateAmbulanceStatusSchema, updateAmbulanceLocationSchema, createAmbulanceSchema } from './ambulance.validator';
import { mapBackendStatusToUIState } from './ambulance.state-machine';

export class AmbulanceController {
  async getAllAmbulances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ambulances = await ambulanceService.getAllAmbulances();
      const enriched = ambulances.map((amb) => ({
        ...amb,
        ui_state: mapBackendStatusToUIState(amb.status),
      }));
      res.json({ success: true, data: enriched });
    } catch (error: any) {
      next(error);
    }
  }

  async getAmbulanceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'Ambulance ID is required' });
        return;
      }
      const ambulance = await ambulanceService.getAmbulanceById(id);
      res.json({
        success: true,
        data: {
          ...ambulance,
          ui_state: mapBackendStatusToUIState(ambulance.status),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getDriverAmbulance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawDriverId = req.params.driverId || (req as any).user?.id;
      const driverId = Array.isArray(rawDriverId) ? rawDriverId[0] : rawDriverId;
      if (!driverId) {
        res.status(400).json({ success: false, error: 'Driver ID is required' });
        return;
      }
      const ambulance = await ambulanceService.getAmbulanceByDriver(driverId);
      if (!ambulance) {
        res.status(404).json({ success: false, error: 'No ambulance assigned to this driver' });
        return;
      }
      res.json({
        success: true,
        data: {
          ...ambulance,
          ui_state: mapBackendStatusToUIState(ambulance.status),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getIncidentAmbulance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawIncidentId = req.params.incidentId;
      const incidentId = Array.isArray(rawIncidentId) ? rawIncidentId[0] : rawIncidentId;
      if (!incidentId) {
        res.status(400).json({ success: false, error: 'Incident ID is required' });
        return;
      }
      const ambulance = await ambulanceService.getAmbulanceByIncident(incidentId);
      if (!ambulance) {
        res.status(404).json({ success: false, error: 'No ambulance assigned to this incident' });
        return;
      }
      res.json({
        success: true,
        data: {
          ...ambulance,
          ui_state: mapBackendStatusToUIState(ambulance.status),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        res.status(400).json({ success: false, error: 'Ambulance ID is required' });
        return;
      }
      const parseResult = updateAmbulanceStatusSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.issues });
        return;
      }
      const { status, incident_id, hospital_id } = parseResult.data;
      const updated = await ambulanceService.updateAmbulanceStatus(
        id,
        status,
        incident_id,
        hospital_id
      );
      res.json({
        success: true,
        data: {
          ...updated,
          ui_state: mapBackendStatusToUIState(updated.status),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        res.status(400).json({ success: false, error: 'Ambulance ID is required' });
        return;
      }
      const parseResult = updateAmbulanceLocationSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.issues });
        return;
      }
      const { latitude, longitude, speed_kmh, heading, accuracy_meters } = parseResult.data;
      const updated = await ambulanceService.updateAmbulanceLocation(
        id,
        latitude,
        longitude,
        speed_kmh,
        heading,
        accuracy_meters
      );
      res.json({
        success: true,
        data: {
          ...updated,
          ui_state: mapBackendStatusToUIState(updated.status),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = createAmbulanceSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.issues });
        return;
      }
      const created = await ambulanceService.createAmbulance(parseResult.data);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      next(error);
    }
  }
}

export const ambulanceController = new AmbulanceController();
