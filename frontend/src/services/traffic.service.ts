// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Traffic Intelligence API Client
// ============================================================

import { apiRequest } from './api';

export interface TrafficSegment {
  id: string;
  roadName: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  congestionLevel: 'FREE' | 'MODERATE' | 'HEAVY' | 'BLOCKED';
  currentSpeedKmh: number;
  freeFlowSpeedKmh: number;
  delaySeconds: number;
}

export interface TrafficIncident {
  id: string;
  type: 'ACCIDENT' | 'CONSTRUCTION' | 'CONGESTION' | 'ROAD_CLOSURE' | 'WATERLOGGING';
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR';
  description: string;
  roadName: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  estimatedClearanceMinutes: number;
  impactRadiusMeters: number;
}

export interface TrafficFlowResponse {
  segments: TrafficSegment[];
  sourcesUsed: string[];
  sourcesFailed: string[];
  fusedAt: string;
}

export interface TrafficIncidentsResponse {
  incidents: TrafficIncident[];
  sourcesUsed: string[];
  sourcesFailed: string[];
  fusedAt: string;
}

export class TrafficService {
  async getTrafficFlow(bbox: [number, number, number, number]): Promise<TrafficFlowResponse> {
    const [swLat, swLng, neLat, neLng] = bbox;
    const res = await apiRequest<{ data: TrafficFlowResponse }>(
      `/traffic/flow?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`
    );
    return res.data || { segments: [], sourcesUsed: [], sourcesFailed: [], fusedAt: new Date().toISOString() };
  }

  async getTrafficIncidents(bbox: [number, number, number, number]): Promise<TrafficIncidentsResponse> {
    const [swLat, swLng, neLat, neLng] = bbox;
    const res = await apiRequest<{ data: TrafficIncidentsResponse }>(
      `/traffic/incidents?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`
    );
    return res.data || { incidents: [], sourcesUsed: [], sourcesFailed: [], fusedAt: new Date().toISOString() };
  }
}

export const trafficService = new TrafficService();
