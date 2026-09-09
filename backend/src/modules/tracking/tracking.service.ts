// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Telemetry Ingestion & Live Tracking Orchestrator
// ============================================================

import { gpsValidator, RawGPSPoint } from './gps.validator';
import { locationProcessor } from './location.processor';
import { trackingRepository } from './tracking.repository';
import { ambulanceService } from '../ambulances/ambulance.service';
import { etaService, ETAResult } from './eta.service';

export interface TelemetryIngestPayload extends RawGPSPoint {
  ambulance_id: string;
  incident_latitude?: number;
  incident_longitude?: number;
}

export interface ProcessedTelemetry {
  ambulance_id: string;
  latitude: number;
  longitude: number;
  speed_kmh?: number;
  heading?: number;
  accuracy_meters?: number;
  last_updated: string;
  telemetry_status: 'live' | 'stale' | 'invalid';
  eta?: ETAResult;
}

export class TrackingService {
  async processTelemetry(payload: TelemetryIngestPayload): Promise<ProcessedTelemetry> {
    // 1. Validate GPS Point
    const validation = gpsValidator.validatePoint(payload);
    if (!validation.isValid || !validation.sanitizedPoint) {
      throw new Error(`GPS Validation Failed: ${validation.reason}`);
    }

    const sanitized = validation.sanitizedPoint;

    // 2. Fetch previous location for smoothing
    const lastHistory = await trackingRepository.getLatestLocation(payload.ambulance_id);
    const prevPoint: RawGPSPoint | null = lastHistory
      ? {
          latitude: lastHistory.latitude,
          longitude: lastHistory.longitude,
          speed_kmh: lastHistory.speed_kmh,
          heading: lastHistory.heading,
        }
      : null;

    // 3. Smooth coordinates
    const smoothed = locationProcessor.smoothLocation(prevPoint, sanitized);

    // 4. Update ambulance table current position
    const updatedAmbulance = await ambulanceService.updateAmbulanceLocation(
      payload.ambulance_id,
      smoothed.latitude,
      smoothed.longitude,
      smoothed.speed_kmh,
      smoothed.heading,
      smoothed.accuracy_meters
    );

    // 5. Log to history table
    await trackingRepository.logLocation({
      ambulance_id: payload.ambulance_id,
      latitude: smoothed.latitude,
      longitude: smoothed.longitude,
      speed_kmh: smoothed.speed_kmh,
      heading: smoothed.heading,
      accuracy_meters: smoothed.accuracy_meters,
      source: 'ambulance_app',
    });

    // 6. Calculate ETA if incident target coordinates are provided
    let eta: ETAResult | undefined;
    if (payload.incident_latitude && payload.incident_longitude) {
      eta = etaService.calculateETA(
        smoothed.latitude,
        smoothed.longitude,
        payload.incident_latitude,
        payload.incident_longitude,
        smoothed.speed_kmh
      );
    }

    return {
      ambulance_id: payload.ambulance_id,
      latitude: smoothed.latitude,
      longitude: smoothed.longitude,
      speed_kmh: smoothed.speed_kmh,
      heading: smoothed.heading,
      accuracy_meters: smoothed.accuracy_meters,
      last_updated: updatedAmbulance.last_gps_update || new Date().toISOString(),
      telemetry_status: 'live',
      eta,
    };
  }

  async getLatestTracking(
    ambulanceId: string,
    targetLat?: number,
    targetLng?: number
  ): Promise<ProcessedTelemetry | null> {
    const ambulance = await ambulanceService.getAmbulanceById(ambulanceId);
    if (!ambulance || !ambulance.current_latitude || !ambulance.current_longitude) {
      return null;
    }

    // Check if telemetry is stale (> 60 seconds since last update)
    const lastUpdate = ambulance.last_gps_update ? new Date(ambulance.last_gps_update).getTime() : 0;
    const isStale = Date.now() - lastUpdate > 60000;

    let eta: ETAResult | undefined;
    if (targetLat && targetLng) {
      eta = etaService.calculateETA(
        ambulance.current_latitude,
        ambulance.current_longitude,
        targetLat,
        targetLng,
        ambulance.current_speed_kmh
      );
    }

    return {
      ambulance_id: ambulance.id,
      latitude: ambulance.current_latitude,
      longitude: ambulance.current_longitude,
      speed_kmh: ambulance.current_speed_kmh,
      heading: ambulance.current_heading,
      accuracy_meters: ambulance.gps_accuracy_meters,
      last_updated: ambulance.last_gps_update || new Date().toISOString(),
      telemetry_status: isStale ? 'stale' : 'live',
      eta,
    };
  }
}

export const trackingService = new TrackingService();
