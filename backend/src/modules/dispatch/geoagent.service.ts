// ============================================================
// PRIMARY OWNER: SK / Shreevarsha V Hegde
// ROLE: Core Platform & Geo-Spatial Intelligence
// MODULE: GeoAgent Multi-Criteria Decision Support & Simulation Engine
// ============================================================

import { query } from '../../config/database.js';
import { logger } from '../../config/logger.js';

export interface GeoAgentEvaluationRequest {
  incidentLocation: {
    latitude: number;
    longitude: number;
  };
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresICU?: boolean;
  requiredSpecialists?: string[];
  simulationOverrides?: {
    trafficMultiplier?: number;
    blockedHospitalIds?: string[];
    simulatedRoadDelaysMinutes?: number;
  };
}

export interface CandidateAmbulance {
  id: string;
  number: string;
  type: string;
  location: { latitude: number; longitude: number };
  distanceKm: number;
  etaMinutes: number;
  score: number;
  rationale: string;
}

export interface CandidateHospital {
  id: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
  distanceKm: number;
  etaMinutes: number;
  availableBeds: number;
  availableIcuBeds: number;
  traumaCenter: boolean;
  score: number;
  rationale: string;
}

export interface GeoAgentEvaluationResult {
  recommendedAmbulance: CandidateAmbulance | null;
  recommendedHospital: CandidateHospital | null;
  candidateAmbulances: CandidateAmbulance[];
  candidateHospitals: CandidateHospital[];
  decisionExplanation: string;
  whatIfAnalysis?: {
    isSimulation: boolean;
    scenarioSummary: string;
    impactDescription: string;
  };
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export class GeoAgentService {
  public async evaluate(request: GeoAgentEvaluationRequest): Promise<GeoAgentEvaluationResult> {
    const { incidentLocation, severity = 'HIGH', requiresICU = true, simulationOverrides } = request;
    const trafficMultiplier = simulationOverrides?.trafficMultiplier || 1.0;
    const blockedHospitalIds = new Set(simulationOverrides?.blockedHospitalIds || []);

    // 1. Fetch available ambulances from PostgreSQL
    let ambulances: any[] = [];
    try {
      const ambRes = await query(`
        SELECT id, ambulance_number, registration_number, ambulance_type, 
               current_latitude, current_longitude, status, emergency_capable
        FROM ambulances 
        WHERE (status = 'available' OR status IS NULL OR active = true)
      `);
      ambulances = ambRes.rows;
    } catch (err: any) {
      logger.warn('Failed to query ambulances for GeoAgent, using empty state', { error: err.message });
    }

    // 2. Fetch hospitals from PostgreSQL
    let hospitals: any[] = [];
    try {
      const hospRes = await query(`
        SELECT id, name, address, latitude, longitude, 
               total_beds, available_beds, total_icu_beds, available_icu_beds,
               trauma_center, emergency_department
        FROM hospitals 
        WHERE (status = 'active' OR status IS NULL OR active = true)
      `);
      hospitals = hospRes.rows.filter(h => !blockedHospitalIds.has(h.id));
    } catch (err: any) {
      logger.warn('Failed to query hospitals for GeoAgent, using empty state', { error: err.message });
    }

    // 3. Score ambulances
    const candidateAmbulances: CandidateAmbulance[] = ambulances.map((amb) => {
      const lat = Number(amb.current_latitude) || 12.9716;
      const lon = Number(amb.current_longitude) || 77.5946;
      const dist = haversineDistanceKm(incidentLocation.latitude, incidentLocation.longitude, lat, lon);
      // Base speed ~30 km/h in city traffic, adjusted by traffic multiplier
      const eta = Math.max(2, Math.round((dist / (30 / trafficMultiplier)) * 60));

      let score = 100;
      score -= eta * 2;
      if (amb.ambulance_type?.toLowerCase().includes('als') || amb.ambulance_type?.toLowerCase().includes('icu')) {
        score += 15;
      }
      if (amb.emergency_capable) score += 10;

      const rationale = `${amb.ambulance_type || 'ALS Unit'} located ${dist} km away (est. ${eta} min ETA).`;

      return {
        id: amb.id,
        number: amb.ambulance_number || amb.registration_number || 'AMB-UNIT',
        type: amb.ambulance_type || 'Advanced Life Support (ALS)',
        location: { latitude: lat, longitude: lon },
        distanceKm: dist,
        etaMinutes: eta,
        score: Math.max(10, Math.min(100, Math.round(score))),
        rationale,
      };
    }).sort((a, b) => b.score - a.score);

    // 4. Score hospitals
    const candidateHospitals: CandidateHospital[] = hospitals.map((hosp) => {
      const lat = Number(hosp.latitude) || 12.9716;
      const lon = Number(hosp.longitude) || 77.5946;
      const dist = haversineDistanceKm(incidentLocation.latitude, incidentLocation.longitude, lat, lon);
      const eta = Math.max(3, Math.round((dist / (35 / trafficMultiplier)) * 60));

      const availIcu = Number(hosp.available_icu_beds || 0);
      const availBeds = Number(hosp.available_beds || 0);

      let score = 100;
      score -= eta * 2.5;

      if (requiresICU) {
        if (availIcu > 5) score += 20;
        else if (availIcu > 0) score += 10;
        else score -= 40;
      }

      if (hosp.trauma_center) score += 15;
      if (availBeds > 20) score += 10;

      const rationale = `${hosp.name}: ${dist} km (${eta} min ETA), ${availIcu} ICU beds available, ${hosp.trauma_center ? 'Level-1 Trauma Center' : 'General Emergency'}.`;

      return {
        id: hosp.id,
        name: hosp.name,
        address: hosp.address || 'Bengaluru',
        location: { latitude: lat, longitude: lon },
        distanceKm: dist,
        etaMinutes: eta,
        availableBeds: availBeds,
        availableIcuBeds: availIcu,
        traumaCenter: Boolean(hosp.trauma_center),
        score: Math.max(10, Math.min(100, Math.round(score))),
        rationale,
      };
    }).sort((a, b) => b.score - a.score);

    const recommendedAmbulance = candidateAmbulances[0] || null;
    const recommendedHospital = candidateHospitals[0] || null;

    // 5. Generate human-readable decision explanation
    let decisionExplanation = '';
    if (recommendedAmbulance && recommendedHospital) {
      decisionExplanation = `GeoAgent dispatched ${recommendedAmbulance.number} (${recommendedAmbulance.distanceKm} km, ${recommendedAmbulance.etaMinutes} min ETA) as closest ${recommendedAmbulance.type}. Routing to ${recommendedHospital.name} (${recommendedHospital.distanceKm} km, ${recommendedHospital.etaMinutes} min ETA) due to optimal critical care capacity (${recommendedHospital.availableIcuBeds} ICU beds available) and trauma capability.`;
    } else if (recommendedHospital) {
      decisionExplanation = `Selected ${recommendedHospital.name} based on ${recommendedHospital.availableIcuBeds} available ICU beds and ${recommendedHospital.distanceKm} km transit corridor.`;
    } else {
      decisionExplanation = 'No optimal dispatch combination found for current parameters.';
    }

    const isSimulation = Boolean(simulationOverrides && (simulationOverrides.trafficMultiplier !== undefined || simulationOverrides.blockedHospitalIds?.length));

    return {
      recommendedAmbulance,
      recommendedHospital,
      candidateAmbulances: candidateAmbulances.slice(0, 5),
      candidateHospitals: candidateHospitals.slice(0, 5),
      decisionExplanation,
      whatIfAnalysis: isSimulation ? {
        isSimulation: true,
        scenarioSummary: `Simulated traffic load: ${Math.round((trafficMultiplier - 1) * 100)}% extra delay, ${blockedHospitalIds.size} facility diversions.`,
        impactDescription: `ETA shifts: +${Math.round((trafficMultiplier - 1) * 8)} minutes average transit penalty under simulated congestion.`,
      } : undefined,
    };
  }
}

export const geoAgentService = new GeoAgentService();
