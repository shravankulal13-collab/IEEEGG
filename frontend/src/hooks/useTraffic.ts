// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Live Traffic Events & Layers Hook
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  trafficService,
  type TrafficSegment,
  type TrafficIncident,
} from '../services/traffic.service';

const DEFAULT_BBOX: [number, number, number, number] = [12.85, 77.50, 13.08, 77.75]; // Bengaluru Metro Bounding Box

export function useTraffic(
  bbox: [number, number, number, number] = DEFAULT_BBOX,
  pollIntervalMs: number = 30000
) {
  const [segments, setSegments] = useState<TrafficSegment[]>([]);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  const fetchTrafficData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [flowRes, incidentsRes] = await Promise.all([
        trafficService.getTrafficFlow(bbox),
        trafficService.getTrafficIncidents(bbox),
      ]);

      setSegments(flowRes.segments || []);
      setIncidents(incidentsRes.incidents || []);
      setSourcesUsed(flowRes.sourcesUsed || []);
      setLastUpdated(flowRes.fusedAt || new Date().toISOString());
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch traffic conditions');
      setIsLoading(false);
    }
  }, [bbox[0], bbox[1], bbox[2], bbox[3]]);

  useEffect(() => {
    fetchTrafficData();

    if (pollIntervalMs > 0) {
      timerRef.current = setInterval(fetchTrafficData, pollIntervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchTrafficData, pollIntervalMs]);

  return {
    segments,
    incidents,
    sourcesUsed,
    lastUpdated,
    isLoading,
    error,
    refreshTraffic: fetchTrafficData,
  };
}
