// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Directory & Status Controller
// ============================================================

import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  HospitalService,
} from "./hospital.service";

import {
  hospitalCapacityUpdateSchema,
  hospitalResourceUpdateSchema,
  hospitalIdSchema,
  hospitalStatusSchema,
  hospitalTriageSchema,
} from "./hospital.validator";

export class HospitalController {
  constructor(
    private readonly service: HospitalService,
  ) {}

  /*
   * ----------------------------------------------------------
   * GET ALL HOSPITALS
   * ----------------------------------------------------------
   */

  async getHospitals(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const limit = Number(
        req.query.limit ?? 50,
      );

      const hospitals =
        await this.service.getHospitals(
          Number.isFinite(limit)
            ? limit
            : 50,
        );

      return res.status(200).json({
        success: true,
        data: hospitals,
      });
    } catch (error) {
      return next(error);
    }
  }

  /*
   * ----------------------------------------------------------
   * GET HOSPITAL BY ID
   * ----------------------------------------------------------
   */

  async getHospital(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { hospitalId } =
        hospitalIdSchema.parse({
          hospitalId:
            req.params.hospitalId,
        });

      const hospital =
        await this.service.getHospital(
          hospitalId,
        );

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message:
            "Hospital not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: hospital,
      });
    } catch (error) {
      return next(error);
    }
  }

  /*
   * ----------------------------------------------------------
   * GET CAPACITY
   * ----------------------------------------------------------
   */

  async getCapacity(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { hospitalId } =
        hospitalIdSchema.parse({
          hospitalId:
            req.params.hospitalId,
        });

      const capacity =
        await this.service.getCapacity(
          hospitalId,
        );

      return res.status(200).json({
        success: true,
        data: capacity,
      });
    } catch (error) {
      return next(error);
    }
  }

  /*
   * ----------------------------------------------------------
   * UPDATE CAPACITY
   * ----------------------------------------------------------
   */

  async updateCapacity(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const request =
        hospitalCapacityUpdateSchema.parse(
          {
            ...req.body,

            hospitalId:
              req.params.hospitalId,
          },
        );

      const result =
        await this.service.updateCapacity(
          request,
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /*
   * ----------------------------------------------------------
   * UPDATE STATUS
   * ----------------------------------------------------------
   */

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { hospitalId } =
        hospitalIdSchema.parse({
          hospitalId:
            req.params.hospitalId,
        });

      const { status } =
        hospitalStatusSchema.parse(
          req.body,
        );

      const result =
        await this.service.updateStatus(
          hospitalId,
          status,
        );

      if (!result) {
        return res.status(404).json({
          success: false,
          message:
            "Hospital not found",
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

  /*
   * ----------------------------------------------------------
   * GET RESOURCES
   * ----------------------------------------------------------
   */

  async getResources(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { hospitalId } =
        hospitalIdSchema.parse({
          hospitalId:
            req.params.hospitalId,
        });

      const resources =
        await this.service.getResources(
          hospitalId,
        );

      return res.status(200).json({
        success: true,
        data: resources,
      });
    } catch (error) {
      return next(error);
    }
  }

  /*
   * ----------------------------------------------------------
   * UPDATE RESOURCE
   * ----------------------------------------------------------
   */

  async updateResource(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const request =
        hospitalResourceUpdateSchema.parse(
          {
            ...req.body,

            hospitalId:
              req.params.hospitalId,
          },
        );

      const result =
        await this.service.updateResource(
          request.hospitalId,

          request.resourceType,

          request.totalQuantity,

          request.availableQuantity,

          request.status ??
            "available",
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /*
   * ----------------------------------------------------------
   * TRIAGE / MATCH HOSPITAL
   * ----------------------------------------------------------
   */

  async triage(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const request =
        hospitalTriageSchema.parse(
          {
            ...req.body,

            hospitalId:
              req.params.hospitalId,
          },
        );

      const result =
        await this.service.triage(
          request,
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}