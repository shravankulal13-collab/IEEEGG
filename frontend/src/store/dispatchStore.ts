// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Active Dispatch Operations State Store
// ============================================================

import { create } from 'zustand';
import type {
  DispatchCandidate,
  DispatchRequestPayload,
  DispatchResponse,
} from '../services/dispatch.service';
import { dispatchService } from '../services/dispatch.service';

interface DispatchState {
  candidates: DispatchCandidate[];
  selectedCandidate: DispatchCandidate | null;
  activeAssignment: DispatchResponse | null;
  isDispatching: boolean;
  isLoadingCandidates: boolean;
  error: string | null;

  fetchCandidates: (incidentId: string, location?: { lat: number; lng: number }) => Promise<void>;
  selectCandidate: (candidate: DispatchCandidate | null) => void;
  executeDispatch: (payload: DispatchRequestPayload) => Promise<DispatchResponse>;
  clearAssignment: () => void;
  setError: (error: string | null) => void;
}

export const useDispatchStore = create<DispatchState>((set) => ({
  candidates: [],
  selectedCandidate: null,
  activeAssignment: null,
  isDispatching: false,
  isLoadingCandidates: false,
  error: null,

  fetchCandidates: async (incidentId: string, location?: { lat: number; lng: number }) => {
    set({ isLoadingCandidates: true, error: null });
    try {
      const candidates = await dispatchService.getScoredCandidates(incidentId, location);
      set({
        candidates,
        selectedCandidate: candidates[0] || null,
        isLoadingCandidates: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch dispatch candidates', isLoadingCandidates: false });
    }
  },

  selectCandidate: (candidate: DispatchCandidate | null) => set({ selectedCandidate: candidate }),

  executeDispatch: async (payload: DispatchRequestPayload) => {
    set({ isDispatching: true, error: null });
    try {
      const response = await dispatchService.requestDispatch(payload);
      set({ activeAssignment: response, isDispatching: false });
      return response;
    } catch (err: any) {
      set({ error: err.message || 'Dispatch operation failed', isDispatching: false });
      throw err;
    }
  },

  clearAssignment: () => set({ activeAssignment: null, selectedCandidate: null }),
  setError: (error: string | null) => set({ error }),
}));
