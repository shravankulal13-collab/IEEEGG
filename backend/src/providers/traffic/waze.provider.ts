// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Waze Traffic & Routing Integration
// ============================================================
/**
 * waze.provider.ts
 * Owner: Anush KD
 *
 * Waze is used purely as a TRAFFIC/incident source in this system (not a
 * routing engine — see fallback.provider.ts for why). It's strongest for
 * crowd-sourced incident reports (accidents, hazards, closures) which
 * Mappls' flow API doesn't surface as richly.
 *
 * Waze's "unofficial" feed (Georss/CIT format used by many traffic
 * dashboards) is what we integrate against here; swap WAZE_FEED_URL for an
 * official Waze for Cities partner feed if/when the team gets access.
 */

import { logger } from '../../config/logger.js';
import { TrafficProviderError } from './traffic.provider.js';
import type {
  TrafficIncident,
  TrafficProvider,
  TrafficQuery,
  TrafficSnapshot,
} from './traffic.provider.js';

const WAZE_FEED_URL =
  process.env.WAZE_FEED_URL ?? 'https://www.waze.com/live-map/api/georss';
const REQUEST_TIMEOUT_MS = 3500;

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'ERICS-Ambulance-Dispatch/1.0' } });
  } finally {
    clearTimeout(timer);
  }
}

interface WazeAlert {
  uuid: string;
  type: string; // ACCIDENT, HAZARD, JAM, ROAD_CLOSED, ...
  subtype?: string;
  location: { x: number; y: number }; // x=lng, y=lat
  reportDescription?: string;
  pubMillis: number;
}

interface WazeJam {
  line: { x: number; y: number }[];
  level: number; // 0-5, 5 = blocked
  speedKMH?: number;
}

function mapWazeTypeToIncidentType(type: string): TrafficIncident['type'] {
  switch (type) {
    case 'ACCIDENT':
      return 'accident';
    case 'ROAD_CLOSED':
      return 'closure';
    case 'CONSTRUCTION':
      return 'construction';
    case 'HAZARD':
      return 'hazard';
    default:
      return 'other';
  }
}

function mapWazeSeverity(level: number | undefined): TrafficIncident['severity'] {
  if (level === undefined) return 'minor';
  if (level >= 4) return 'major';
  if (level >= 2) return 'moderate';
  return 'minor';
}

export const wazeTrafficProvider: TrafficProvider = {
  name: 'waze',

  async getTraffic(query: TrafficQuery): Promise<TrafficSnapshot> {
    const [swLat, swLng, neLat, neLng] = query.bbox;
    const url = `${WAZE_FEED_URL}?top=${neLat}&bottom=${swLat}&left=${swLng}&right=${neLng}&env=row&types=alerts,traffic`;

    try {
      const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
      if (!res.ok) {
        throw new Error(`Waze feed returned ${res.status}`);
      }

      const raw = (await res.json()) as { alerts?: WazeAlert[]; jams?: WazeJam[] };

      const incidents: TrafficIncident[] = (raw.alerts ?? []).map((alert) => ({
        id: alert.uuid,
        type: mapWazeTypeToIncidentType(alert.type),
        location: { lat: alert.location.y, lng: alert.location.x },
        severity: mapWazeSeverity(undefined),
        description: alert.reportDescription ?? `${alert.type}${alert.subtype ? ` (${alert.subtype})` : ''}`,
        reportedAt: new Date(alert.pubMillis).toISOString(),
        source: 'waze',
      }));

      const segments = (raw.jams ?? []).map((jam) => {
        const segment = {
          coordinates: jam.line.map((p) => [p.x, p.y] as [number, number]),
          congestion: jam.level >= 4 ? ('severe' as const) : jam.level >= 2 ? ('heavy' as const) : ('moderate' as const),
          congestionScore: Math.min(jam.level / 5, 1),
        };
        return jam.speedKMH === undefined ? segment : { ...segment, averageSpeedKph: jam.speedKMH };
      });

      return {
        provider: 'waze',
        segments,
        incidents,
        fetchedAt: new Date().toISOString(),
        confidence: 0.65,
      };
    } catch (err) {
      logger.warn('waze traffic fetch failed', { err });
      throw new TrafficProviderError('waze', 'failed to fetch traffic feed', err);
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${WAZE_FEED_URL}?top=0.1&bottom=0&left=0&right=0.1&env=row`, 2000);
      return res.ok;
    } catch {
      return false;
    }
  },
};