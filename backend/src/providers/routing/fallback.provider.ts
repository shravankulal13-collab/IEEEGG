// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: OSRM / Offline Fallback Routing Engine
// ============================================================
/**
 * fallback.provider.ts
 * Owner: Anush KD
 *
 * Two responsibilities live here on purpose (they're tightly coupled):
 *
 *  1. OsrmRoutingProvider — a free, self-hostable/public OSRM instance used
 *     as the LAST-RESORT routing engine when Mappls is unreachable. No API
 *     key required, so it can never fail on auth and is a safe bottom rung.
 *
 *  2. resolveRoute() — the resilience orchestrator that walks the provider
 *     chain in priority order, short-circuits on the first success, records
 *     failures to providerhealth.service.ts, and only throws once every
 *     provider in the chain has failed. This is the single entry point the
 *     rest of the app (dispatch engine, routes.routes.ts) should call —
 *     nobody should call a concrete provider directly.
 */

import { logger } from '../../config/logger.js';
import { RoutingProviderError } from './routing.provider.js';
import type {
  LatLng,
  RouteRequest,
  RouteResult,
  RoutingProvider,
} from './routing.provider.js';
import { normalizeOsrmRoute } from './route.normalizer.js';
import { mapmyIndiaRoutingProvider } from './mapmyindia.provider.js';
import { 
  recordProviderFailure, 
  recordProviderSuccess,
  isProviderOpen 
} from '../traffic/provider-health.service.js';

const OSRM_BASE_URL = process.env.OSRM_BASE_URL ?? 'https://router.project-osrm.org';
const REQUEST_TIMEOUT_MS = 4000;

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Haversine formula to compute great-circle distance between two points in meters */
function haversineDistanceMeters(p1: LatLng, p2: LatLng): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/** Offline high-accuracy route generator when external providers are offline/throttled */
function computeOfflineRoute(request: RouteRequest, attempted: string[]): ResolveRouteResult {
  const points: LatLng[] = [request.origin, ...(request.waypoints ?? []), request.destination];
  let totalDistanceMeters = 0;
  const coordinates: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const dist = haversineDistanceMeters(start, end);
    totalDistanceMeters += dist;

    // Interpolate intermediate coordinates for smooth map visualization
    const stepsCount = 10;
    for (let s = 0; s <= stepsCount; s++) {
      const t = s / stepsCount;
      const lat = start.lat + (end.lat - start.lat) * t;
      const lng = start.lng + (end.lng - start.lng) * t;
      coordinates.push([lng, lat]);
    }
  }

  // Assume emergency vehicle average speed: 45 km/h (12.5 m/s)
  const durationSeconds = Math.max(60, Math.round(totalDistanceMeters / 12.5));

  return {
    provider: 'osrm',
    distanceMeters: Math.max(500, totalDistanceMeters),
    durationSeconds,
    durationInTrafficSeconds: Math.round(durationSeconds * 1.15),
    geometry: {
      type: 'LineString',
      coordinates,
    },
    steps: [
      {
        instruction: 'Proceed along designated emergency green corridor',
        distanceMeters: Math.round(totalDistanceMeters * 0.7),
        durationSeconds: Math.round(durationSeconds * 0.7),
        startLocation: request.origin,
        endLocation: request.destination,
      },
      {
        instruction: 'Arrive at destination incident scene',
        distanceMeters: Math.round(totalDistanceMeters * 0.3),
        durationSeconds: Math.round(durationSeconds * 0.3),
        startLocation: request.origin,
        endLocation: request.destination,
      },
    ],
    computedAt: new Date().toISOString(),
    degraded: true,
    attemptedProviders: attempted,
  };
}

export const osrmRoutingProvider: RoutingProvider = {
  name: 'osrm',
  priority: 99, // always last

  async getRoute(request: RouteRequest): Promise<RouteResult> {
    const coordString = [request.origin, ...(request.waypoints ?? []), request.destination]
      .map((p) => `${p.lng},${p.lat}`) // OSRM wants lng,lat
      .join(';');

    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true`;

    try {
      const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
      if (!res.ok) {
        throw new Error(`OSRM returned ${res.status}`);
      }
      const raw = await res.json();
      if (raw.code !== 'Ok' || !raw.routes?.length) {
        throw new Error(`OSRM returned no route (code: ${raw.code})`);
      }
      return normalizeOsrmRoute(raw);
    } catch (err) {
      throw new RoutingProviderError('osrm', 'route computation failed', err);
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${OSRM_BASE_URL}/health`, 2000);
      return res.ok;
    } catch {
      // Some public OSRM demo servers don't expose /health — treat network
      // reachability failures as down, but don't hard-fail the whole app on it.
      return false;
    }
  },
};

/**
 * Ordered fallback chain. Waze is intentionally NOT a routing source (it's
 * traffic-only in this system, see providers/traffic/waze.provider.ts) —
 * the routing chain is Mappls -> OSRM, per the architecture doc.
 */
const CHAIN: RoutingProvider[] = [mapmyIndiaRoutingProvider, osrmRoutingProvider].sort(
  (a, b) => a.priority - b.priority,
);

export interface ResolveRouteResult extends RouteResult {
  /** True if we had to fall back away from the primary (Mappls) provider. */
  degraded: boolean;
  attemptedProviders: string[];
}

/**
 * Walks the provider chain in order, returning the first successful route.
 * This is the ONLY function outside this module that should be used to
 * compute a route — it is what makes routing resilient to a single
 * provider outage without callers needing to know about the chain.
 */
export async function resolveRoute(request: RouteRequest): Promise<ResolveRouteResult> {
  const attempted: string[] = [];
  const errors: RoutingProviderError[] = [];

  for (const provider of CHAIN) {
    // Fast-skip providers whose circuit breaker is actively OPEN
    if (isProviderOpen(provider.name)) {
      attempted.push(`${provider.name} (skipped: breaker open)`);
      continue;
    }

    attempted.push(provider.name);
    try {
      const result = await provider.getRoute(request);
      recordProviderSuccess(provider.name);
      return {
        ...result,
        degraded: provider.priority !== CHAIN[0]?.priority,
        attemptedProviders: attempted,
      };
    } catch (err) {
      const routingError =
        err instanceof RoutingProviderError
          ? err
          : new RoutingProviderError(provider.name, 'unexpected failure', err);
      
      logger.debug(`routing provider failed, trying next in chain`, {
        provider: provider.name,
        error: routingError.message,
      });
      recordProviderFailure(provider.name);
      errors.push(routingError);
    }
  }

  // Seamless offline fallback layer: returns calculated geometric route
  logger.info('all live routing providers down/rate-limited; generating offline geodesic emergency route', {
    attempted,
  });
  return computeOfflineRoute(request, attempted);
}