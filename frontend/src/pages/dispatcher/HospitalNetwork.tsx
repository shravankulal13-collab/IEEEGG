// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Medical Network Directory
// ============================================================

import React, { useEffect } from 'react';
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
import { Building2, Activity, RefreshCw } from 'lucide-react';

export const HospitalNetwork: React.FC = () => {
  const navigate = useNavigate();
  const { hospitals, isLoading, error, fetchHospitals } = useHospitalStore();

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const totalIcuBeds = hospitals.reduce((sum, h) => sum + (h.available_icu_beds ?? h.availableICUBeds ?? 0), 0);
  const totalEmergencyBeds = hospitals.reduce((sum, h) => sum + (h.available_beds ?? h.availableEmergencyBeds ?? 0), 0);
  const totalVentilators = hospitals.reduce((sum, h) => sum + (h.available_ventilators ?? 0), 0);

  return (
    <AppShell>
      <PageHeader
        title="Medical Hospital Network"
        subtitle="Real-time ICU capacity, surgical theater availability, and specialist rosters"
        badge={
          error ? (
            <Badge variant="danger">Database Offline</Badge>
          ) : (
            <Badge variant="success">{hospitals.length} Centers Online</Badge>
          )
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchHospitals()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <span className="text-xs font-bold text-slate-500 block uppercase">Total Free ICU Beds</span>
          <span className="text-2xl font-black text-emerald-600">{totalIcuBeds} Beds</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 block uppercase">Emergency Beds Free</span>
          <span className="text-2xl font-black text-blue-600">{totalEmergencyBeds} Beds</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 block uppercase">Ventilators Ready</span>
          <span className="text-2xl font-black text-purple-600">{totalVentilators} Units</span>
        </Card>
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-500 mt-3">Loading hospital capacity data from PostgreSQL database...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-6">
          <ErrorState message={`Database Error: ${error}`} onRetry={() => fetchHospitals()} />
        </div>
      )}

      {!isLoading && !error && hospitals.length === 0 && (
        <EmptyState
          title="No Hospitals Found"
          description="The database is connected but no hospital records exist in the 'hospitals' table."
          action={{
            label: 'Refresh Directory',
            onClick: () => fetchHospitals(),
          }}
        />
      )}

      {!isLoading && !error && hospitals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{hosp.name}</h3>
                    <span className="text-[11px] font-bold text-blue-600">{hosp.trauma_level?.replace('_', ' ') || 'Level 1 Medical'}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">
                  {hosp.operational_status || 'OPEN'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-4">{hosp.address || 'Address not specified'}</p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">ICU BEDS</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{hosp.available_icu_beds ?? hosp.availableICUBeds ?? 0} Free</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">EMERGENCY BEDS</span>
                  <span className="font-extrabold text-blue-600 text-sm">{hosp.available_beds ?? hosp.availableEmergencyBeds ?? 0} Ready</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">VENTILATORS</span>
                  <span className="font-extrabold text-purple-600 text-sm">{hosp.available_ventilators ?? 0} Ready</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate(`/hospital`)}
              >
                <Activity className="w-4 h-4 mr-1.5" />
                View Hospital Resource Dashboard
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
};
