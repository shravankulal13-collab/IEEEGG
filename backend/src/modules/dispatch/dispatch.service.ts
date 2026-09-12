// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Lifecycle & Orchestration Service
// ============================================================

import { DispatchEngine } from './dispatch.engine';
import { DispatchRepository } from './dispatch.repository';
import { EmergencyRequest } from './dispatch.validator';

export class DispatchService {
  private engine: DispatchEngine;
  private repo: DispatchRepository;

  constructor() {
    this.repo = new DispatchRepository();
    this.engine = new DispatchEngine(this.repo);
  }

  public async handleNewEmergency(request: EmergencyRequest) {
    const match = await this.engine.findBestMatch(request);
    
    if (!match.recommendedAmbulance) {
      throw new Error("No suitable ambulance available.");
    }

    const dispatchRecord = await this.repo.createDispatchRecord({
      ...request,
      assignedAmbulanceId: match.recommendedAmbulance.id,
      targetHospitalId: match.recommendedHospital?.id,
      status: 'PENDING_ACCEPTANCE'
    });

    return { dispatchId: dispatchRecord.insertId, match };
  }
}