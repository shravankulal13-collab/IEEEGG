import { describe, it, expect } from 'vitest';
import {
  isValidStateTransition,
  mapBackendStatusToUIState,
  assertValidTransition,
} from '../modules/ambulances/ambulance.state-machine';
import { gpsValidator } from '../modules/tracking/gps.validator';
import { locationProcessor } from '../modules/tracking/location.processor';
import { etaService } from '../modules/tracking/eta.service';

describe('Ambulance State Machine Unit Tests', () => {
  it('should allow valid lifecycle transitions: Available -> Dispatched -> EnRoute -> Arrived -> Completed', () => {
    expect(isValidStateTransition('available', 'dispatched')).toBe(true);
    expect(isValidStateTransition('dispatched', 'en_route_to_incident')).toBe(true);
    expect(isValidStateTransition('en_route_to_incident', 'on_scene')).toBe(true);
    expect(isValidStateTransition('on_scene', 'at_hospital')).toBe(true);
    expect(isValidStateTransition('at_hospital', 'returning')).toBe(true);
    expect(isValidStateTransition('returning', 'available')).toBe(true);
  });

  it('should map backend statuses correctly to UI states', () => {
    expect(mapBackendStatusToUIState('available')).toBe('AVAILABLE');
    expect(mapBackendStatusToUIState('dispatched')).toBe('DISPATCHED');
    expect(mapBackendStatusToUIState('en_route_to_incident')).toBe('EN_ROUTE');
    expect(mapBackendStatusToUIState('on_scene')).toBe('ARRIVED');
    expect(mapBackendStatusToUIState('returning')).toBe('COMPLETED');
    expect(mapBackendStatusToUIState('offline')).toBe('OFFLINE');
  });

  it('should throw an error on invalid transitions', () => {
    expect(() => assertValidTransition('available', 'on_scene')).toThrow();
    expect(() => assertValidTransition('offline', 'en_route_to_incident')).toThrow();
  });
});

describe('GPS Telemetry & Validation Unit Tests', () => {
  it('should validate normal GPS coordinates', () => {
    const res = gpsValidator.validatePoint({
      latitude: 12.9716,
      longitude: 77.5946,
      accuracy_meters: 5,
      speed_kmh: 40,
    });
    expect(res.isValid).toBe(true);
    expect(res.sanitizedPoint?.latitude).toBe(12.9716);
  });

  it('should reject out of range GPS coordinates or Null Island', () => {
    expect(gpsValidator.validatePoint({ latitude: 100, longitude: 77.5946 }).isValid).toBe(false);
    expect(gpsValidator.validatePoint({ latitude: 0, longitude: 0 }).isValid).toBe(false);
    expect(gpsValidator.validatePoint({ latitude: 12.97, longitude: 77.59, speed_kmh: 500 }).isValid).toBe(false);
  });

  it('should calculate Haversine distance and ETA accurately', () => {
    const dist = locationProcessor.calculateDistanceKm(12.9716, 77.5946, 12.9352, 77.6245);
    expect(dist).toBeGreaterThan(0);

    const eta = etaService.calculateETA(12.9716, 77.5946, 12.9352, 77.6245, 45);
    expect(eta.distance_km).toBe(dist);
    expect(eta.eta_minutes).toBeGreaterThan(0);
    expect(eta.formatted_eta).toContain('min');
  });
});
