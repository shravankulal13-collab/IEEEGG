// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Multi-Provider Route Normalizer
// ============================================================
/**
 * route.normalizer.ts
 * Owner: Anush KD
 *
 * Every routing provider returns a structurally different JSON payload.
 * This module is the ONLY place that shape-shifts a raw provider response
 * into our shared RouteResult contract — keeping the routing adapter and
 * fallback.provider.ts thin, and giving us one place to fix parsing bugs.
 */

import type { RouteGeometry, RouteResult, RouteStep } from './routing.provider.js';

// ---------------------------------------------------------------------------
// Legacy route_eta response shape
// ---------------------------------------------------------------------------

interface MapplsLeg {
  steps: {
    maneuver: { instruction?: string };
    distance: number;
    duration: number;
    intersections?: { location: [number, number] }[];
  }[];
}

interface MapplsRoute {
  distance: number;
  duration: number;
  duration_in_traffic?: number;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  legs: MapplsLeg[];
}

interface MapplsResponse {
  routes: MapplsRoute[];
}

export function normalizeMapmyIndiaRoute(raw: MapplsResponse): RouteResult {
  const route = raw.routes?.[0];
  if (!route) {
    throw new Error('legacy route response contained no routes');
  }

  const steps: RouteStep[] = route.legs.flatMap((leg) =>
    leg.steps.map((step) => {
      const start = step.intersections?.[0]?.location ?? [0, 0];
      const end = step.intersections?.[step.intersections.length - 1]?.location ?? start;
      return {
        instruction: step.maneuver.instruction ?? 'Continue',
        distanceMeters: step.distance,
        durationSeconds: step.duration,
        startLocation: { lng: start[0], lat: start[1] },
        endLocation: { lng: end[0], lat: end[1] },
      };
    }),
  );

  const geometry: RouteGeometry = {
    type: 'LineString',
    coordinates: route.geometry.coordinates,
  };

  const result: RouteResult = {
    provider: 'tomtom',
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry,
    steps,
    computedAt: new Date().toISOString(),
  };

  if (route.duration_in_traffic !== undefined) {
    result.durationInTrafficSeconds = route.duration_in_traffic;
  }

  return result;
}

// ---------------------------------------------------------------------------
// OSRM /route/v1 response
// ---------------------------------------------------------------------------

interface OsrmStep {
  maneuver: { instruction?: string; type: string; modifier?: string };
  distance: number;
  duration: number;
  geometry?: { coordinates: [number, number][] };
}

interface OsrmLeg {
  steps: OsrmStep[];
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  legs: OsrmLeg[];
}

interface OsrmResponse {
  code: string;
  routes: OsrmRoute[];
}

function osrmInstruction(maneuver: OsrmStep['maneuver']): string {
  if (maneuver.instruction) return maneuver.instruction;
  const parts = [maneuver.type, maneuver.modifier].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Continue';
}

export function normalizeOsrmRoute(raw: OsrmResponse): RouteResult {
  const route = raw.routes?.[0];
  if (!route) {
    throw new Error('OSRM response contained no routes');
  }

  const steps: RouteStep[] = route.legs.flatMap((leg) =>
    leg.steps.map((step) => {
      const coords = step.geometry?.coordinates ?? [[0, 0]];
      const [startLng, startLat] = coords[0] ?? [0, 0];
      const [endLng, endLat] = coords[coords.length - 1] ?? [startLng, startLat];
      return {
        instruction: osrmInstruction(step.maneuver),
        distanceMeters: step.distance,
        durationSeconds: step.duration,
        startLocation: { lng: startLng, lat: startLat },
        endLocation: { lng: endLng, lat: endLat },
      };
    }),
  );

  return {
    provider: 'osrm',
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: { type: 'LineString', coordinates: route.geometry.coordinates },
    steps,
    computedAt: new Date().toISOString(),
  };
}