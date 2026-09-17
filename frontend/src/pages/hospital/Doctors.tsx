// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital On-Call Specialist Doctors Directory
// ============================================================

import React, { useEffect } from 'react';
import { useHospitalStore } from '../../store/hospitalStore';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, Phone, RefreshCw } from 'lucide-react';

export const Doctors: React.FC = () => {
  const {
    hospitals,
    selectedHospitalId,
    currentDashboard,
    isLoading,
    error,
    fetchHospitals,
    fetchHospitalDashboard,
    setSelectedHospital,
  } = useHospitalStore();

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospital(hospitals[0].id);
      fetchHospitalDashboard(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId, setSelectedHospital, fetchHospitalDashboard]);

  const doctors = currentDashboard?.doctors || [];
  const activeHospital = currentDashboard?.hospital || hospitals.find((h) => h.id === selectedHospitalId);

  return (
    <AppShell sidebarVariant='top'>
      <PageHeader
        title="On-Call Medical Specialists"
        subtitle={`Live roster of active emergency room physicians and specialists for ${activeHospital?.name || 'Medical Network'}`}
        badge={
          error ? (
            <Badge variant="danger">Database Offline</Badge>
          ) : (
            <Badge variant="success">{doctors.length} Specialists Active</Badge>
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
            Refresh Roster
          </Button>
        }
      />

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-500 mt-3">Loading physician roster from database...</p>
        </div>
      )}

      {error && !isLoading && (
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

      {!isLoading && !error && doctors.length === 0 && (
        <EmptyState
          title="No On-Call Specialists Registered"
          description={`The database is connected, but no doctors are currently registered for ${activeHospital?.name || 'this hospital center'}.`}
        />
      )}

      {!isLoading && !error && doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">

                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{doc.name}</h3>
                    <span className="text-xs font-bold text-blue-600">{doc.specialty}</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${doc.status === 'AVAILABLE' || doc.status === 'ON_DUTY'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : doc.status === 'SURGERY'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                >
                  {doc.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                <p><strong>Department:</strong> {doc.department || 'Emergency Medicine'}</p>
                <p><strong>Shift End:</strong> {doc.shift_end || 'End of Active Shift'}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => alert(`Dialing direct extension for ${doc.name}: ${doc.phone}`)}
              >

                Direct Physician Page ({doc.phone || 'Extension 108'})
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
};
