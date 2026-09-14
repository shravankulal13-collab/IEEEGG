// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Operations Hook
// ============================================================

import { useEffect, useCallback } from 'react';
import { useHospitalStore } from '../store/hospitalStore';
import type { HospitalCapacityUpdate, DoctorOnCall } from '../services/hospital.service';

export function useHospital(hospitalId?: string) {
  const {
    hospitals,
    selectedHospitalId,
    currentDashboard,
    isLoading,
    error,
    fetchHospitals,
    fetchHospitalDashboard,
    updateCapacity,
    updateDoctorStatus,
    setSelectedHospital,
    setError,
  } = useHospitalStore();

  useEffect(() => {
    if (hospitals.length === 0) {
      fetchHospitals();
    }
  }, [hospitals.length, fetchHospitals]);

  useEffect(() => {
    if (hospitalId) {
      fetchHospitalDashboard(hospitalId);
    }
  }, [hospitalId, fetchHospitalDashboard]);

  const handleCapacityUpdate = useCallback(
    async (targetHospitalId: string, capacity: HospitalCapacityUpdate) => {
      return await updateCapacity(targetHospitalId, capacity);
    },
    [updateCapacity]
  );

  const handleDoctorStatusUpdate = useCallback(
    async (targetHospitalId: string, doctorId: string, status: DoctorOnCall['status']) => {
      return await updateDoctorStatus(targetHospitalId, doctorId, status);
    },
    [updateDoctorStatus]
  );

  return {
    hospitals,
    selectedHospitalId,
    currentDashboard,
    isLoading,
    error,
    refreshHospitals: fetchHospitals,
    refreshDashboard: fetchHospitalDashboard,
    updateCapacity: handleCapacityUpdate,
    updateDoctorStatus: handleDoctorStatusUpdate,
    setSelectedHospital,
    setError,
  };
}
