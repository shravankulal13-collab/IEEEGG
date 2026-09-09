// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance ETA Calculation Engine
// ============================================================

import { locationProcessor } from './location.processor';

export interface ETAResult {
  distance_km: number;
  eta_minutes: number;
  formatted_eta: string;
  speed_kmh: number;
}

export class ETAService {
  private readonly DEFAULT_AMBULANCE_SPEED_KMH = 45; // Urban emergency response average speed

  calculateETA(
    currentLat: number,
    currentLng: number,
    targetLat: number,
    targetLng: number,
    currentSpeedKmh?: number
  ): ETAResult {
    const distance_km = locationProcessor.calculateDistanceKm(
      currentLat,
      currentLng,
      targetLat,
      targetLng
    );

    // Use current moving speed if reasonable (> 10 km/h), else fallback to default speed
    const effectiveSpeed =
      currentSpeedKmh && currentSpeedKmh > 10 ? currentSpeedKmh : this.DEFAULT_AMBULANCE_SPEED_KMH;

    // Traffic congestion factor estimate (1.2 multiplier)
    const travelTimeHours = (distance_km / effectiveSpeed) * 1.2;
    const eta_minutes = Math.max(1, Math.ceil(travelTimeHours * 60));

    const formatted_eta =
      eta_minutes < 60
        ? `${String(eta_minutes).padStart(2, '0')} min`
        : `${Math.floor(eta_minutes / 60)}h ${eta_minutes % 60}m`;

    return {
      distance_km,
      eta_minutes,
      formatted_eta,
      speed_kmh: effectiveSpeed,
    };
  }
}

export const etaService = new ETAService();
