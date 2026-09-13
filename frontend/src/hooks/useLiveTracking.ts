// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Multi-Entity Live Tracking Stream Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { socketClient, AMBULANCE_SOCKET_EVENTS } from '../services/socket';
import type { AmbulanceData, TelemetryData } from '../services/ambulance.service';
import { ambulanceService } from '../services/ambulance.service';

export function useLiveTracking(initialAmbulances: AmbulanceData[] = []) {
  const [fleet, setFleet] = useState<AmbulanceData[]>(initialAmbulances);
  const [latestTelemetry, setLatestTelemetry] = useState<Record<string, TelemetryData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial ambulances if provided
  useEffect(() => {
    if (initialAmbulances.length > 0) {
      setFleet(initialAmbulances);
    }
  }, [initialAmbulances]);

  // Initial fetch of ambulances if needed
  const refreshFleet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanceService.getAllAmbulances();
      setFleet(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch ambulance fleet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const socket = socketClient.connect();

    // Listen to GPS telemetry updates
    const handleTelemetry = (data: TelemetryData) => {
      if (!data?.ambulance_id) return;

      setLatestTelemetry((prev) => ({
        ...prev,
        [data.ambulance_id]: data,
      }));

      // Update position in fleet
      setFleet((prevFleet) =>
        prevFleet.map((amb) => {
          if (amb.id === data.ambulance_id) {
            return {
              ...amb,
              current_latitude: data.latitude,
              current_longitude: data.longitude,
              current_speed_kmh: data.speed_kmh ?? amb.current_speed_kmh,
              current_heading: data.heading ?? amb.current_heading,
              last_gps_update: data.last_updated,
            };
          }
          return amb;
        })
      );
    };

    // Listen to status changes
    const handleStatus = (updated: AmbulanceData) => {
      if (!updated?.id) return;

      setFleet((prevFleet) => {
        const exists = prevFleet.some((amb) => amb.id === updated.id);
        if (exists) {
          return prevFleet.map((amb) => (amb.id === updated.id ? { ...amb, ...updated } : amb));
        }
        return [...prevFleet, updated];
      });
    };

    socket.on(AMBULANCE_SOCKET_EVENTS.TELEMETRY, handleTelemetry);
    socket.on(AMBULANCE_SOCKET_EVENTS.STATUS, handleStatus);

    return () => {
      socket.off(AMBULANCE_SOCKET_EVENTS.TELEMETRY, handleTelemetry);
      socket.off(AMBULANCE_SOCKET_EVENTS.STATUS, handleStatus);
    };
  }, []);

  return {
    fleet,
    latestTelemetry,
    loading,
    error,
    refreshFleet,
  };
}
