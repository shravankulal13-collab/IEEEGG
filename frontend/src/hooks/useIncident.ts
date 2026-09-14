// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident Management React Hook
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { useIncidentStore } from '../store/incidentStore';

export function useIncident() {
  const store = useIncidentStore();

  return {
    incidents: store.incidents,
    activeIncident: store.activeIncident,
    total: store.total,
    page: store.page,
    limit: store.limit,
    isLoading: store.isLoading,
    error: store.error,
    fetchIncidents: store.fetchIncidents,
    fetchIncidentById: store.fetchIncidentById,
    createIncident: store.createIncident,
    updateIncidentStatus: store.updateIncidentStatus,
    verifyIncident: store.verifyIncident,
    cancelIncident: store.cancelIncident,
    setActiveIncident: store.setActiveIncident,
    clearError: store.clearError,
  };
}
