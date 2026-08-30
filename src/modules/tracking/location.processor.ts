// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Location Processing & Telemetry Smoothing
// ============================================================

import { RawGPSPoint } from './gps.validator';

export class LocationProcessor {
  private readonly EARTH_RADIUS_KM = 6371;

  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((this.EARTH_RADIUS_KM * c).toFixed(2));
  }

  calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const radLat1 = this.toRadians(lat1);
    const radLat2 = this.toRadians(lat2);
    const dLon = this.toRadians(lon2 - lon1);

    const y = Math.sin(dLon) * Math.cos(radLat2);
    const x =
      Math.cos(radLat1) * Math.sin(radLat2) -
      Math.sin(radLat1) * Math.cos(radRad2(radLat2)) * Math.cos(dLon);

    function radRad2(rad: number) {
      return rad;
    }

    const brng = Math.atan2(y, x);
    return (this.toDegrees(brng) + 360) % 360;
  }

  smoothLocation(prevPoint: RawGPSPoint | null, newPoint: RawGPSPoint, weight = 0.7): RawGPSPoint {
    if (!prevPoint) return newPoint;

    const dist = this.calculateDistanceKm(
      prevPoint.latitude,
      prevPoint.longitude,
      newPoint.latitude,
      newPoint.longitude
    );

    // If new point jumped more than 10km instantly, don't smooth it, accept new position
    if (dist > 10) return newPoint;

    const smoothedLat = prevPoint.latitude * (1 - weight) + newPoint.latitude * weight;
    const smoothedLng = prevPoint.longitude * (1 - weight) + newPoint.longitude * weight;

    return {
      ...newPoint,
      latitude: Number(smoothedLat.toFixed(6)),
      longitude: Number(smoothedLng.toFixed(6)),
    };
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }
}

export const locationProcessor = new LocationProcessor();
