// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Route Calculation API Client
// ============================================================

import { apiRequest } from './api';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteRequest {
  origin: LatLng;
  destination: LatLng;
  waypoints?: LatLng[];
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  profile?: 'driving' | 'emergency';
}

export interface RouteStep {
  instruction: string;
  distance_meters: number;
  duration_seconds: number;
  maneuver?: string;
  name?: string;
}

export interface SignalPreemptionNode {
  signal_id: string;
  junction_name: string;
  latitude: number;
  longitude: number;
  current_phase: 'GREEN' | 'YELLOW' | 'RED';
  preemption_status: 'ARMED' | 'ACTIVE' | 'STANDBY';
  distance_to_signal_meters: number;
  time_to_green_seconds: number;
}

export interface CalculatedRoute {
  provider: 'tomtom' | 'osrm' | 'waze' | 'fallback_straight';
  distance_meters: number;
  duration_seconds: number;
  formatted_distance: string;
  formatted_duration: string;
  geometry: [number, number][]; // [lat, lng] tuples
  steps: RouteStep[];
  signals: SignalPreemptionNode[];
  congestion_level: 'LOW' | 'MODERATE' | 'HEAVY' | 'SEVERE';
  time_saved_minutes?: number;
}

export interface ProviderHealthStatus {
  provider: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  consecutiveFailures: number;
  lastFailureTime?: string;
  avgLatencyMs: number;
}

export class RouteService {
  async computeRoute(request: RouteRequest): Promise<CalculatedRoute> {
    const res = await apiRequest<{ data: any }>('/routes/compute', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    const raw = res.data;
    const geometry: [number, number][] = raw.geometry?.coordinates?.map(
      ([lng, lat]: [number, number]) => [lat, lng],
    ) || raw.geometry || [
      [request.origin.lat, request.origin.lng],
      [request.destination.lat, request.destination.lng],
    ];
    const dist = raw.distanceMeters ?? raw.distance_meters ?? raw.distance ?? 0;
    const dur = raw.durationSeconds ?? raw.duration_seconds ?? raw.duration ?? 0;

    return {
      provider: raw.provider || 'tomtom',
      distance_meters: dist,
      duration_seconds: dur,
      formatted_distance: `${(dist / 1000).toFixed(1)} km`,
      formatted_duration: `${Math.ceil(dur / 60)} min`,
      geometry,
      steps: raw.steps || [],
      signals: raw.signals || [],
      congestion_level: raw.congestion_level || 'LOW',
      time_saved_minutes: raw.time_saved_minutes || 0,
    };
  }

  async getProviderHealth(): Promise<ProviderHealthStatus[]> {
    const res = await apiRequest<{ data: ProviderHealthStatus[] }>('/routes/health');
    return res.data || [];
  }
}

export const routeService = new RouteService();
