// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: MapmyIndia / Mappls Routing Integration
// ============================================================
/**
 * mapmyindia.provider.ts
 * Owner: Anush KD
 *
 * Primary routing engine. Wraps Mappls' Route ETA / Route API with:
 *  - OAuth2 client-credentials token caching (Mappls tokens expire hourly)
 *  - timeout + single internal retry on transient network failure
 *  - normalization into our provider-agnostic RouteResult shape
 *
 * This is the FIRST provider tried in the fallback chain (priority 0).
 * If it throws RoutingProviderError, fallback.provider.ts moves to Waze,
 * then OSRM.
 */

import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { RoutingProviderError } from './routing.provider.js';
import type {
  LatLng,
  RouteRequest,
  RouteResult,
  RoutingProvider,
} from './routing.provider.js';
import { normalizeMapmyIndiaRoute } from './route.normalizer.js';

const MAPPLS_AUTH_URL = 'https://outpost.mappls.com/api/security/oauth/token';
const MAPPLS_ROUTE_URL = 'https://apis.mappls.com/advancedmaps/v1';
const REQUEST_TIMEOUT_MS = 4000;

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

let tokenCache: CachedToken | null = null;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5000) {
    return tokenCache.token;
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.MAPPLS_CLIENT_ID,
      client_secret: env.MAPPLS_API_KEY,
    });

    const res = await fetchWithTimeout(
      MAPPLS_AUTH_URL,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body },
      REQUEST_TIMEOUT_MS,
    );

    if (!res.ok) {
      throw new Error(`token endpoint returned ${res.status}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return tokenCache.token;
  } catch (err) {
    throw new RoutingProviderError('mapmyindia', 'failed to acquire OAuth token', err);
  }
}

function toLatLngPair(p: LatLng): string {
  return `${p.lat},${p.lng}`;
}

async function requestRoute(request: RouteRequest, token: string, attempt = 1): Promise<Response> {
  const coords = [request.origin, ...(request.waypoints ?? []), request.destination]
    .map(toLatLngPair)
    .join(';');

  const params = new URLSearchParams({
    geometries: 'geojson',
    steps: 'true',
    overview: 'full',
  });
  if (request.avoidTolls) params.set('avoid', 'toll');
  if (request.avoidHighways) params.set('avoid', request.avoidTolls ? 'toll,highway' : 'highway');

  const url = `${MAPPLS_ROUTE_URL}/${token}/route_eta/driving/${coords}?${params.toString()}`;

  try {
    const res = await fetchWithTimeout(url, { method: 'GET' }, REQUEST_TIMEOUT_MS);
    if (!res.ok && attempt < 2) {
      logger.warn(`mapmyindia route request failed (status ${res.status}), retrying once`);
      return requestRoute(request, token, attempt + 1);
    }
    return res;
  } catch (err) {
    if (attempt < 2) {
      logger.warn({ err }, 'mapmyindia route request errored, retrying once');
      return requestRoute(request, token, attempt + 1);
    }
    throw err;
  }
}

export const mapmyIndiaRoutingProvider: RoutingProvider = {
  name: 'mapmyindia',
  priority: 0,

  async getRoute(request: RouteRequest): Promise<RouteResult> {
    try {
      const token = await getAccessToken();
      const res = await requestRoute(request, token);

      if (!res.ok) {
        throw new Error(`route_eta endpoint returned ${res.status}`);
      }

      const raw = (await res.json()) as Partial<{ routes?: Array<{ distance: number }> }>;
      return normalizeMapmyIndiaRoute(raw as Parameters<typeof normalizeMapmyIndiaRoute>[0]);
    } catch (err) {
      if (err instanceof RoutingProviderError) throw err;
      throw new RoutingProviderError('mapmyindia', 'route computation failed', err);
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      await getAccessToken();
      return true;
    } catch {
      return false;
    }
  },
};