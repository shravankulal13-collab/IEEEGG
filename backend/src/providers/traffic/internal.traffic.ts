// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Internal Traffic Condition Simulator
// ============================================================
/**
 * internal.traffic.ts
 * Owner: Anush KD
 *
 * This is our resilience backstop: it derives a rough congestion signal
 * from our OWN ambulance fleet's live GPS telemetry (ingested by
 * Saishree's tracking.service.ts / gps.validator.ts into
 * `ambulance_location_history`)
 * rather than any third-party API. It has no external dependency and
 * therefore cannot go down when Mappls or Waze do — traffic.fusion.ts
 * always has at least this source to fall back on.
 *
 * Heuristic: bucket recent pings into ~250m grid cells, compare each
 * vehicle's instantaneous speed against the road-class expected speed, and
 * derive a congestion score from how far below expected speed the fleet is
 * moving. Low sample counts are down-weighted via `confidence`.
 */

import { query as dbQuery } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import type { CongestionLevel, TrafficProvider, TrafficQuery, TrafficSegment, TrafficSnapshot } from './traffic.provider.js';

const EXPECTED_URBAN_SPEED_KPH = 35;
const LOOKBACK_MINUTES = 10;
const MIN_SAMPLES_FOR_CONFIDENCE = 5;

interface PingRow {
  grid_lat: number;
  grid_lng: number;
  avg_speed_kph: number;
  sample_count: number;
  path: [number, number][];
}

function scoreFromSpeedRatio(ratio: number): { level: CongestionLevel; score: number } {
  if (ratio >= 0.85) return { level: 'free', score: 0.05 };
  if (ratio >= 0.65) return { level: 'light', score: 0.3 };
  if (ratio >= 0.45) return { level: 'moderate', score: 0.55 };
  if (ratio >= 0.25) return { level: 'heavy', score: 0.8 };
  return { level: 'severe', score: 1.0 };
}

export const internalTrafficProvider: TrafficProvider = {
  name: 'internal',

  async getTraffic(query: TrafficQuery): Promise<TrafficSnapshot> {
    const [swLat, swLng, neLat, neLng] = query.bbox;

    try {
      // Buckets fleet pings from the last LOOKBACK_MINUTES into coarse grid
      // cells and computes average speed per cell from the shared location history.
      const rows = await dbQuery<PingRow>(
        `
        SELECT
          round(latitude::numeric, 3) AS grid_lat,
          round(longitude::numeric, 3) AS grid_lng,
          avg(speed_kmh) AS avg_speed_kph,
          count(*) AS sample_count,
          array_agg(ARRAY[longitude, latitude] ORDER BY recorded_at) AS path
        FROM ambulance_location_history
        WHERE recorded_at > now() - interval '${LOOKBACK_MINUTES} minutes'
          AND latitude BETWEEN $1 AND $2
          AND longitude BETWEEN $3 AND $4
          AND speed_kmh IS NOT NULL
        GROUP BY grid_lat, grid_lng
        `,
        [swLat, neLat, swLng, neLng],
      );

      const segments: TrafficSegment[] = rows.map((row) => {
        const ratio = Math.min(row.avg_speed_kph / EXPECTED_URBAN_SPEED_KPH, 1.2);
        const { level, score } = scoreFromSpeedRatio(ratio);
        return {
          coordinates: row.path,
          congestion: level,
          congestionScore: score,
          averageSpeedKph: row.avg_speed_kph,
          description: `derived from ${row.sample_count} fleet ping(s)`,
        };
      });

      const totalSamples = rows.reduce((sum, r) => sum + Number(r.sample_count), 0);
      // Confidence scales with fleet sample density — sparse fleet coverage
      // means this source shouldn't dominate the fused view.
      const confidence = Math.min(0.15 + totalSamples / (MIN_SAMPLES_FOR_CONFIDENCE * 10), 0.5);

      return {
        provider: 'internal',
        segments,
        incidents: [],
        fetchedAt: new Date().toISOString(),
        confidence,
      };
    } catch (err) {
      logger.error('internal traffic derivation failed', { err });
      // Unlike external providers, we do NOT throw here — this source
      // backstops the others, so on failure we return an empty-but-valid
      // snapshot instead of contributing to a full fusion outage.
      return {
        provider: 'internal',
        segments: [],
        incidents: [],
        fetchedAt: new Date().toISOString(),
        confidence: 0,
      };
    }
  },

  async healthCheck(): Promise<boolean> {
    // Always "healthy" — it degrades gracefully to zero-confidence rather
    // than failing, so it should never be excluded from the fusion chain.
    return true;
  },
};