// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Map Viewport & Layer Visibility Store
// ============================================================

import { create } from 'zustand';

export type MapFitTarget = 'all' | 'incidents' | 'ambulances' | null;

interface MapState {
  center: [number, number];
  zoom: number;
  showIncidents: boolean;
  showAmbulances: boolean;
  showHospitals: boolean;
  selectedIncidentId: string | null;
  selectedAmbulanceId: string | null;
  fitTrigger: number;
  fitTarget: MapFitTarget;

  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setViewport: (center: [number, number], zoom: number) => void;
  toggleLayer: (layer: 'incidents' | 'ambulances' | 'hospitals') => void;
  setSelectedIncidentId: (id: string | null) => void;
  setSelectedAmbulanceId: (id: string | null) => void;
  triggerFit: (target: MapFitTarget) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [12.9716, 77.5946], // Default Command Center focal coordinates
  zoom: 12,
  showIncidents: true,
  showAmbulances: true,
  showHospitals: true,
  selectedIncidentId: null,
  selectedAmbulanceId: null,
  fitTrigger: 0,
  fitTarget: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setViewport: (center, zoom) => set({ center, zoom }),
  toggleLayer: (layer) =>
    set((state) => {
      if (layer === 'incidents') return { showIncidents: !state.showIncidents };
      if (layer === 'ambulances') return { showAmbulances: !state.showAmbulances };
      if (layer === 'hospitals') return { showHospitals: !state.showHospitals };
      return {};
    }),
  setSelectedIncidentId: (id) =>
    set({ selectedIncidentId: id, selectedAmbulanceId: null }),
  setSelectedAmbulanceId: (id) =>
    set({ selectedAmbulanceId: id, selectedIncidentId: null }),
  triggerFit: (target) =>
    set((state) => ({
      fitTrigger: state.fitTrigger + 1,
      fitTarget: target,
    })),
}));
