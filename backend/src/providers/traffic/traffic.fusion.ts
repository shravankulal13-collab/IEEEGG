// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Traffic Multi-Source Fusion Engine
// ============================================================
/**
 * traffic.fusion.ts
 * Owner: Anush KD
 *
 * The single entry point the rest of the app (traffic.routes.ts, the
 * rerouting logic in routeMonitoring.job.ts, Shreevarsha's route.scorer)
 * should call for traffic data. Fetches from every registered
 * TrafficProvider IN PARALLEL, tolerates individual failures, and blends
 * whatever succeeded into one confidence-weighted snapshot.
 *
 * Fusion strategy:
 *  - Segments: grouped by rounded coordinate anchor, congestion score
 *    averaged weighted by each source's `confidence`.
 *  - Incidents: unioned and de-duplicated by proximity (~80m) + type, since
 *    the same accident is often reported by both Waze and Mappls.
 */

import { logger } from '../../config/logger.js';
import { mapmyIndiaTrafficProvider } from './mapmyindia.traffic.js';
import { wazeTrafficProvider } from './waze.provider.js';
import { internalTrafficProvider } from './internal.traffic.js';
import type {
  CongestionLevel,
  TrafficIncident,
  TrafficProvider,
  TrafficQuery,
  TrafficSegment,
  TrafficSnapshot,
} from './traffic.provider.js';
import { recordProviderFailure, recordProviderSuccess, isProviderOpen } from './provider-health.service.js';

const PROVIDERS: TrafficProvider[] = [mapmyIndiaTrafficProvider, wazeTrafficProvider, internalTrafficProvider];

const INCIDENT_DEDUPE_METERS = 80;

export interface FusedTrafficView {
  segments: TrafficSegment[];
  incidents: TrafficIncident[];
  sourcesUsed: string[];
  sourcesFailed: string[];
  fusedAt: string;
}

function haversineMeters(a: [number, number], b: { lat: number; lng: number }): number {
  const R = 6371000;
  const [lng1, lat1] = a;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - lat1);
  const dLng = toRad(b.lng - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function levelFromScore(score: number): CongestionLevel {
  if (score < 0.15) return 'free';
  if (score < 0.4) return 'light';
  if (score < 0.6) return 'moderate';
  if (score < 0.8) return 'heavy';
  return 'severe';
}

function fuseSegments(snapshots: TrafficSnapshot[]): TrafficSegment[] {
  // Anchor key = rounded midpoint of the segment's first coordinate. Cheap
  // and good enough at city scale; swap for a proper spatial grid/PostGIS
  // ST_SnapToGrid join if precision becomes an issue post-hackathon.
  const buckets = new Map<
    string,
    { weightedScoreSum: number; weightTotal: number; coordinates: [number, number][]; speeds: number[] }
  >();

  for (const snap of snapshots) {
    for (const seg of snap.segments) {
      const anchor = seg.coordinates[0] ?? [0, 0];
      const key = `${anchor[0].toFixed(3)}:${anchor[1].toFixed(3)}`;
      const bucket = buckets.get(key) ?? {
        weightedScoreSum: 0,
        weightTotal: 0,
        coordinates: seg.coordinates,
        speeds: [],
      };
      bucket.weightedScoreSum += seg.congestionScore * snap.confidence;
      bucket.weightTotal += snap.confidence;
      if (seg.averageSpeedKph) bucket.speeds.push(seg.averageSpeedKph);
      buckets.set(key, bucket);
    }
  }

  return Array.from(buckets.values())
    .filter((b) => b.weightTotal > 0)
    .map((b) => {
      const score = b.weightedScoreSum / b.weightTotal;
      return {
        coordinates: b.coordinates,
        congestion: levelFromScore(score),
        congestionScore: Number(score.toFixed(3)),
        ...(b.speeds.length
          ? { averageSpeedKph: Number((b.speeds.reduce((a, c) => a + c, 0) / b.speeds.length).toFixed(1)) }
          : {}),
      };
    });
}

function dedupeIncidents(snapshots: TrafficSnapshot[]): TrafficIncident[] {
  const all = snapshots.flatMap((s) => s.incidents);
  const kept: TrafficIncident[] = [];

  for (const incident of all) {
    const duplicate = kept.find(
      (existing) =>
        existing.type === incident.type &&
        haversineMeters(
          [incident.location.lng, incident.location.lat],
          existing.location,
        ) < INCIDENT_DEDUPE_METERS,
    );
    if (!duplicate) {
      kept.push(incident);
    } else if (incident.severity === 'major' && duplicate.severity !== 'major') {
      // Prefer the more severe report of a duplicate.
      kept[kept.indexOf(duplicate)] = incident;
    }
  }

  return kept;
}

/**
 * Fetches and blends traffic from every healthy provider. Providers whose
 * circuit breaker is currently OPEN (see providerhealth.service.ts) are
 * skipped entirely rather than being retried on every request.
 */
export async function getFusedTraffic(query: TrafficQuery): Promise<FusedTrafficView> {
  const eligible = PROVIDERS.filter((p) => !isProviderOpen(p.name));

  const settled = await Promise.allSettled(eligible.map((p) => p.getTraffic(query)));

  const snapshots: TrafficSnapshot[] = [];
  const sourcesUsed: string[] = [];
  const sourcesFailed: string[] = [];

  settled.forEach((result, i) => {
    const provider = eligible[i];
    if (!provider) return;
    if (result.status === 'fulfilled') {
      snapshots.push(result.value);
      sourcesUsed.push(provider.name);
      recordProviderSuccess(provider.name);
    } else {
      logger.warn('traffic provider failed during fusion', {
        provider: provider.name,
        reason: result.reason?.message,
      });
      sourcesFailed.push(provider.name);
      recordProviderFailure(provider.name);
    }
  });

  if (snapshots.length === 0) {
    logger.error('all traffic providers failed or open — returning empty fused view');
  }

  return {
    segments: fuseSegments(snapshots),
    incidents: dedupeIncidents(snapshots),
    sourcesUsed,
    sourcesFailed: [...sourcesFailed, ...PROVIDERS.filter((p) => isProviderOpen(p.name)).map((p) => p.name)],
    fusedAt: new Date().toISOString(),
  };
}
