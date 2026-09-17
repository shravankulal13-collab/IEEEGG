// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Active Emergency Driver Operational Controls (ResQGrid)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { useAmbulanceStore } from '../../store/ambulanceStore';
import { hospitalService, type HospitalData } from '../../services/hospital.service';
import { ambulanceService, type AmbulanceData } from '../../services/ambulance.service';
import { type IncidentRecord } from '../../services/incident.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { MapPin, Navigation, ShieldCheck, ArrowRight, ArrowLeft, Building2, User } from 'lucide-react';

export const ActiveEmergency: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId');
  const { fetchIncidentById, updateIncidentStatus } = useIncidentStore();
  const { updateStatus: updateAmbStatus } = useAmbulanceStore();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [ambulance, setAmbulance] = useState<AmbulanceData | null>(null);
  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let activeInc: IncidentRecord | null = null;
      if (incidentId) {
        activeInc = await fetchIncidentById(incidentId);
      } else {
        const incidents = useIncidentStore.getState().incidents;
        activeInc = incidents[0] || null;
      }
      setIncident(activeInc);

      // Fetch hospitals
      const hospitals = await hospitalService.getAllHospitals();
      const targetHosp = activeInc?.assigned_hospital_id
        ? hospitals.find((h) => h.id === activeInc?.assigned_hospital_id) || hospitals[0]
        : hospitals[0];
      setHospital(targetHosp || null);

      // Fetch ambulances
      const ambulances = await ambulanceService.getAllAmbulances();
      const targetAmb = activeInc?.assigned_ambulance_id
        ? ambulances.find((a) => a.id === activeInc?.assigned_ambulance_id) || ambulances[0]
        : ambulances[0];
      setAmbulance(targetAmb || null);

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load active mission record.');
      setIsLoading(false);
    }
  }, [incidentId, fetchIncidentById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStageChange = async (nextStage: 'en_route' | 'on_scene' | 'transporting' | 'completed') => {
    if (!incident) return;
    setIsUpdating(true);
    try {
      const incidentStatusMap: Record<string, string> = {
        en_route: 'en_route',
        on_scene: 'arrived',
        transporting: 'transporting',
        completed: 'resolved',
      };

      const ambStatusMap: Record<string, string> = {
        en_route: 'en_route_to_incident',
        on_scene: 'on_scene',
        transporting: 'transporting',
        completed: 'available',
      };

      // 1. Update Incident Status in Database
      const updatedInc = await updateIncidentStatus(incident.id, incidentStatusMap[nextStage]);
      setIncident(updatedInc);

      // 2. Update Ambulance Status in Database
      if (ambulance) {
        await updateAmbStatus(ambulance.id, ambStatusMap[nextStage], incident.id);
      }

      setIsUpdating(false);

      if (nextStage === 'completed') {
        alert('Mission Completed! Patient successfully transferred and unit marked AVAILABLE.');
        navigate('/ambulance');
      }
    } catch (err: any) {
      setIsUpdating(false);
      alert(`Status update failed: ${err.message}`);
    }
  };

  if (isLoading && !incident) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-600 mt-4">Loading mission control telemetry...</p>
        </div>
      </AppShell>
    );
  }

  if (error && !incident) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto py-12">
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </AppShell>
    );
  }

  const currentStage = incident?.status || 'en_route';
  const reporterName = incident?.reporter_name || 'Emergency Caller';
  const reporterPhone = incident?.reporter_phone || 'Emergency Contact';
  const patientLocation = incident?.address || 'Reported Incident GPS Coordinates';
  const assignedHospitalName = hospital?.name || incident?.assigned_hospital_name || 'Assigned Medical Center (Pending)';

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <PageHeader
          pillTag="Driver Mission Control"
          title={`Active Mission: ${incident?.id || incidentId || 'ACTIVE'}`}
          subtitle={`Patient: ${reporterName} • Destination: ${assignedHospitalName}`}
          badge={<Badge variant="danger">{String(currentStage).replace('_', ' ').toUpperCase()}</Badge>}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ambulance')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Cockpit
            </Button>
          }
        />

        {/* Incident Summary Card */}
        <Card className="p-6 border-2 border-red-500/80 bg-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">ACTIVE MEDICAL RESPONSE</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {String(incident?.emergency_type || 'MEDICAL').toUpperCase()} Emergency
              </h2>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white font-extrabold text-xs rounded-full uppercase shadow-sm">
              {String(currentStage).replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5 text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Patient Pickup Location</span>
                <span className="text-slate-600">{patientLocation}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <User className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Caller Contact</span>
                <span className="text-slate-600">{reporterName} ({reporterPhone})</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span className="font-extrabold text-slate-900">Destination Hospital: {assignedHospitalName}</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              BED RESERVED
            </span>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/ambulance/navigation?incidentId=${incident?.id || incidentId}`)}
              className="py-3 bg-blue-600 hover:bg-blue-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Open Turn-by-Turn TomTom Navigation
            </Button>
          </div>
        </Card>

        {/* State Machine Operational Action Controls */}
        <Card className="p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
          <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">
            RESPONSE LIFECYCLE CONTROLS
          </h3>

          <div className="space-y-3">
            {(currentStage === 'reported' || currentStage === 'dispatched' || currentStage === 'verified') && (
              <button
                onClick={() => handleStageChange('en_route')}
                disabled={isUpdating}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Database...' : 'Start Response (Mark En Route)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStage === 'en_route' && (
              <button
                onClick={() => handleStageChange('on_scene')}
                disabled={isUpdating}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Database...' : 'Mark Arrived at Patient Scene'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}

            {(currentStage === 'arrived' || currentStage === 'on_scene') && (
              <button
                onClick={() => handleStageChange('transporting')}
                disabled={isUpdating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Database...' : 'Begin Transport to Hospital'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStage === 'transporting' && (
              <button
                onClick={() => handleStageChange('completed')}
                disabled={isUpdating}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Database...' : 'Complete Patient Handover & Mark Available'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}

            {currentStage === 'resolved' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-sm font-bold text-emerald-800">Mission Successfully Completed</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default ActiveEmergency;
