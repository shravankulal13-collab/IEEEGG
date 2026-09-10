// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Suitability Scoring
// ============================================================

import { Hospital, EmergencyRequest } from './dispatch.validator';

export class HospitalScorer {
  public static calculateScore(hospital: Hospital, request: EmergencyRequest, etaMinutes: number): number {
    let score = 100;

    if (request.requiresICU && hospital.availableICUBeds <= 0) return 0; 
    if (!request.requiresICU && hospital.availableEmergencyBeds <= 0) score -= 40;

    const hasSpecialist = request.requiredSpecialists.every(spec => hospital.onCallSpecialists.includes(spec));
    if (!hasSpecialist) score -= 30;

    score -= etaMinutes * 1.5;

    return Math.max(0, score);
  }
}