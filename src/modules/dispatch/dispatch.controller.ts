// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch HTTP Controller
// ============================================================

import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  DispatchService,
} from "./dispatch.service";

import {
  validateDispatchRecommendation,
  validateDispatchDecision,
} from "./dispatch.validator";

export class DispatchController {
  constructor(
    private readonly service: DispatchService,
  ) {}

  async generateRecommendation(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const request =
        validateDispatchRecommendation(req.body);

      const recommendation =
        await this.service.generateRecommendation(
          request,
        );

      return res.status(200).json({
        success: true,
        data: recommendation,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateDispatch(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const request = validateDispatchDecision({
        ...req.body,
        dispatchId: req.params.dispatchId,
      });

      let result;

      switch (request.action) {
        case "accept":
          result =
            await this.service.acceptDispatch(
              request.dispatchId,
            );
          break;

        case "reject":
          result =
            await this.service.rejectDispatch(
              request.dispatchId,
              request.reason ??
                "Dispatch rejected",
            );
          break;

        case "cancel":
          result =
            await this.service.cancelDispatch(
              request.dispatchId,
              request.reason ??
                "Dispatch cancelled",
            );
          break;

        case "reassign":
          result =
            await this.service.reassignDispatch(
              request.dispatchId,
              request.reason ??
                "Dispatch reassignment requested",
            );
          break;
      }

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Dispatch not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}