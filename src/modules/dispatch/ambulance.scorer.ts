// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Ambulance Suitability Scoring
// ============================================================

import { Ambulance, EmergencyRequest } from './dispatch.validator';

export class AmbulanceScorer {
  public static calculateScore(ambulance: Ambulance, request: EmergencyRequest, routeData: any): number {
    let score = 100;
    
    const etaMinutes = routeData.eta / 60;
    if (etaMinutes > 15) score -= (etaMinutes - 15) * 2;
    
    const missingEquipment = request.requiredEquipment.filter(eq => !ambulance.equipment.includes(eq));
    if (missingEquipment.length > 0) {
      score -= missingEquipment.length * 20; 
    }

    if (ambulance.status !== 'AVAILABLE') score -= 50;

    return Math.max(0, score);
  }
}