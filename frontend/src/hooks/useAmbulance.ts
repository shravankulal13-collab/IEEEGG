// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Custom React Hook for Ambulance Operations
// ============================================================

import { useEffect } from 'react';
import { useAmbulanceStore } from '../store/ambulanceStore';

export function useAmbulance(driverId?: string, incidentId?: string) {
  const store = useAmbulanceStore();

  useEffect(() => {
    if (driverId) {
      store.fetchDriverAmbulance(driverId);
    } else if (incidentId) {
      store.fetchIncidentAmbulance(incidentId);
    }
  }, [driverId, incidentId]);

  return {
    ambulance: store.currentAmbulance,
    telemetry: store.activeTelemetry,
    isLoading: store.isLoading,
    error: store.error,
    updateStatus: store.updateStatus,
    updateLocation: store.updateLocation,
  };
}
