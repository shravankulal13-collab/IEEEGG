// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Coordination API Client Service
// ============================================================

import { apiRequest } from './api';
import { ambulanceService } from './ambulance.service';

export interface DispatchCandidate {
  ambulance_id: string;
  ambulance_number: string;
  driver_name: string;
  driver_phone: string;
  ambulance_type: 'ALS' | 'BLS' | 'PTS';
  current_latitude: number;
  current_longitude: number;
  distance_km: number;
  eta_minutes: number;
  score: number;
  score_breakdown: {
    proximity_score: number;
    eta_score: number;
    capability_score: number;
    crew_readiness_score: number;
  };
  equipment: string[];
  status: 'available' | 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'offline';
}

export interface DispatchRequestPayload {
  incident_id: string;
  ambulance_id: string;
  hospital_id?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dispatcher_notes?: string;
}

export interface DispatchResponse {
  success: boolean;
  assignment_id: string;
  incident_id: string;
  ambulance_id: string;
  assigned_at: string;
  estimated_eta_minutes: number;
  status: string;
}

export class DispatchService {
  async requestDispatch(payload: DispatchRequestPayload): Promise<DispatchResponse> {
    const res = await apiRequest<{ success: boolean; data: DispatchResponse }>('/dispatch/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data || (res as unknown as DispatchResponse);
  }

  async getScoredCandidates(_incidentId: string, incidentLocation?: { lat: number; lng: number }): Promise<DispatchCandidate[]> {
    // Fetch live ambulances from DB
    const ambulances = await ambulanceService.getAllAmbulances();
    const available = ambulances.filter((a) => a.status.toLowerCase() === 'available');

    const incLat = incidentLocation?.lat ?? 12.9716;
    const incLng = incidentLocation?.lng ?? 77.5946;

    const candidates: DispatchCandidate[] = available.map((amb) => {
      const ambLat = amb.current_latitude ?? 12.9716;
      const ambLng = amb.current_longitude ?? 77.5946;
      
      // Calculate Haversine distance in km
      const distanceKm = this.calculateDistanceKm(incLat, incLng, ambLat, ambLng);
      const etaMinutes = Math.max(2, Math.round((distanceKm / 35) * 60)); // Avg 35 km/h emergency speed
      const type = (amb.ambulance_type as 'ALS' | 'BLS' | 'PTS') || 'ALS';
      const scoring = this.calculateDispatchScore({
        distance_km: distanceKm,
        eta_minutes: etaMinutes,
        type,
        is_als_required: true,
      });

      return {
        ambulance_id: amb.id,
        ambulance_number: amb.ambulance_number,
        driver_name: amb.driver_name || 'Assigned Driver',
        driver_phone: amb.driver_phone || '+91 98765 00000',
        ambulance_type: type,
        current_latitude: ambLat,
        current_longitude: ambLng,
        distance_km: Math.round(distanceKm * 10) / 10,
        eta_minutes: etaMinutes,
        score: scoring.score,
        score_breakdown: scoring.breakdown,
        equipment: amb.emergency_capable ? ['Defibrillator', 'Ventilator', 'Oxygen Supply'] : ['Oxygen Supply', 'First Aid'],
        status: (amb.status as any) || 'available',
      };
    });

    // Sort by highest score first
    return candidates.sort((a, b) => b.score - a.score);
  }

  calculateDispatchScore(candidate: {
    distance_km: number;
    eta_minutes: number;
    type: string;
    is_als_required: boolean;
  }): { score: number; breakdown: DispatchCandidate['score_breakdown'] } {
    const proximityScore = Math.max(0, Math.round(100 - candidate.distance_km * 10));
    const etaScore = Math.max(0, Math.round(100 - candidate.eta_minutes * 6));
    const capabilityScore = (!candidate.is_als_required || candidate.type === 'ALS') ? 100 : 40;
    const readinessScore = 95;

    const totalScore = Math.round(
      proximityScore * 0.35 +
      etaScore * 0.35 +
      capabilityScore * 0.20 +
      readinessScore * 0.10
    );

    return {
      score: Math.min(100, Math.max(0, totalScore)),
      breakdown: {
        proximity_score: proximityScore,
        eta_score: etaScore,
        capability_score: capabilityScore,
        crew_readiness_score: readinessScore,
      },
    };
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const dispatchService = new DispatchService();
