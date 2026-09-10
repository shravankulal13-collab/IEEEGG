// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Lifecycle & Orchestration Service
// ============================================================

import {
  DispatchRecommendation,
  generateDispatchRecommendation,
} from "./dispatch.engine";

import {
  DispatchRepository,
} from "./dispatch.repository";

import {
  DispatchRecommendationRequest,
} from "./dispatch.validator";

export class DispatchService {
  constructor(
    private readonly repository: DispatchRepository,
  ) {}

  /*
   * ----------------------------------------------------------
   * GENERATE RECOMMENDATION
   * ----------------------------------------------------------
   */

  async generateRecommendation(
    request: DispatchRecommendationRequest,
  ): Promise<DispatchRecommendation> {
    const incident =
      await this.repository.findIncidentById(
        request.incidentId,
      );

    if (!incident) {
      throw new Error(
        "Incident not found",
      );
    }

    /*
     * Fetch all required candidates
     * in parallel.
     */
    const [
      ambulances,
      hospitals,
      routes,
    ] = await Promise.all([
      this.repository.findAvailableAmbulances(
        incident.latitude,
        incident.longitude,
      ),

      this.repository.findSuitableHospitals(
        incident.latitude,
        incident.longitude,
      ),

      this.repository.findRoutesForIncident(
        request.incidentId,
      ),
    ]);

    /*
     * Pass data to the pure decision engine.
     */
    return generateDispatchRecommendation(
      {
        ambulances,
        hospitals,
        routes,

        request: {
          ambulanceRequirements:
            request.ambulanceRequirements,

          hospitalRequirements:
            request.hospitalRequirements,
        },
      },
    );
  }

  /*
   * ----------------------------------------------------------
   * ACCEPT
   * ----------------------------------------------------------
   */

  async acceptDispatch(
    dispatchId: string,
  ) {
    return this.repository.updateDispatchStatus(
      dispatchId,
      "accepted",
    );
  }

  /*
   * ----------------------------------------------------------
   * REJECT
   * ----------------------------------------------------------
   */

  async rejectDispatch(
    dispatchId: string,
    reason: string,
  ) {
    return this.repository.updateDispatchStatus(
      dispatchId,
      "rejected",
      reason,
    );
  }

  /*
   * ----------------------------------------------------------
   * CANCEL
   * ----------------------------------------------------------
   */

  async cancelDispatch(
    dispatchId: string,
    reason: string,
  ) {
    return this.repository.updateDispatchStatus(
      dispatchId,
      "cancelled",
      reason,
    );
  }

  /*
   * ----------------------------------------------------------
   * REASSIGN
   * ----------------------------------------------------------
   */

  async reassignDispatch(
    dispatchId: string,
    reason: string,
  ) {
    return this.repository.updateDispatchStatus(
      dispatchId,
      "cancelled",
      `Reassignment requested: ${reason}`,
    );
  }
}