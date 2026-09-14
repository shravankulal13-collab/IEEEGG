// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Bed, ICU, and Equipment Control Center
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalStore } from '../../store/hospitalStore';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, Activity, HeartPulse, RefreshCw } from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    hospitals,
    selectedHospitalId,
    currentDashboard,
    isLoading,
    error,
    fetchHospitals,
    fetchHospitalDashboard,
    updateCapacity,
    setSelectedHospital,
  } = useHospitalStore();

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospital(hospitals[0].id);
      fetchHospitalDashboard(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId, setSelectedHospital, fetchHospitalDashboard]);

  const activeHospital = currentDashboard?.hospital || hospitals.find((h) => h.id === selectedHospitalId);

  const adjustBed = async (type: 'ICU' | 'EMERGENCY', amount: number) => {
    if (!activeHospital) return;
    setIsUpdating(true);
    try {
      const current = type === 'ICU'
        ? (activeHospital.available_icu_beds ?? activeHospital.availableICUBeds ?? 0)
        : (activeHospital.available_beds ?? activeHospital.availableEmergencyBeds ?? 0);
      const newCount = Math.max(0, current + amount);
      await updateCapacity(activeHospital.id, { type, count: newCount });
    } catch (err: any) {
      alert(`Failed to update capacity in database: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const icuAvailable = activeHospital?.available_icu_beds ?? activeHospital?.availableICUBeds ?? 0;
  const icuTotal = activeHospital?.total_icu_beds ?? 20;
  const emergencyAvailable = activeHospital?.available_beds ?? activeHospital?.availableEmergencyBeds ?? 0;
  const emergencyTotal = activeHospital?.total_beds ?? 80;
  const ventilatorsAvailable = activeHospital?.available_ventilators ?? 0;
  const ventilatorsTotal = activeHospital?.total_ventilators ?? 15;

  return (
    <AppShell>
      <PageHeader
        title="Hospital Capacity & Resource Management"
        subtitle={`Live capacity controls and resource management for ${activeHospital?.name || 'Trauma Network'}`}
        badge={
          error ? (
            <Badge variant="danger">Database Offline</Badge>
          ) : (
            <Badge variant="info">PostgreSQL Sync Active</Badge>
          )
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedHospitalId) fetchHospitalDashboard(selectedHospitalId);
              else fetchHospitals();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        }
      />

      {isLoading && !activeHospital && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-500 mt-3">Loading resource telemetry from database...</p>
        </div>
      )}

      {error && !isLoading && !activeHospital && (
        <div className="my-6">
          <ErrorState
            message={`Database Error: ${error}`}
            onRetry={() => {
              if (selectedHospitalId) fetchHospitalDashboard(selectedHospitalId);
              else fetchHospitals();
            }}
          />
        </div>
      )}

      {!isLoading && !activeHospital && (
        <EmptyState
          title="No Hospitals Found"
          description="The database is connected but no hospital centers exist to manage resources."
        />
      )}

      {activeHospital && (
        <>
          {/* Resource Allocation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* ICU Beds Control */}
            <Card className="hover-lift">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-red-600" />
                  <span>Trauma ICU Beds</span>
                </h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[11px] font-bold">
                  High Priority
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-black text-slate-900">{icuAvailable} Free</span>
                <span className="text-xs text-slate-500 font-bold">Total: {icuTotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isUpdating || icuAvailable <= 0}
                  onClick={() => adjustBed('ICU', -1)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  - Admit Patient
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => adjustBed('ICU', 1)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  + Release Bed
                </button>
              </div>
            </Card>

            {/* Regular Emergency Ward Beds */}
            <Card className="hover-lift">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Emergency Ward Beds</span>
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[11px] font-bold">
                  General ER
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-black text-slate-900">{emergencyAvailable} Free</span>
                <span className="text-xs text-slate-500 font-bold">Total: {emergencyTotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isUpdating || emergencyAvailable <= 0}
                  onClick={() => adjustBed('EMERGENCY', -1)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  - Admit Patient
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => adjustBed('EMERGENCY', 1)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  + Release Bed
                </button>
              </div>
            </Card>

            {/* Mechanical Ventilators */}
            <Card className="hover-lift">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-purple-600" />
                  <span>Mechanical Ventilators</span>
                </h3>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[11px] font-bold">
                  Critical Care
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-black text-slate-900">{ventilatorsAvailable} Ready</span>
                <span className="text-xs text-slate-500 font-bold">Total: {ventilatorsTotal}</span>
              </div>
              <p className="text-xs text-emerald-600 font-bold">Standing by in database inventory</p>
            </Card>
          </div>

          {/* Blood Bank Reserves */}
          <Card>
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Emergency Blood Bank Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-center">
                <span className="text-xs font-black text-red-700 block">BLOOD BANK</span>
                <span className="text-2xl font-black text-red-900">{activeHospital.blood_bank_status || 'ADEQUATE'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-700 block">OXYGEN UNITS</span>
                <span className="text-2xl font-black text-slate-900">{activeHospital.available_oxygen_units ?? 0} Ready</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-700 block">TRAUMA LEVEL</span>
                <span className="text-2xl font-black text-slate-900">{activeHospital.trauma_level || 'LEVEL_1'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-700 block">OPERATIONAL STATUS</span>
                <span className="text-2xl font-black text-slate-900">{activeHospital.operational_status || 'OPEN'}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
};
