// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Operations & Triage Service
// ============================================================

import {
  HospitalRepository,
} from "./hospital.repository";

import {
  HospitalCapacityService,
} from "./hospital.capacity.service";

import {
  HospitalResourceService,
  HospitalMatchRequirements,
} from "./hospital.resource.service";

import {
  HospitalTriageRequest,
} from "./hospital.validator";

export class HospitalService {
  constructor(
    private readonly repository: HospitalRepository,

    private readonly capacityService: HospitalCapacityService,

    private readonly resourceService: HospitalResourceService,
  ) {}

  /*
   * ----------------------------------------------------------
   * GET HOSPITAL
   * ----------------------------------------------------------
   */

  async getHospital(
    hospitalId: string,
  ) {
    const hospital =
      await this.repository.findHospitalById(
        hospitalId,
      );

    if (!hospital) {
      return null;
    }

    return hospital;
  }

  /*
   * ----------------------------------------------------------
   * GET HOSPITAL DIRECTORY
   * ----------------------------------------------------------
   */

  async getHospitals(
    limit = 50,
  ) {
    return this.repository
      .findActiveHospitals(limit);
  }

  /*
   * ----------------------------------------------------------
   * UPDATE STATUS
   * ----------------------------------------------------------
   */

  async updateStatus(
    hospitalId: string,
    status:
      | "active"
      | "busy"
      | "temporarily_unavailable"
      | "offline",
  ) {
    const hospital =
      await this.repository.findHospitalById(
        hospitalId,
      );

    if (!hospital) {
      throw new Error(
        "Hospital not found",
      );
    }

    return this.repository.updateHospitalStatus(
      hospitalId,
      status,
    );
  }

  /*
   * ----------------------------------------------------------
   * GET CAPACITY
   * ----------------------------------------------------------
   */

  async getCapacity(
    hospitalId: string,
  ) {
    return this.capacityService
      .getCapacity(hospitalId);
  }

  /*
   * ----------------------------------------------------------
   * UPDATE CAPACITY
   * ----------------------------------------------------------
   */

  async updateCapacity(
    request: Parameters<
      HospitalCapacityService["updateCapacity"]
    >[0],
  ) {
    return this.capacityService
      .updateCapacity(request);
  }

  /*
   * ----------------------------------------------------------
   * TRIAGE / HOSPITAL MATCH
   * ----------------------------------------------------------
   */

  async triage(
    request: HospitalTriageRequest,
  ) {
    const hospital =
      await this.repository.findHospitalById(
        request.hospitalId,
      );

    if (!hospital) {
      throw new Error(
        "Hospital not found",
      );
    }

    /*
     * Hospital must be able to receive
     * emergency patients.
     */
    if (
      !hospital.emergencyDepartment
    ) {
      return {
        hospitalId:
          hospital.id,

        hospitalName:
          hospital.name,

        eligible: false,

        reasons: [
          "Hospital does not have an emergency department",
        ],
      };
    }

    if (
      !hospital.ambulanceReceiving
    ) {
      return {
        hospitalId:
          hospital.id,

        hospitalName:
          hospital.name,

        eligible: false,

        reasons: [
          "Hospital is currently not receiving ambulances",
        ],
      };
    }

    const requirements:
      HospitalMatchRequirements = {
        requiresIcu:
          request.requiresIcu,

        requiresTraumaCare:
          request.requiresTraumaCare,

        requiredSpecialization:
          request.requiredSpecialization,

        requiredResources:
          request.requiredResources,
      };

    return this.resourceService.matchHospital(
      request.hospitalId,
      requirements,
    );
  }

  /*
   * ----------------------------------------------------------
   * GET RESOURCES
   * ----------------------------------------------------------
   */

  async getResources(
    hospitalId: string,
  ) {
    return this.resourceService
      .getResources(hospitalId);
  }

  /*
   * ----------------------------------------------------------
   * UPDATE RESOURCE
   * ----------------------------------------------------------
   */

  async updateResource(
    hospitalId: string,
    resourceType: string,
    totalQuantity: number,
    availableQuantity: number,
    status:
      | "available"
      | "occupied"
      | "maintenance"
      | "unavailable",
  ) {
    return this.resourceService
      .updateResource(
        hospitalId,
        resourceType,
        totalQuantity,
        availableQuantity,
        status,
      );
  }
}