// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: GPS Coordinate & Telemetry Validation
// ============================================================

export interface RawGPSPoint {
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  speed_kmh?: number;
  heading?: number;
  timestamp?: number | string;
}

export interface GPSValidationResult {
  isValid: boolean;
  reason?: string;
  sanitizedPoint?: RawGPSPoint;
}

export class GPSValidator {
  private readonly MAX_SPEED_KMH = 220; // Emergency vehicle speed cap
  private readonly MAX_ACCURACY_METERS = 500; // Filter out ultra-inaccurate GPS points

  validatePoint(point: RawGPSPoint): GPSValidationResult {
    const { latitude, longitude, accuracy_meters, speed_kmh } = point;

    if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
      return { isValid: false, reason: 'Latitude out of valid range [-90, 90]' };
    }

    if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
      return { isValid: false, reason: 'Longitude out of valid range [-180, 180]' };
    }

    if (latitude === 0 && longitude === 0) {
      return { isValid: false, reason: 'Null Island (0,0) coordinates rejected' };
    }

    if (accuracy_meters !== undefined && accuracy_meters > this.MAX_ACCURACY_METERS) {
      return { isValid: false, reason: `GPS accuracy low (${accuracy_meters}m exceeds threshold)` };
    }

    if (speed_kmh !== undefined && speed_kmh > this.MAX_SPEED_KMH) {
      return { isValid: false, reason: `Speed anomaly (${speed_kmh} km/h exceeds physical limit)` };
    }

    return {
      isValid: true,
      sanitizedPoint: {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy_meters: accuracy_meters ? Math.max(0, Math.round(accuracy_meters)) : undefined,
        speed_kmh: speed_kmh ? Math.max(0, Number(speed_kmh.toFixed(1))) : 0,
        heading: point.heading ? (point.heading + 360) % 360 : undefined,
        timestamp: point.timestamp || new Date().toISOString(),
      },
    };
  }
}

export const gpsValidator = new GPSValidator();
