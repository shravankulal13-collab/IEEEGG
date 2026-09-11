// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: MapmyIndia Live Traffic Provider
// ============================================================
/**
 * mapmyindia.traffic.ts
 * Owner: Anush KD
 *
 * Fetches live congestion tiles/segments from Mappls' Traffic API for a
 * bounding box. Highest confidence weight in fusion since it's India-tuned
 * and shares auth infrastructure with our primary routing engine.
 */

import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { TrafficProviderError } from './traffic.provider.js';
import type {
  CongestionLevel,
  TrafficProvider,
  TrafficQuery,
  TrafficSegment,
  TrafficSnapshot,
} from './traffic.provider.js';

const MAPPLS_TRAFFIC_URL = 'https://apis.mappls.com/advancedmaps/v1';
const REQUEST_TIMEOUT_MS = 3500;

// Mappls reports congestion as 0 (clear) - 4 (jam). Map to our normalized scale.
const CONGESTION_MAP: Record<number, { level: CongestionLevel; score: number }> = {
  0: { level: 'free', score: 0.0 },
  1: { level: 'light', score: 0.25 },
  2: { level: 'moderate', score: 0.5 },
  3: { level: 'heavy', score: 0.75 },
  4: { level: 'severe', score: 1.0 },
};

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface MapplsTrafficFlow {
  coordinates: [number, number][];
  congestion_level: number; // 0-4
  average_speed?: number;
  road_name?: string;
}

export const mapmyIndiaTrafficProvider: TrafficProvider = {
  name: 'mapmyindia',

  async getTraffic(query: TrafficQuery): Promise<TrafficSnapshot> {
    const [swLat, swLng, neLat, neLng] = query.bbox;
    const url = `${MAPPLS_TRAFFIC_URL}/traffic/flow?bbox=${swLng},${swLat},${neLng},${neLat}&key=${env.MAPPLS_API_KEY}`;

    try {
      const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
      if (!res.ok) {
        throw new Error(`Mappls traffic API returned ${res.status}`);
      }

      const raw = (await res.json()) as { flows: MapplsTrafficFlow[] };

      const segments: TrafficSegment[] = (raw.flows ?? []).map((flow) => {
        const congestion = CONGESTION_MAP[flow.congestion_level] ?? CONGESTION_MAP[0]!;
        const segment: TrafficSegment = {
          coordinates: flow.coordinates,
          congestion: congestion.level,
          congestionScore: congestion.score,
        };

        if (flow.average_speed !== undefined) segment.averageSpeedKph = flow.average_speed;
        if (flow.road_name !== undefined) segment.description = flow.road_name;
        return segment;
      });

      return {
        provider: 'mapmyindia',
        segments,
        incidents: [], // Mappls incident feed handled separately if enabled on the account
        fetchedAt: new Date().toISOString(),
        confidence: 0.8,
      };
    } catch (err) {
      logger.warn('mapmyindia traffic fetch failed', { err });
      throw new TrafficProviderError('mapmyindia', 'failed to fetch traffic flow', err);
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(
        `${MAPPLS_TRAFFIC_URL}/traffic/flow?bbox=0,0,0.01,0.01&key=${env.MAPPLS_API_KEY}`,
        2000,
      );
      return res.status !== 401 && res.status !== 403;
    } catch {
      return false;
    }
  },
};