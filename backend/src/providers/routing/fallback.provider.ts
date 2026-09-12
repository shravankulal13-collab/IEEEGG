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
  RouteRequest,
  RouteResult,
  RoutingProvider,
} from './routing.provider.js';
import { normalizeOsrmRoute } from './route.normalizer.js';
import { mapmyIndiaRoutingProvider } from './mapmyindia.provider.js';
import { recordProviderFailure, recordProviderSuccess } from '../traffic/provider-health.service.js';

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
      logger.error({
        provider: provider.name,
        error: routingError.message,
      }, `routing provider failed, trying next in chain`);
      recordProviderFailure(provider.name);
      errors.push(routingError);
    }
  }

  throw new RoutingProviderError(
    'osrm',
    `all routing providers exhausted (${attempted.join(' -> ')}): ${errors
      .map((e) => e.message)
      .join(' | ')}`,
  );
}