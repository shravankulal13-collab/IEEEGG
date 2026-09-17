// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Map Viewport & Layer Visibility Store
// ============================================================

import { create } from 'zustand';

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface MapLayerVisibility {
  traffic: boolean;
  ambulances: boolean;
  incidents: boolean;
  hospitals: boolean;
  signals: boolean;
  routes: boolean;
  alternatives: boolean;
}

export interface SelectedMapEntity {
  type: 'ambulance' | 'incident' | 'hospital' | 'signal' | 'traffic';
  id: string;
  data?: any;
}

interface MapState {
  viewport: MapViewport;
  layers: MapLayerVisibility;
  selectedEntity: SelectedMapEntity | null;
  activeRoutePolyline: [number, number][] | null;
  alternativePolylines: [number, number][][] | null;
  isMapLoaded: boolean;

  setViewport: (center: [number, number], zoom?: number) => void;
  setZoom: (zoom: number) => void;
  toggleLayer: (layer: keyof MapLayerVisibility) => void;
  setLayerVisibility: (layer: keyof MapLayerVisibility, visible: boolean) => void;
  setSelectedEntity: (entity: SelectedMapEntity | null) => void;
  setActiveRoutePolyline: (polyline: [number, number][] | null) => void;
  setAlternativePolylines: (polylines: [number, number][][] | null) => void;
  setMapLoaded: (loaded: boolean) => void;
  resetMap: () => void;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru Central
const DEFAULT_ZOOM = 13;

export const useMapStore = create<MapState>((set) => ({
  viewport: {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  },
  layers: {
    traffic: true,
    ambulances: true,
    incidents: true,
    hospitals: true,
    signals: true,
    routes: true,
    alternatives: false,
  },
  selectedEntity: null,
  activeRoutePolyline: null,
  alternativePolylines: null,
  isMapLoaded: false,

  setViewport: (center: [number, number], zoom?: number) =>
    set((state) => ({
      viewport: {
        center,
        zoom: zoom !== undefined ? zoom : state.viewport.zoom,
      },
    })),

  setZoom: (zoom: number) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom,
      },
    })),

  toggleLayer: (layer: keyof MapLayerVisibility) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),

  setLayerVisibility: (layer: keyof MapLayerVisibility, visible: boolean) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: visible,
      },
    })),

  setSelectedEntity: (entity: SelectedMapEntity | null) => set({ selectedEntity: entity }),

  setActiveRoutePolyline: (polyline: [number, number][] | null) => set({ activeRoutePolyline: polyline }),

  setAlternativePolylines: (polylines: [number, number][][] | null) => set({ alternativePolylines: polylines }),

  setMapLoaded: (loaded: boolean) => set({ isMapLoaded: loaded }),

  resetMap: () =>
    set({
      viewport: { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM },
      selectedEntity: null,
      activeRoutePolyline: null,
      alternativePolylines: null,
    }),
}));
