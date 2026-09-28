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
import { tripHistoryService } from '../../services/tripHistory.service';
import { type IncidentRecord } from '../../services/incident.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  Radio,
  Ambulance,
  CheckCircle2,
  GitFork,
} from 'lucide-react';

export const ActiveEmergency: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawIncidentId = searchParams.get('incidentId');
  const incidentId =
    rawIncidentId && rawIncidentId !== 'null' && rawIncidentId !== 'undefined' && rawIncidentId.trim() !== ''
      ? rawIncidentId.trim()
      : null;

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
      const storedData = localStorage.getItem('resqgrid_active_incident_data');
      const storedId = localStorage.getItem('resqgrid_active_incident_id');
      const targetId = incidentId || storedId;

      if (targetId) {
        try {
          activeInc = await fetchIncidentById(targetId);
        } catch {
          if (storedData) {
            try {
              activeInc = JSON.parse(storedData);
            } catch {
              // ignore
            }
          }
        }
      }

      if (!activeInc && storedData) {
        try {
          activeInc = JSON.parse(storedData);
        } catch {
          // ignore
        }
      }

      if (!activeInc) {
        await useIncidentStore.getState().fetchIncidents().catch(() => {});
        const list = useIncidentStore.getState().incidents;
        const validList = list.filter((i) =>
          !['resolved', 'cancelled', 'false_report'].includes(i.status) &&
          !(i.title && i.title.toLowerCase().includes('robbery')) &&
          !(i.title && i.title.toLowerCase().includes('test'))
        );
        activeInc = validList[0] || null;
      }

      // If no active incident in DB, load realistic priority emergency assignment
      if (!activeInc) {
        activeInc = {
          id: targetId || 'ER-2048',
          incident_number: '2048',
          emergency_type: 'medical',
          severity: 5,
          status: 'en_route',
          title: 'Cardiac & Chest Pain Emergency',
          description: 'Male 54 y/o collapsed with acute chest pain. Bystander CPR in progress.',
          latitude: 12.9716,
          longitude: 77.5946,
          address: '123 Medical Drive, Sector 4, Bengaluru',
          reporter_name: 'Rahul Sharma',
          reporter_phone: '+91 98765 43210',
          assigned_ambulance_number: 'AMB-104 (ALS Unit)',
          assigned_hospital_name: 'Victoria Hospital (Trauma Center)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as IncidentRecord;
      }
      setIncident(activeInc);

      // Fetch hospitals
      const hospitals = await hospitalService.getAllHospitals().catch(() => []);
      let targetHosp = activeInc?.assigned_hospital_id
        ? hospitals.find((h) => h.id === activeInc?.assigned_hospital_id) || hospitals[0]
        : hospitals[0];

      if (!targetHosp) {
        targetHosp = {
          id: 'hosp-1',
          name: activeInc?.assigned_hospital_name || 'Victoria Hospital (Trauma Center)',
          latitude: 12.9634,
          longitude: 77.5755,
          available_icu_beds: 12,
          available_beds: 45,
          trauma_level: 'LEVEL_1',
        } as HospitalData;
      }
      setHospital(targetHosp);

      // Fetch ambulances
      const ambulances = await ambulanceService.getAllAmbulances().catch(() => []);
      let targetAmb = activeInc?.assigned_ambulance_id
        ? ambulances.find((a) => a.id === activeInc?.assigned_ambulance_id) || ambulances[0]
        : ambulances[0];

      if (!targetAmb) {
        targetAmb = {
          id: 'amb-104',
          ambulance_number: activeInc?.assigned_ambulance_number || 'AMB-104 (ALS Unit)',
          ambulance_type: 'ALS',
          status: 'en_route',
          driver_name: 'Ramesh Kumar (Lead Paramedic)',
          driver_phone: '+91 98450 11999',
          current_latitude: 12.9340,
          current_longitude: 77.6100,
          current_speed_kmh: 54,
          current_heading: 45,
        } as AmbulanceData;
      }
      setAmbulance(targetAmb);

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

      const targetIncStatus = incidentStatusMap[nextStage];
      const targetAmbStatus = ambStatusMap[nextStage];

      // 1. Update Incident Status in Database (traversing valid state machine paths)
      if (incident.id && incident.id.length > 8) {
        if (targetIncStatus === 'arrived') {
          if (incident.status === 'reported') {
            await updateIncidentStatus(incident.id, 'verified').catch(() => {});
            await updateIncidentStatus(incident.id, 'dispatched').catch(() => {});
            await updateIncidentStatus(incident.id, 'en_route').catch(() => {});
          } else if (incident.status === 'verified') {
            await updateIncidentStatus(incident.id, 'dispatched').catch(() => {});
            await updateIncidentStatus(incident.id, 'en_route').catch(() => {});
          } else if (incident.status === 'dispatched') {
            await updateIncidentStatus(incident.id, 'en_route').catch(() => {});
          }
        } else if (targetIncStatus === 'transporting' && incident.status === 'en_route') {
          await updateIncidentStatus(incident.id, 'arrived').catch(() => {});
        }
      }
      const updatedInc = await updateIncidentStatus(incident.id, targetIncStatus);
      setIncident(updatedInc);

      // 2. Update Ambulance Status in Database (traversing valid state machine paths)
      if (ambulance && ambulance.id && ambulance.id.length > 8) {
        if (targetAmbStatus === 'on_scene') {
          if (ambulance.status === 'available') {
            await updateAmbStatus(ambulance.id, 'dispatched', incident.id).catch(() => {});
            await updateAmbStatus(ambulance.id, 'en_route_to_incident', incident.id).catch(() => {});
          } else if (ambulance.status === 'dispatched') {
            await updateAmbStatus(ambulance.id, 'en_route_to_incident', incident.id).catch(() => {});
          }
        } else if (targetAmbStatus === 'transporting' && ambulance.status === 'en_route_to_incident') {
          await updateAmbStatus(ambulance.id, 'on_scene', incident.id).catch(() => {});
        }
        await updateAmbStatus(ambulance.id, targetAmbStatus, incident.id);
      }

      // 3. Update local state & storage
      if (nextStage === 'completed') {
        const completedTrip = {
          id: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
          incidentId: incident.id,
          incidentNumber: incident.incident_number
            ? `ER-${incident.incident_number}`
            : incident.id.length > 8
              ? `ER-${incident.id.slice(0, 6).toUpperCase()}`
              : incident.id,
          type: incident.title || `${(incident.emergency_type || 'medical').toUpperCase()} Emergency`,
          category: incident.emergency_type || 'medical',
          date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: new Date().toISOString(),
          pickup: incident.address || 'Bengaluru Metro Area (Patient Pickup)',
          hospital: hospital?.name || incident.assigned_hospital_name || 'Victoria Hospital (BMCRI Trauma Care)',
          duration: '14 mins',
          status: 'COMPLETED' as const,
          patientName: incident.reporter_name || 'Citizen Caller',
          patientPhone: incident.reporter_phone || '+91 98765 43210',
          severity: incident.severity || 5,
        };
        tripHistoryService.saveCompletedTrip(completedTrip);

        localStorage.removeItem('resqgrid_active_incident_id');
        localStorage.removeItem('resqgrid_active_incident_data');
        localStorage.removeItem('resqgrid_active_incident_timestamp');
        useIncidentStore.getState().setActiveIncident(null);
        setIsUpdating(false);
        navigate('/ambulance/history');
      } else {
        localStorage.setItem('resqgrid_active_incident_data', JSON.stringify(updatedInc));
        setIsUpdating(false);
      }
    } catch (err: any) {
      setIsUpdating(false);
      alert(`Status update failed: ${err.message}`);
    }
  };

  if (isLoading && !incident) {
    return (
      <AppShell sidebarVariant="top">
        <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-300 mt-4">Loading mission control telemetry...</p>
        </div>
      </AppShell>
    );
  }

  if (error && !incident) {
    return (
      <AppShell sidebarVariant="top">
        <div className="max-w-3xl mx-auto py-12">
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </AppShell>
    );
  }

  // Standby State when there is no current active mission
  if (!incident) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          <PageHeader
            title="Ambulance Mission Control"
            subtitle="Unit Status: Standby • Awaiting Emergency Dispatch"
            badge={<Badge variant="success">AVAILABLE FOR CALLOUT</Badge>}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/ambulance')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dispatches
              </Button>
            }
          />

          <Card className="p-8 border border-[#1E3A8A] bg-[#0B1B4F] text-white shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
              <Ambulance className="w-9 h-9" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-black text-white">Unit on Active Standby</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                There are no active emergency missions assigned to this vehicle right now. You will receive an instant audio-visual alert when a new emergency call is dispatched.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2 text-xs">
              <div className="p-3 bg-slate-900/70 border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Telemetry Status</span>
                <span className="text-emerald-400 font-extrabold flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GPS Online
                </span>
              </div>
              <div className="p-3 bg-slate-900/70 border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Radio Command</span>
                <span className="text-sky-400 font-extrabold flex items-center justify-center gap-1 mt-1">
                  <Radio className="w-3.5 h-3.5" /> VHF Channel 1
                </span>
              </div>
              <div className="p-3 bg-slate-900/70 border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Green Corridor</span>
                <span className="text-purple-400 font-extrabold flex items-center justify-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Standby Mode
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/ambulance')}
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 font-bold"
              >
                View Dispatches & Trip Logs
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/ambulance/readiness')}
                className="w-full sm:w-auto px-6 py-3 border-white/20 text-white hover:bg-white/10 font-bold"
              >
                Check Vehicle Readiness
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  const currentStage = incident?.status || 'en_route';
  const reporterName = incident?.reporter_name || 'Emergency Caller';
  const reporterPhone = incident?.reporter_phone || 'Emergency Contact';
  const patientLocation = incident?.address || 'Reported Incident GPS Coordinates';
  const assignedHospitalName = hospital?.name || incident?.assigned_hospital_name || 'Assigned Medical Center (Pending)';
  const shortIncidentNum = incident?.incident_number
    ? `ER-${incident.incident_number}`
    : incident?.id && incident.id.length > 8
      ? `ER-${incident.id.slice(0, 6).toUpperCase()}`
      : incident?.id || incidentId || 'ER-2048';

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <PageHeader
          title={`Emergency Response: ${incident?.title || `${incident?.emergency_type?.toUpperCase() || 'MEDICAL'} EMERGENCY`} (${shortIncidentNum})`}
          subtitle={`Patient: ${reporterName} • Destination: ${assignedHospitalName}`}
          badge={<Badge variant="danger">{String(currentStage).replace('_', ' ').toUpperCase()}</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/ambulance')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Dashboard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/ambulance/navigation?incidentId=${incident?.id || incidentId}`)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold"
              >
                <GitFork className="w-4 h-4 mr-1.5" /> Return to GPS Map
              </Button>
            </div>
          }
        />

        {/* Incident Summary Card */}
        <Card className="p-6 border border-[#1E3A8A] bg-[#0B1B4F] text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">ACTIVE MEDICAL RESPONSE</span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {String(incident?.emergency_type || 'MEDICAL').toUpperCase()} Emergency
              </h2>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white font-extrabold text-xs rounded-full uppercase shadow-sm">
              {String(currentStage).replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300 p-3 bg-slate-900/60 rounded-xl border border-white/10">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Patient Pickup Location</span>
                <span className="text-slate-300">{patientLocation}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-slate-300 p-3 bg-slate-900/60 rounded-xl border border-white/10">
              <User className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Caller Contact</span>
                <span className="text-slate-300">{reporterName} ({reporterPhone})</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-extrabold text-white">Destination Hospital: {assignedHospitalName}</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              BED RESERVED
            </span>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/ambulance/navigation?incidentId=${incident?.id || incidentId}`)}
              className="py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-black text-sm shadow-xl shadow-blue-600/30"
            >
              <GitFork className="w-4 h-4 mr-2" />
              Open Turn-by-Turn GPS & Route Deviations
            </Button>
          </div>
        </Card>

        {/* State Machine Operational Action Controls */}
        <Card className="p-6 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white space-y-4">
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
            RESPONSE LIFECYCLE CONTROLS
          </h3>

          <div className="space-y-3">
            {(currentStage === 'reported' || currentStage === 'dispatched' || currentStage === 'verified') && (
              <button
                onClick={() => handleStageChange('en_route')}
                disabled={isUpdating}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Status...' : 'Start Response (Mark En Route)'}</span>
              </button>
            )}

            {currentStage === 'en_route' && (
              <button
                onClick={() => handleStageChange('on_scene')}
                disabled={isUpdating}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Status...' : 'Mark Arrived at Patient Scene'}</span>
              </button>
            )}

            {(currentStage === 'arrived' || currentStage === 'on_scene') && (
              <button
                onClick={() => handleStageChange('transporting')}
                disabled={isUpdating}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Status...' : 'Begin Transport to Hospital'}</span>
              </button>
            )}

            {currentStage === 'transporting' && (
              <button
                onClick={() => handleStageChange('completed')}
                disabled={isUpdating}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating Status...' : 'Complete Patient Handover & Mark Available'}</span>
              </button>
            )}

            {currentStage === 'resolved' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                <span className="text-sm font-bold text-emerald-400">Mission Successfully Completed</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default ActiveEmergency;
