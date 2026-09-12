// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident HTTP Controller Handlers
// ============================================================

import type { NextFunction, Request, Response } from 'express';
import { incidentService } from './incident.service.js';
import {
  cancelIncidentSchema,
  createIncidentSchema,
  listIncidentsQuerySchema,
  recordLocationSchema,
  updateIncidentStatusSchema,
  verifyIncidentSchema,
} from './incident.validator.js';

export class IncidentController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createIncidentSchema.parse(req.body);
      const reportedBy = req.user ? req.user.id : null;
      const incident = await incidentService.createIncident(validated, reportedBy);

      res.status(201).json({
        success: true,
        message: 'Emergency incident successfully reported.',
        data: incident,
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listIncidentsQuerySchema.parse(req.query);
      const result = await incidentService.listIncidents(query);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          page: query.page,
          limit: query.limit,
          total: result.total,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const incident = await incidentService.getIncidentById(id);

      res.status(200).json({
        success: true,
        data: incident,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = updateIncidentStatusSchema.parse(req.body);
      const updated = await incidentService.updateIncidentStatus(id, validated, req.user?.id);

      res.status(200).json({
        success: true,
        message: `Incident status updated to '${updated.status}'.`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = verifyIncidentSchema.parse(req.body);
      const verifierUserId = req.user ? req.user.id : null;

      const result = await incidentService.verifyIncident(id, validated, verifierUserId);

      res.status(200).json({
        success: true,
        message: `Incident verification result '${validated.result}' registered.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = cancelIncidentSchema.parse(req.body);
      const cancelled = await incidentService.cancelIncident(id, validated);

      res.status(200).json({
        success: true,
        message: 'Emergency incident cancelled.',
        data: cancelled,
      });
    } catch (err) {
      next(err);
    }
  }

  async recordLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = recordLocationSchema.parse(req.body);
      const record = await incidentService.recordLocation(id, validated);

      res.status(201).json({
        success: true,
        message: 'Reporter location update recorded.',
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const incidentController = new IncidentController();
