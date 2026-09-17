// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: TomTom Routing Integration
// ============================================================
/**
 * tomtom.provider.ts compatibility module
 * Owner: Anush KD
 *
 * TomTom routing engine with normalization into our provider-agnostic
 * RouteResult shape and a short request timeout.
 *
 * This is the FIRST provider tried in the fallback chain (priority 0).
 * The filename is retained for compatibility with existing imports.
 */

import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { RoutingProviderError } from './routing.provider.js';
import type {
  LatLng,
  RouteGeometry,
  RouteRequest,
  RouteResult,
  RouteStep,
  RoutingProvider,
} from './routing.provider.js';
import { normalizeMapmyIndiaRoute } from './route.normalizer.js';

const MAPPLS_AUTH_URL = 'https://outpost.mappls.com/api/security/oauth/token';
const MAPPLS_ROUTE_URL = 'https://apis.mappls.com/advancedmaps/v1';
const TOMTOM_ROUTE_URL = 'https://api.tomtom.com/routing/1/calculateRoute';
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
    throw new RoutingProviderError('tomtom', 'failed to acquire OAuth token', err);
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
      logger.warn(`legacy route request failed (status ${res.status}), retrying once`);
      return requestRoute(request, token, attempt + 1);
    }
    return res;
  } catch (err) {
    if (attempt < 2) {
      logger.warn({ err }, 'legacy route request errored, retrying once');
      return requestRoute(request, token, attempt + 1);
    }
    throw err;
  }
}

function normalizeTomTomRoute(raw: any): RouteResult {
  const route = raw?.routes?.[0];
  if (!route) {
    throw new Error('tomtom response contained no routes');
  }

  const points = route.legs?.flatMap((leg: any) => leg.points ?? []) ?? [];
  const geometry: RouteGeometry = {
    type: 'LineString',
    coordinates: points.map((point: any) => [point.longitude, point.latitude] as [number, number]),
  };

  const steps = route.legs?.flatMap((leg: any) => leg.instructions ?? []) ?? [];
  const normalizedSteps: RouteStep[] = steps.map((step: any) => ({
    instruction: step?.message ?? 'Continue',
    distanceMeters: step?.lengthInMeters ?? 0,
    durationSeconds: step?.travelTimeInSeconds ?? 0,
    startLocation: { lng: step?.point?.longitude ?? 0, lat: step?.point?.latitude ?? 0 },
    endLocation: { lng: step?.point?.longitude ?? 0, lat: step?.point?.latitude ?? 0 },
  }));

  return {
    provider: 'tomtom',
    distanceMeters: route.summary?.lengthInMeters ?? 0,
    durationSeconds: route.summary?.travelTimeInSeconds ?? 0,
    geometry,
    steps: normalizedSteps.length ? normalizedSteps : [{
      instruction: 'Continue',
      distanceMeters: route.summary?.lengthInMeters ?? 0,
      durationSeconds: route.summary?.travelTimeInSeconds ?? 0,
      startLocation: { lng: 0, lat: 0 },
      endLocation: { lng: 0, lat: 0 },
    }],
    computedAt: new Date().toISOString(),
  };
}

async function requestTomTomRoute(request: RouteRequest): Promise<RouteResult> {
  if (!env.TOMTOM_API_KEY) {
    throw new RoutingProviderError('tomtom', 'TomTom API key is not configured');
  }

  const coords = [request.origin, ...(request.waypoints ?? []), request.destination]
    .map((point) => `${point.lat},${point.lng}`)
    .join(':');

  const url = new URL(`${TOMTOM_ROUTE_URL}/${coords}/json`);
  url.searchParams.set('key', env.TOMTOM_API_KEY);
  url.searchParams.set('travelMode', 'car');
  url.searchParams.set('routeType', 'fastest');
  url.searchParams.set('computeTravelTimeFor', 'all');

  const res = await fetchWithTimeout(url.toString(), { method: 'GET' }, REQUEST_TIMEOUT_MS);
  if (!res.ok) {
    throw new Error(`tomtom route endpoint returned ${res.status}`);
  }

  const raw = await res.json();
  return normalizeTomTomRoute(raw);
}

export const tomTomRoutingProvider: RoutingProvider = {
  name: 'tomtom',
  priority: 0,

  async getRoute(request: RouteRequest): Promise<RouteResult> {
    try {
      return await requestTomTomRoute(request);
    } catch (err) {
      if (err instanceof RoutingProviderError) throw err;
      throw new RoutingProviderError('tomtom', 'route computation failed', err);
    }
  },

  async healthCheck(): Promise<boolean> {
    return Boolean(env.TOMTOM_API_KEY);
  },
};

/** Compatibility alias for modules that still import the old filename/export. */
export const mapmyIndiaRoutingProvider = tomTomRoutingProvider;