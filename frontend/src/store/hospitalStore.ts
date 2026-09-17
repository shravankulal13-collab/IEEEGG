// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Operations State Store
// ============================================================

import { create } from 'zustand';
import type {
  HospitalData,
  HospitalDashboardData,
  HospitalCapacityUpdate,
  DoctorOnCall,
} from '../services/hospital.service';
import { hospitalService } from '../services/hospital.service';

interface HospitalState {
  hospitals: HospitalData[];
  selectedHospitalId: string | null;
  currentDashboard: HospitalDashboardData | null;
  isLoading: boolean;
  error: string | null;

  fetchHospitals: () => Promise<void>;
  fetchHospitalDashboard: (hospitalId: string) => Promise<void>;
  updateCapacity: (hospitalId: string, capacity: HospitalCapacityUpdate) => Promise<void>;
  updateDoctorStatus: (hospitalId: string, doctorId: string, status: DoctorOnCall['status']) => Promise<void>;
  setSelectedHospital: (hospitalId: string | null) => void;
  setError: (error: string | null) => void;
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  hospitals: [],
  selectedHospitalId: null,
  currentDashboard: null,
  isLoading: false,
  error: null,

  fetchHospitals: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await hospitalService.getAllHospitals();
      set({ hospitals: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load hospitals', isLoading: false });
    }
  },

  fetchHospitalDashboard: async (hospitalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await hospitalService.getHospitalDashboard(hospitalId);
      set({ currentDashboard: data, selectedHospitalId: hospitalId, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load hospital dashboard', isLoading: false });
    }
  },

  updateCapacity: async (hospitalId: string, capacity: HospitalCapacityUpdate) => {
    try {
      const updated = await hospitalService.updateCapacity(hospitalId, capacity);
      
      // Update in hospitals list
      const hospitals = get().hospitals.map((h) => (h.id === hospitalId ? { ...h, ...updated } : h));
      
      // Update in current dashboard if open
      let currentDashboard = get().currentDashboard;
      if (currentDashboard && currentDashboard.hospital.id === hospitalId) {
        currentDashboard = {
          ...currentDashboard,
          hospital: { ...currentDashboard.hospital, ...updated },
        };
      }

      set({ hospitals, currentDashboard });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update capacity' });
      throw err;
    }
  },

  updateDoctorStatus: async (hospitalId: string, doctorId: string, status: DoctorOnCall['status']) => {
    try {
      await hospitalService.updateDoctorStatus(hospitalId, doctorId, status);
      const currentDashboard = get().currentDashboard;
      if (currentDashboard && currentDashboard.hospital.id === hospitalId) {
        const updatedDoctors = currentDashboard.doctors.map((d) =>
          d.id === doctorId ? { ...d, status } : d
        );
        set({
          currentDashboard: {
            ...currentDashboard,
            doctors: updatedDoctors,
          },
        });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to update doctor status' });
    }
  },

  setSelectedHospital: (hospitalId: string | null) => set({ selectedHospitalId: hospitalId }),
  setError: (error: string | null) => set({ error }),
}));
