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
import { Users, Phone, RefreshCw, Building2 } from 'lucide-react';

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

  const handleSelectHospital = (id: string) => {
    setSelectedHospital(id);
    fetchHospitalDashboard(id);
  };

  return (
    <AppShell sidebarVariant='top'>
      <PageHeader
        title="On-Call Medical Specialists"
        subtitle={`Live roster of active emergency room physicians and specialists for ${activeHospital?.name || 'Medical Network'}`}
        badge={
          <Badge variant="success">{doctors.length} Specialists Active</Badge>
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

      {/* Hospital Selector Dropdown */}
      {hospitals.length > 0 && (
        <div className="bg-[#0B1B4F] p-3.5 rounded-2xl border border-[#1E3A8A] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 text-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-slate-300">Medical Center:</span>
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

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-300 mt-3">Loading physician roster...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-6">
          <ErrorState
            message={`Unable to load physician roster: ${error}`}
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
          description={`No physicians are currently registered on duty for ${activeHospital?.name || 'this trauma center'}.`}
        />
      )}

      {!isLoading && !error && doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] p-5 shadow-xl hover-lift flex flex-col justify-between text-white">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white leading-snug">{doc.name}</h3>
                      <span className="text-xs font-bold text-sky-400 block">{doc.specialty}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      doc.status === 'AVAILABLE' || doc.status === 'ON_DUTY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : doc.status === 'SURGERY'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {doc.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/10 mb-3">
                  <p><strong className="text-white">Department:</strong> {doc.department || 'Emergency Medicine'}</p>
                  <p><strong className="text-white">Shift Schedule:</strong> {doc.shift_end || 'Active Duty'}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => alert(`Dialing direct medical extension for ${doc.name}: ${doc.phone}`)}
                className="text-xs border-white/20 text-white hover:bg-white/10"
              >
                <Phone className="w-3.5 h-3.5 mr-1 text-sky-400" />
                Direct Physician Page ({doc.phone || 'Extension 108'})
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Doctors;
