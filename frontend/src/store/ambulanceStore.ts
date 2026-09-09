// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Frontend Ambulance Zustand State Store
// ============================================================

import { create } from 'zustand';
import type { AmbulanceData, TelemetryData } from '../services/ambulance.service';
import { ambulanceService } from '../services/ambulance.service';

interface AmbulanceState {
  currentAmbulance: AmbulanceData | null;
  activeTelemetry: TelemetryData | null;
  isLoading: boolean;
  error: string | null;

  fetchDriverAmbulance: (driverId: string) => Promise<void>;
  fetchIncidentAmbulance: (incidentId: string) => Promise<void>;
  updateStatus: (ambulanceId: string, status: string, incidentId?: string) => Promise<void>;
  updateLocation: (ambulanceId: string, lat: number, lng: number, speed?: number, heading?: number) => Promise<void>;
  setTelemetry: (telemetry: TelemetryData) => void;
  setError: (error: string | null) => void;
}

export const useAmbulanceStore = create<AmbulanceState>((set) => ({
  currentAmbulance: null,
  activeTelemetry: null,
  isLoading: false,
  error: null,

  fetchDriverAmbulance: async (driverId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ambulanceService.getDriverAmbulance(driverId);
      set({ currentAmbulance: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchIncidentAmbulance: async (incidentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ambulanceService.getIncidentAmbulance(incidentId);
      set({ currentAmbulance: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateStatus: async (ambulanceId: string, status: string, incidentId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await ambulanceService.updateStatus(ambulanceId, status, incidentId);
      set({ currentAmbulance: updated, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateLocation: async (ambulanceId: string, lat: number, lng: number, speed?: number, heading?: number) => {
    try {
      const updated = await ambulanceService.updateLocation(ambulanceId, {
        latitude: lat,
        longitude: lng,
        speed_kmh: speed,
        heading: heading,
      });
      set({ currentAmbulance: updated });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  setTelemetry: (telemetry: TelemetryData) => set({ activeTelemetry: telemetry }),
  setError: (error: string | null) => set({ error }),
}));
