// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital ICU & Emergency Bed Capacity Service
// ============================================================

import {
  HospitalRepository,
  HospitalRecord,
} from "./hospital.repository";

import {
  HospitalCapacityUpdateRequest,
} from "./hospital.validator";

export class HospitalCapacityService {
  constructor(
    private readonly repository: HospitalRepository,
  ) {}

  /*
   * ----------------------------------------------------------
   * GET CURRENT CAPACITY
   * ----------------------------------------------------------
   */

  async getCapacity(
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

    return {
      hospitalId: hospital.id,

      hospitalName: hospital.name,

      status: hospital.status,

      beds: {
        total: hospital.totalBeds,
        available:
          hospital.availableBeds,
        occupied:
          Math.max(
            hospital.totalBeds -
              hospital.availableBeds,
            0,
          ),
      },

      icu: {
        total:
          hospital.totalIcuBeds,
        available:
          hospital.availableIcuBeds,
        occupied:
          Math.max(
            hospital.totalIcuBeds -
              hospital.availableIcuBeds,
            0,
          ),
      },

      doctors: {
        total:
          hospital.totalDoctors,
        available:
          hospital.availableDoctors,
        unavailable:
          Math.max(
            hospital.totalDoctors -
              hospital.availableDoctors,
            0,
          ),
      },

      lastUpdated:
        hospital.lastCapacityUpdate,
    };
  }

  /*
   * ----------------------------------------------------------
   * UPDATE CAPACITY
   * ----------------------------------------------------------
   */

  async updateCapacity(
    request: HospitalCapacityUpdateRequest,
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
     * Prevent impossible capacity values.
     */
    if (
      request.availableBeds >
      hospital.totalBeds
    ) {
      throw new Error(
        "Available beds cannot exceed total beds",
      );
    }

    if (
      request.availableIcuBeds >
      hospital.totalIcuBeds
    ) {
      throw new Error(
        "Available ICU beds cannot exceed total ICU beds",
      );
    }

    if (
      request.availableDoctors >
      hospital.totalDoctors
    ) {
      throw new Error(
        "Available doctors cannot exceed total doctors",
      );
    }

    const updated =
      await this.repository.updateCapacity(
        request.hospitalId,

        request.availableBeds,

        request.availableIcuBeds,

        request.availableDoctors,
      );

    if (!updated) {
      throw new Error(
        "Failed to update hospital capacity",
      );
    }

    /*
     * Fetch the updated record so
     * history contains the latest values.
     */
    const updatedHospital =
      await this.repository.findHospitalById(
        request.hospitalId,
      );

    if (updatedHospital) {
      await this.repository.recordCapacityHistory(
        updatedHospital,
      );
    }

    return this.getCapacity(
      request.hospitalId,
    );
  }

  /*
   * ----------------------------------------------------------
   * CHECK ICU AVAILABILITY
   * ----------------------------------------------------------
   */

  async hasAvailableIcu(
    hospitalId: string,
  ): Promise<boolean> {
    const hospital =
      await this.repository.findHospitalById(
        hospitalId,
      );

    if (!hospital) {
      throw new Error(
        "Hospital not found",
      );
    }

    return (
      hospital.availableIcuBeds > 0
    );
  }

  /*
   * ----------------------------------------------------------
   * CHECK EMERGENCY BED
   * ----------------------------------------------------------
   */

  async hasAvailableEmergencyBed(
    hospitalId: string,
  ): Promise<boolean> {
    const hospital =
      await this.repository.findHospitalById(
        hospitalId,
      );

    if (!hospital) {
      throw new Error(
        "Hospital not found",
      );
    }

    return (
      hospital.availableBeds > 0
    );
  }
}