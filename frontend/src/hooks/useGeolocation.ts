// ============================================================
// PRIMARY OWNER: Shared / Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Geolocation & Real-time GPS Capture Hook
// NOTE: Shared dependency -- changes maintain standard Geolocation API return types.
// ============================================================

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  status: 'idle' | 'loading' | 'available' | 'denied' | 'unavailable';
  error: string | null;
  address?: string;
}

export function useGeolocation(autoWatch = true) {
  const [geoState, setGeoState] = useState<GeolocationState>({
    latitude: 12.9716, // Default fallback (Bengaluru/High-Fidelity City center)
    longitude: 77.5946,
    accuracy: 3,
    speed: 0,
    heading: 0,
    status: 'idle',
    error: null,
    address: '123 Medical Drive, High-Fidelity City',
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState((prev) => ({
        ...prev,
        status: 'unavailable',
        error: 'Geolocation not supported by browser',
      }));
      return;
    }

    setGeoState((prev) => ({ ...prev, status: 'loading' }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          status: 'available',
          error: null,
          address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        });
      },
      (err) => {
        const errorMsg =
          err.code === err.PERMISSION_DENIED
            ? 'Permission denied'
            : err.code === err.POSITION_UNAVAILABLE
            ? 'Location unavailable'
            : 'Location timeout';

        setGeoState((prev) => ({
          ...prev,
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
          error: errorMsg,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, []);

  useEffect(() => {
    if (autoWatch) {
      requestLocation();
    }
  }, [autoWatch, requestLocation]);

  return { ...geoState, retryLocation: requestLocation };
}
