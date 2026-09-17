// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Route Calculation & Optimization Hook
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import {
  routeService,
  type CalculatedRoute,
  type RouteRequest,
  type ProviderHealthStatus,
  type LatLng,
} from '../services/route.service';

export function useRoute(initialOrigin?: LatLng, initialDestination?: LatLng) {
  const [activeRoute, setActiveRoute] = useState<CalculatedRoute | null>(null);
  const [providerHealth, setProviderHealth] = useState<ProviderHealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async (request: RouteRequest): Promise<CalculatedRoute> => {
    setIsLoading(true);
    setError(null);
    try {
      const route = await routeService.computeRoute(request);
      setActiveRoute(route);
      setIsLoading(false);
      return route;
    } catch (err: any) {
      setError(err.message || 'Route calculation failed');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const health = await routeService.getProviderHealth();
      setProviderHealth(health);
    } catch {
      // Ignore health poll errors
    }
  }, []);

  useEffect(() => {
    if (initialOrigin && initialDestination) {
      calculateRoute({ origin: initialOrigin, destination: initialDestination, profile: 'emergency' });
    }
    fetchHealth();
  }, [initialOrigin?.lat, initialOrigin?.lng, initialDestination?.lat, initialDestination?.lng, calculateRoute, fetchHealth]);

  return {
    activeRoute,
    providerHealth,
    isLoading,
    error,
    calculateRoute,
    refreshProviderHealth: fetchHealth,
    clearRoute: () => setActiveRoute(null),
  };
}
