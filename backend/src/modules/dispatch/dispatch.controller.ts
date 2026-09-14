// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch HTTP Controller
// ============================================================

import { Request, Response } from 'express';
import { DispatchService } from './dispatch.service.js';
import { DispatchValidator } from './dispatch.validator.js';
import { geoAgentService } from './geoagent.service.js';

const dispatchService = new DispatchService();

export class DispatchController {
  public static async requestDispatch(req: Request, res: Response) {
    try {
      const validatedData = DispatchValidator.validateEmergencyRequest(req.body);
      const result = await dispatchService.handleNewEmergency(validatedData);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public static async evaluateGeoAgent(req: Request, res: Response) {
    try {
      const { incidentLocation, severity, requiresICU, simulationOverrides } = req.body;
      const lat = Number(incidentLocation?.latitude || 12.9716);
      const lon = Number(incidentLocation?.longitude || 77.5946);

      const evaluation = await geoAgentService.evaluate({
        incidentLocation: { latitude: lat, longitude: lon },
        severity: severity || 'HIGH',
        requiresICU: requiresICU !== undefined ? requiresICU : true,
        simulationOverrides,
      });

      res.json({ success: true, data: evaluation });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}