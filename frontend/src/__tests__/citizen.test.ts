import { describe, it, expect } from 'vitest';
import { useAmbulanceStore } from '../store/ambulanceStore';

describe('Frontend Ambulance Store Unit Tests', () => {
  it('should initialize with default state', () => {
    const state = useAmbulanceStore.getState();
    expect(state.currentAmbulance).toBeNull();
    expect(state.activeTelemetry).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should update telemetry state correctly', () => {
    useAmbulanceStore.getState().setTelemetry({
      ambulance_id: 'amb-104',
      latitude: 12.9716,
      longitude: 77.5946,
      last_updated: new Date().toISOString(),
      telemetry_status: 'live',
      eta: {
        distance_km: 2.4,
        eta_minutes: 6,
        formatted_eta: '06 min',
        speed_kmh: 45,
      },
    });

    const state = useAmbulanceStore.getState();
    expect(state.activeTelemetry?.ambulance_id).toBe('amb-104');
    expect(state.activeTelemetry?.eta?.formatted_eta).toBe('06 min');
  });
});
