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
    <AppShell>
      <HeroSection
        badgeText={`${activeHospital?.name || 'Trauma Emergency'} Intake Center`}
        headingPrefix="Coordinate Rapid"
        typewriterPhrases={[
          'ICU Bed Allocations',
          'Cath-Lab Prep Teams',
          'Paramedic ECG Telemetries',
          'Trauma Resuscitation'
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
            <span className="text-xs font-bold text-slate-500 uppercase">Available ICU Beds</span>
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">{icuAvailable} / {icuTotal}</span>
          <p className="text-xs text-emerald-600 font-bold mt-1">{activeHospital ? `${Math.round((icuAvailable / Math.max(icuTotal, 1)) * 100)}% Available` : 'Syncing...'}</p>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Emergency Beds</span>
            <HeartPulse className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">{emergencyAvailable} Free</span>
          <p className="text-xs text-blue-600 font-bold mt-1">Available for triage</p>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Specialists On Duty</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">{doctors.length || (activeHospital?.onCallSpecialists?.length ?? 0)} Doctors</span>
          <p className="text-xs text-purple-600 font-bold mt-1">Active Roster</p>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Inbound In Triage</span>
            <Radio className="w-5 h-5 text-red-600 animate-pulse" />
          </div>
          <span className="text-3xl font-black text-red-600">{incomingPatients.length} Inbound</span>
          <p className="text-xs text-slate-500 font-bold mt-1">Live Telemetry Queue</p>
        </Card>
      </div>

      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-500 mt-3">Loading trauma center dashboard from database...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-6">
          <ErrorState message={`Database Error: ${error}`} onRetry={() => fetchHospitals()} />
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Inbound Emergency Transports</h3>
              <p className="text-xs text-slate-500">Live pre-arrival telemetry streamed from in-transit paramedical units</p>
            </div>
            {incomingPatients.length > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
                Active Inbound Stream
              </span>
            )}
          </div>

          {incomingPatients.length === 0 ? (
            <EmptyState
              title="No Inbound Patients"
              description="There are currently no ambulances in-transit to this hospital center in the database."
            />
          ) : (
            <div className="space-y-4">
              {incomingPatients.map((patient) => (
                <div
                  key={patient.incident_id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                      <Ambulance className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">{patient.patient_condition || 'Emergency Inbound'}</h4>
                        <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                          {patient.incident_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-semibold">
                        Unit: {patient.ambulance_number} | Driver: {patient.driver_name}
                      </p>
                      {patient.vitals && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                          <Activity className="w-3.5 h-3.5 animate-pulse" />
                          <span>HR: {patient.vitals.heart_rate || '--'} bpm | SpO2: {patient.vitals.spo2 || '--'}% | BP: {patient.vitals.bp || '--'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">ETA</span>
                      <span className="text-2xl font-black text-red-600">{patient.eta_minutes} min</span>
                    </div>
                    <Button
                      variant="outline"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          onClick={() => navigate('/hospital/resources')}
          className="cursor-pointer hover-lift flex items-center gap-3 p-5"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Bed & ICU Resources</h4>
            <p className="text-xs text-slate-500">Manage ventilators, ward allocation</p>
          </div>
        </Card>

        <Card
          onClick={() => navigate('/hospital/doctors')}
          className="cursor-pointer hover-lift flex items-center gap-3 p-5"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Doctors On-Call</h4>
            <p className="text-xs text-slate-500">Trauma surgeon roster</p>
          </div>
        </Card>

        <Card
          onClick={() => navigate('/hospital/history')}
          className="cursor-pointer hover-lift flex items-center gap-3 p-5"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Emergency History</h4>
            <p className="text-xs text-slate-500">Admissions & outcome logs</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
