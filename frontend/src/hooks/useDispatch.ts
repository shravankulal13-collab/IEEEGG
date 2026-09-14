// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Emergency Dispatch Operations Hook
// ============================================================

import { useEffect, useCallback } from 'react';
import { useDispatchStore } from '../store/dispatchStore';
import type { DispatchRequestPayload, DispatchCandidate } from '../services/dispatch.service';

export function useDispatch(incidentId?: string, location?: { lat: number; lng: number }) {
  const {
    candidates,
    selectedCandidate,
    activeAssignment,
    isDispatching,
    isLoadingCandidates,
    error,
    fetchCandidates,
    selectCandidate,
    executeDispatch,
    clearAssignment,
    setError,
  } = useDispatchStore();

  useEffect(() => {
    if (incidentId) {
      fetchCandidates(incidentId, location);
    }
  }, [incidentId, location?.lat, location?.lng, fetchCandidates]);

  const dispatchAmbulance = useCallback(
    async (payload: DispatchRequestPayload) => {
      return await executeDispatch(payload);
    },
    [executeDispatch]
  );

  const handleSelectCandidate = useCallback(
    (candidate: DispatchCandidate | null) => {
      selectCandidate(candidate);
    },
    [selectCandidate]
  );

  return {
    candidates,
    selectedCandidate,
    activeAssignment,
    isDispatching,
    isLoadingCandidates,
    error,
    refreshCandidates: () => (incidentId ? fetchCandidates(incidentId, location) : Promise.resolve()),
    selectCandidate: handleSelectCandidate,
    dispatchAmbulance,
    clearAssignment,
    setError,
  };
}
