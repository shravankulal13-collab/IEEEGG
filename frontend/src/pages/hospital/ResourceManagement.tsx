// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Bed, ICU, and Equipment Control Center
// ============================================================

import React, { useEffect, useState } from 'react';
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

  const handleSelectHospital = (id: string) => {
    setSelectedHospital(id);
    fetchHospitalDashboard(id);
  };

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
      alert(`Failed to update capacity: ${err.message}`);
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
    <AppShell sidebarVariant='top'>
      <PageHeader
        title="Hospital Capacity & Resource Management"
        subtitle={`Live capacity controls and resource management for ${activeHospital?.name || 'Medical Network'}`}
        badge={
          <Badge variant="info">Live Capacity Grid</Badge>
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

      {/* Hospital Selector Dropdown */}
      {hospitals.length > 0 && (
        <div className="bg-[#0B1B4F] p-3.5 rounded-2xl border border-[#1E3A8A] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 text-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-slate-300">Active Medical Center:</span>
          </div>
          <select
            value={activeHospital?.id || ''}
            onChange={(e) => handleSelectHospital(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900/80 border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                {h.name} ({h.city || 'India'})
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && !activeHospital && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-300 mt-3">Loading hospital resource telemetry...</p>
        </div>
      )}

      {error && !isLoading && !activeHospital && (
        <div className="my-6">
          <ErrorState
            message={`Unable to load hospital resources: ${error}`}
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
          description="No medical centers currently registered in this region."
        />
      )}

      {activeHospital && (
        <>
          {/* Resource Allocation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* ICU Beds Control */}
            <Card className="hover-lift p-5 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-red-500" />
                  <span>Medical ICU Beds</span>
                </h3>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[11px] font-bold">
                  High Priority
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-black text-white">{icuAvailable} Free</span>
                <span className="text-xs text-slate-300 font-bold">Total: {icuTotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isUpdating || icuAvailable <= 0}
                  onClick={() => adjustBed('ICU', -1)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer border border-white/10"
                >
                  - Admit Patient
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => adjustBed('ICU', 1)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer shadow-md"
                >
                  + Release Bed
                </button>
              </div>
            </Card>

            {/* Regular Emergency Ward Beds */}
            <Card className="hover-lift p-5 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-sky-400" />
                  <span>Emergency Ward Beds</span>
                </h3>
                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded text-[11px] font-bold">
                  General ER
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-black text-white">{emergencyAvailable} Free</span>
                <span className="text-xs text-slate-300 font-bold">Total: {emergencyTotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isUpdating || emergencyAvailable <= 0}
                  onClick={() => adjustBed('EMERGENCY', -1)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer border border-white/10"
                >
                  - Admit Patient
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => adjustBed('EMERGENCY', 1)}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer shadow-md"
                >
                  + Release Bed
                </button>
              </div>
            </Card>

            {/* Mechanical Ventilators */}
            <Card className="hover-lift p-5 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Mechanical Ventilators</span>
                </h3>
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[11px] font-bold">
                  Critical Care
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-black text-white">{ventilatorsAvailable} Ready</span>
                <span className="text-xs text-slate-300 font-bold">Total: {ventilatorsTotal}</span>
              </div>
              <p className="text-xs text-emerald-400 font-bold">Available in critical care inventory</p>
            </Card>
          </div>

          {/* Blood Bank Reserves */}
          <Card className="p-5 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
            <h3 className="text-sm font-extrabold text-white mb-4">Emergency Blood Bank & Trauma Readiness</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                <span className="text-xs font-black text-red-400 block">BLOOD BANK</span>
                <span className="text-2xl font-black text-red-200">{activeHospital.blood_bank_status || 'ADEQUATE'}</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 text-center">
                <span className="text-xs font-bold text-slate-300 block">OXYGEN UNITS</span>
                <span className="text-2xl font-black text-white">{activeHospital.available_oxygen_units ?? 0} Ready</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 text-center">
                <span className="text-xs font-bold text-slate-300 block">TRAUMA RATING</span>
                <span className="text-2xl font-black text-white">{activeHospital.trauma_level || 'LEVEL_1'}</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 text-center">
                <span className="text-xs font-bold text-slate-300 block">OPERATIONAL STATUS</span>
                <span className="text-2xl font-black text-white">{activeHospital.operational_status || 'OPEN'}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
};

export default ResourceManagement;
