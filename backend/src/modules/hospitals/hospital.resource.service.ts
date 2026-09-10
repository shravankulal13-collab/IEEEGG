// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Specialist & Equipment Matching Service
// ============================================================

import {
  HospitalRepository,
} from "./hospital.repository";

export interface HospitalMatchRequirements {
  requiresIcu?: boolean;
  requiresTraumaCare?: boolean;
  requiredSpecialization?: string;
  requiredResources?: string[];
}

export class HospitalResourceService {
  constructor(
    private readonly repository: HospitalRepository,
  ) {}

  /*
   * ----------------------------------------------------------
   * GET RESOURCES
   * ----------------------------------------------------------
   */

  async getResources(
    hospitalId: string,
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

    return this.repository.findResources(
      hospitalId,
    );
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
      | "unavailable" = "available",
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

    if (
      availableQuantity >
      totalQuantity
    ) {
      throw new Error(
        "Available quantity cannot exceed total quantity",
      );
    }

    return this.repository.updateResource(
      hospitalId,
      resourceType,
      totalQuantity,
      availableQuantity,
      status,
    );
  }

  /*
   * ----------------------------------------------------------
   * FIND AVAILABLE SPECIALIZATIONS
   * ----------------------------------------------------------
   */

  async getAvailableSpecializations(
    hospitalId: string,
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

    return this.repository
      .findAvailableSpecializations(
        hospitalId,
      );
  }

  /*
   * ----------------------------------------------------------
   * MATCH HOSPITAL CAPABILITIES
   * ----------------------------------------------------------
   */

  async matchHospital(
    hospitalId: string,
    requirements: HospitalMatchRequirements,
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

    const specializations =
      await this.repository
        .findAvailableSpecializations(
          hospitalId,
        );

    const resources =
      await this.repository.findResources(
        hospitalId,
      );

    const reasons: string[] = [];

    let icuMatch = true;
    let traumaMatch = true;
    let specialistMatch = true;
    let resourceMatch = true;

    /*
     * ICU
     */
    if (requirements.requiresIcu) {
      icuMatch =
        hospital.availableIcuBeds >
        0;

      if (icuMatch) {
        reasons.push(
          "ICU bed available",
        );
      }
    }

    /*
     * Trauma
     */
    if (
      requirements.requiresTraumaCare
    ) {
      traumaMatch =
        hospital.traumaCenter;

      if (traumaMatch) {
        reasons.push(
          "Trauma care available",
        );
      }
    }

    /*
     * Specialist
     */
    if (
      requirements.requiredSpecialization
    ) {
      specialistMatch =
        specializations.some(
          (specialization) =>
            specialization
              .toLowerCase()
              .trim() ===
            requirements
              .requiredSpecialization!
              .toLowerCase()
              .trim(),
        );

      if (specialistMatch) {
        reasons.push(
          `Required specialist available: ${requirements.requiredSpecialization}`,
        );
      }
    }

    /*
     * Resources
     */
    if (
      requirements.requiredResources
        ?.length
    ) {
      const availableResourceTypes =
        resources
          .filter(
            (resource) =>
              resource.availableQuantity >
                0 &&
              resource.status ===
                "available",
          )
          .map(
            (resource) =>
              resource.resourceType
                .toLowerCase()
                .trim(),
          );

      const missingResources =
        requirements.requiredResources.filter(
          (resource) =>
            !availableResourceTypes.includes(
              resource
                .toLowerCase()
                .trim(),
            ),
        );

      resourceMatch =
        missingResources.length === 0;

      if (resourceMatch) {
        reasons.push(
          "All required medical resources available",
        );
      } else {
        reasons.push(
          `Missing resources: ${missingResources.join(", ")}`,
        );
      }
    }

    const eligible =
      icuMatch &&
      traumaMatch &&
      specialistMatch &&
      resourceMatch;

    return {
      hospitalId,

      hospitalName:
        hospital.name,

      eligible,

      matches: {
        icu: icuMatch,
        trauma:
          traumaMatch,
        specialist:
          specialistMatch,
        resources:
          resourceMatch,
      },

      availableBeds:
        hospital.availableBeds,

      availableIcuBeds:
        hospital.availableIcuBeds,

      availableDoctors:
        hospital.availableDoctors,

      reasons,
    };
  }
}