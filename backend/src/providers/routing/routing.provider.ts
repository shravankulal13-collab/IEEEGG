// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Routing Provider Abstraction Interface
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================
/**
 * routing.provider.ts (SHARED)
 * Owner: Anush KD — Routing + Traffic + Resilience Engineer
 *
 * Provider-agnostic contract that every routing engine (Mappls, Waze, OSRM)
 * must satisfy. Nothing in the rest of the codebase should import a concrete
 * provider directly — always depend on this interface so providers can be
 * swapped, mocked in tests, or reordered in the fallback chain without
 * touching consumers (dispatch engine, ETA service, frontend route layers).
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** A single leg/step of a route, kept intentionally provider-agnostic. */
export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  startLocation: LatLng;
  endLocation: LatLng;
}

/**
 * GeoJSON LineString geometry — chosen because it maps 1:1 onto PostGIS
 * geography columns (ST_GeomFromGeoJSON) that SK's schema uses, and is
 * natively consumable by the frontend map layers without transformation.
 */
export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][]; // [lng, lat] pairs — GeoJSON order
}

export interface RouteResult {
  provider: RoutingProviderName;
  distanceMeters: number;
  durationSeconds: number;
  /** Duration adjusted for current traffic conditions, when the provider supports it. */
  durationInTrafficSeconds?: number;
  geometry: RouteGeometry;
  steps: RouteStep[];
  /** Raw provider polyline/response id, kept for debugging & audit logs. */
  providerRouteId?: string;
  computedAt: string; // ISO timestamp
}

export type RoutingProviderName = 'mapmyindia' | 'waze' | 'osrm';

export interface RouteRequest {
  origin: LatLng;
  destination: LatLng;
  /** Optional intermediate stops (e.g. hospital -> incident -> hospital). */
  waypoints?: LatLng[];
  /** Ambulances should generally avoid tolls/highways only if configured. */
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  /** Emergency profile hints faster/priority routing where the provider supports it. */
  profile?: 'driving' | 'emergency';
}

export class RoutingProviderError extends Error {
  constructor(
    public readonly provider: RoutingProviderName,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'RoutingProviderError';
  }
}

export interface RoutingProvider {
  readonly name: RoutingProviderName;
  /** Priority in the fallback chain — lower runs first. */
  readonly priority: number;
  getRoute(request: RouteRequest): Promise<RouteResult>;
  /** Cheap liveness probe used by providerhealth.service.ts — must not throw. */
  healthCheck(): Promise<boolean>;
}