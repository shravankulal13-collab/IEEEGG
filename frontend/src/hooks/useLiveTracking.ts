// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Multi-Entity Live Tracking Stream Hook
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { ambulanceService, type TelemetryData } from '../services/ambulance.service';
import { socketService } from '../services/socket';

export interface LiveTrackingParams {
  ambulanceId?: string;
  incidentId?: string;
  targetLat?: number;
  targetLng?: number;
  pollIntervalMs?: number;
}

export function useLiveTracking({
  ambulanceId,
  targetLat,
  targetLng,
  pollIntervalMs = 5000,
}: LiveTrackingParams) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<any>(null);

  const fetchLatestTelemetry = useCallback(async () => {
    if (!ambulanceId) return;
    try {
      const data = await ambulanceService.getTracking(ambulanceId, targetLat, targetLng);
      setTelemetry(data);
      setIsLive(data.telemetry_status === 'live');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update live telemetry');
    }
  }, [ambulanceId, targetLat, targetLng]);

  useEffect(() => {
    if (!ambulanceId) {
      setTelemetry(null);
      return;
    }

    // Initial fetch
    fetchLatestTelemetry();

    // Subscribe to websocket events
    const unsubscribe = socketService.on(`ambulance:${ambulanceId}:telemetry`, (data: TelemetryData) => {
      setTelemetry(data);
      setIsLive(true);
    });

    // Fallback polling
    if (pollIntervalMs > 0) {
      pollTimerRef.current = setInterval(fetchLatestTelemetry, pollIntervalMs);
    }

    return () => {
      unsubscribe();
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [ambulanceId, fetchLatestTelemetry, pollIntervalMs]);

  return {
    telemetry,
    isLive,
    error,
    refresh: fetchLatestTelemetry,
  };
}
