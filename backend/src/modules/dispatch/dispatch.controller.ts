// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch HTTP Controller
// ============================================================

import { Request, Response } from 'express';
import { DispatchService } from './dispatch.service';
import { DispatchValidator } from './dispatch.validator';

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
}