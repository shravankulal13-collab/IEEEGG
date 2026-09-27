// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Emergency Intake Dashboard
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalStore } from '../../store/hospitalStore';
import { AppShell } from '../../components/layout/AppShell';
import { HeroSection } from '../../components/layout/HeroSection';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Building2,
  Activity,
  HeartPulse,
  Users,
  Radio,
  ArrowRight,
  Ambulance,
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const navigate = useNavigate();
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

  const activeHospital = currentDashboard?.hospital || hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
  const incomingPatients = currentDashboard?.incoming_patients || [];
  const doctors = currentDashboard?.doctors || [];

  const icuAvailable = activeHospital?.available_icu_beds ?? activeHospital?.availableICUBeds ?? 0;
  const icuTotal = activeHospital?.total_icu_beds ?? 20;
  const emergencyAvailable = activeHospital?.available_beds ?? activeHospital?.availableEmergencyBeds ?? 0;
  const ventilatorsAvailable = activeHospital?.available_ventilators ?? 0;

  return (
    <AppShell sidebarVariant='top'>
      <HeroSection
        headingPrefix="Coordinate Rapid"
        typewriterPhrases={[
          'ICU Bed Allocations',
          'Cath-Lab Prep Teams',
          'Paramedic ECG Telemetries',
          'Emergency Resuscitation'
        ]}
        headingSuffix="with ResQGrid"
        subtitle="Live pre-arrival ambulance vitals, ICU bed availability, surgical team orchestration, and direct cath-lab alerts."
        primaryCta={{
          label: "Live Inbound Telemetry",
          onClick: () => navigate('/hospital/emergency'),
          variant: "red"
        }}
        secondaryCta={{
          label: "Manage ICU Capacity",
          onClick: () => navigate('/hospital/resources')
        }}
        tickerItems={[
          { text: `${icuAvailable} / ${icuTotal} ICU Beds Free` },
          { text: `${emergencyAvailable} Emergency Beds` },
          { text: `${ventilatorsAvailable} Ventilators Ready` },
          { text: `${incomingPatients.length} Inbound Units` }
        ]}
      />

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Available ICU Beds</span>
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white">{icuAvailable} / {icuTotal}</span>
          <p className="text-xs text-emerald-400 font-bold mt-1">{activeHospital ? `${Math.round((icuAvailable / Math.max(icuTotal, 1)) * 100)}% Available` : 'Syncing...'}</p>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Emergency Beds</span>
            <Activity className="w-5 h-5 text-sky-400" />
          </div>
          <span className="text-3xl font-black text-white">{emergencyAvailable} Free</span>
          <p className="text-xs text-sky-300 font-bold mt-1">Available for triage</p>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Specialists On Duty</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-3xl font-black text-white">{doctors.length || (activeHospital?.onCallSpecialists?.length ?? 0)} Doctors</span>
          <p className="text-xs text-purple-300 font-bold mt-1">Active Roster</p>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Inbound In Triage</span>
            <HeartPulse className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <span className="text-3xl font-black text-red-400">{incomingPatients.length} Inbound</span>
          <p className="text-xs text-slate-300 font-bold mt-1">Live Telemetry Queue</p>
        </Card>
      </div>

      {/* Hospital Selector Dropdown */}
      {hospitals.length > 0 && (
        <div className="bg-[#0B1B4F] p-4 rounded-2xl border border-[#1E3A8A] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 text-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-bold text-white">Active Hospital Center:</span>
          </div>
          <select
            value={activeHospital?.id || ''}
            onChange={(e) => {
              setSelectedHospital(e.target.value);
              fetchHospitalDashboard(e.target.value);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900/90 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
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
        <div className="py-12 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-300 mt-3">Loading medical center dashboard...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-6">
          <ErrorState message={`Unable to load dashboard: ${error}`} onRetry={() => fetchHospitals()} />
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-[#0B1B4F] rounded-3xl border border-[#1E3A8A] p-6 shadow-xl mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-white">Inbound Emergency Transports</h3>
              <p className="text-xs text-slate-300">Live pre-arrival telemetry streamed from in-transit paramedical units</p>
            </div>
            {incomingPatients.length > 0 && (
              <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-bold animate-pulse">
                Active Inbound Stream
              </span>
            )}
          </div>

          {incomingPatients.length === 0 ? (
            <EmptyState
              title="No Inbound Patients"
              description="There are currently no inbound emergency ambulances assigned to this trauma unit."
            />
          ) : (
            <div className="space-y-4">
              {incomingPatients.map((patient) => (
                <div
                  key={patient.incident_id}
                  className="p-5 bg-slate-900/80 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-sky-400/40 transition-colors text-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                      <Ambulance className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-white">{patient.patient_condition || 'Emergency Inbound'}</h4>
                        <span className="font-mono text-xs font-bold bg-white/10 border border-white/15 px-2 py-0.5 rounded text-sky-300">
                          {patient.incident_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-semibold">
                        Unit: {patient.ambulance_number} | Driver: {patient.driver_name}
                      </p>
                      {patient.vitals && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-mono font-bold text-red-300 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-500/30">
                          <HeartPulse className="w-3.5 h-3.5 shrink-0 text-red-400" />
                          <span>HR: {patient.vitals.heart_rate || '--'} bpm | SpO2: {patient.vitals.spo2 || '--'}% | BP: {patient.vitals.bp || '--'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">ETA</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">{patient.eta_minutes} min</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/hospital/emergency')}
                      className="whitespace-nowrap"
                    >
                      Open Live Telemetry
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card
          onClick={() => navigate('/hospital/resources')}
          className="cursor-pointer hover-lift flex items-center gap-4 p-5 bg-[#0B1B4F] border border-[#1E3A8A] text-white"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Bed & ICU Resources</h4>
            <p className="text-xs text-slate-300">Manage ventilators, ward allocation</p>
          </div>
        </Card>

        <Card
          onClick={() => navigate('/hospital/doctors')}
          className="cursor-pointer hover-lift flex items-center gap-4 p-5 bg-[#0B1B4F] border border-[#1E3A8A] text-white"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/20 text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Doctors On-Call</h4>
            <p className="text-xs text-slate-300">Medical specialist roster</p>
          </div>
        </Card>

        <Card
          onClick={() => navigate('/hospital/history')}
          className="cursor-pointer hover-lift flex items-center gap-4 p-5 bg-[#0B1B4F] border border-[#1E3A8A] text-white"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Emergency History</h4>
            <p className="text-xs text-slate-300">Admissions & outcome logs</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
