// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Traffic Provider Abstraction Interface
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================
/**
 * traffic.provider.ts (SHARED)
 * Owner: Anush KD
 *
 * Contract every traffic data source implements. traffic.fusion.ts
 * consumes N of these and blends them into one confidence-weighted view —
 * consumers should only ever talk to the fusion layer, never a single
 * traffic source directly (a single source going stale/down should never
 * be visible to the frontend as "no traffic data").
 */

import type { LatLng } from '../routing/routing.provider.js';

export type TrafficProviderName = 'mapmyindia' | 'waze' | 'internal';

export type CongestionLevel = 'free' | 'light' | 'moderate' | 'heavy' | 'severe';

export interface TrafficSegment {
  /** GeoJSON LineString coordinates [lng, lat] describing the affected road segment. */
  coordinates: [number, number][];
  congestion: CongestionLevel;
  /** 0 (free flow) to 1 (gridlock) — normalized so fusion can average across sources. */
  congestionScore: number;
  averageSpeedKph?: number;
  description?: string;
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'closure' | 'hazard' | 'event' | 'other';
  location: LatLng;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  reportedAt: string;
  source: TrafficProviderName;
}

export interface TrafficSnapshot {
  provider: TrafficProviderName;
  segments: TrafficSegment[];
  incidents: TrafficIncident[];
  fetchedAt: string;
  /** How much weight fusion should give this source (0-1). Tuned per-provider. */
  confidence: number;
}

export interface TrafficQuery {
  /** Bounding box: [southWestLat, southWestLng, northEastLat, northEastLng]. */
  bbox: [number, number, number, number];
}

export class TrafficProviderError extends Error {
  constructor(
    public readonly provider: TrafficProviderName,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'TrafficProviderError';
  }
}

export interface TrafficProvider {
  readonly name: TrafficProviderName;
  getTraffic(query: TrafficQuery): Promise<TrafficSnapshot>;
  healthCheck(): Promise<boolean>;
}