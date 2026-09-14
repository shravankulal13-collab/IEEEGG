// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident State Store
// ============================================================

import { create } from 'zustand';
import {
  incidentService,
  type IncidentRecord,
  type CreateIncidentPayload,
  type IncidentQueryParams,
} from '../services/incident.service';

export interface IncidentState {
  incidents: IncidentRecord[];
  activeIncident: IncidentRecord | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchIncidents: (params?: IncidentQueryParams) => Promise<void>;
  fetchIncidentById: (id: string) => Promise<IncidentRecord>;
  createIncident: (payload: CreateIncidentPayload) => Promise<IncidentRecord>;
  updateIncidentStatus: (id: string, status: string, notes?: string) => Promise<IncidentRecord>;
  verifyIncident: (id: string, verified: boolean, notes?: string) => Promise<IncidentRecord>;
  cancelIncident: (id: string, reason?: string) => Promise<IncidentRecord>;
  setActiveIncident: (incident: IncidentRecord | null) => void;
  clearError: () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  activeIncident: null,
  total: 0,
  page: 1,
  limit: 10,
  isLoading: false,
  error: null,

  fetchIncidents: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await incidentService.list(params);
      set({
        incidents: data.items,
        total: data.total,
        page: data.page,
        limit: data.limit,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch incidents', isLoading: false });
    }
  },

  fetchIncidentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const incident = await incidentService.getById(id);
      set({ activeIncident: incident, isLoading: false });
      return incident;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch incident details', isLoading: false });
      throw err;
    }
  },

  createIncident: async (payload: CreateIncidentPayload) => {
    set({ isLoading: true, error: null });
    try {
      const incident = await incidentService.create(payload);
      set((state) => ({
        incidents: [incident, ...state.incidents],
        activeIncident: incident,
        total: state.total + 1,
        isLoading: false,
      }));
      return incident;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create incident', isLoading: false });
      throw err;
    }
  },

  updateIncidentStatus: async (id: string, status: string, notes?: string) => {
    try {
      const updated = await incidentService.updateStatus(id, status, notes);
      set((state) => ({
        incidents: state.incidents.map((inc) => (inc.id === id ? updated : inc)),
        activeIncident: state.activeIncident?.id === id ? updated : state.activeIncident,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update status' });
      throw err;
    }
  },

  verifyIncident: async (id: string, verified: boolean, notes?: string) => {
    try {
      const updated = await incidentService.verify(id, verified, notes);
      set((state) => ({
        incidents: state.incidents.map((inc) => (inc.id === id ? updated : inc)),
        activeIncident: state.activeIncident?.id === id ? updated : state.activeIncident,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to verify incident' });
      throw err;
    }
  },

  cancelIncident: async (id: string, reason?: string) => {
    try {
      const cancelled = await incidentService.cancel(id, reason);
      set((state) => ({
        incidents: state.incidents.map((inc) => (inc.id === id ? cancelled : inc)),
        activeIncident: state.activeIncident?.id === id ? cancelled : state.activeIncident,
      }));
      return cancelled;
    } catch (err: any) {
      set({ error: err.message || 'Failed to cancel incident' });
      throw err;
    }
  },

  setActiveIncident: (incident) => set({ activeIncident: incident }),
  clearError: () => set({ error: null }),
}));
