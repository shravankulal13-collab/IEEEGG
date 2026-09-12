// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Decision Engine
// ============================================================

import { AmbulanceScorer } from './ambulance.scorer';
import { HospitalScorer } from './hospital.scorer';
import { RouteScorer } from './route.scorer';
import { DispatchRepository } from './dispatch.repository';
import { EmergencyRequest } from './dispatch.validator';

export class DispatchEngine {
  constructor(private dispatchRepo: DispatchRepository) {}

  public async findBestMatch(request: EmergencyRequest) {
    const availableAmbulances = await this.dispatchRepo.getAvailableAmbulances(request.location);
    const availableHospitals = await this.dispatchRepo.getHospitalsWithinRadius(request.location, 50);

    const ambulanceScores = availableAmbulances.map(amb => ({
      ambulance: amb,
      score: AmbulanceScorer.calculateScore(amb, request, { eta: 600 }) 
    })).sort((a, b) => b.score - a.score);

    const hospitalScores = availableHospitals.map(hosp => ({
      hospital: hosp,
      score: HospitalScorer.calculateScore(hosp, request, 15) 
    })).sort((a, b) => b.score - a.score);

    return {
      recommendedAmbulance: ambulanceScores[0]?.ambulance || null,
      recommendedHospital: hospitalScores[0]?.hospital || null,
      confidenceScore: (ambulanceScores[0]?.score + hospitalScores[0]?.score) / 2
    };
  }
}