// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Live Incident Tracking Screen (ResQGrid Map HUD)
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { ambulanceService, type AmbulanceData } from '../../services/ambulance.service';
import { hospitalService, type HospitalData } from '../../services/hospital.service';
import { routeService, type CalculatedRoute } from '../../services/route.service';
import { type IncidentRecord } from '../../services/incident.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmergencyMap } from '../../components/maps/EmergencyMap';
import {
  PhoneCall,
  Navigation,
  Ambulance,
  Building2,
  User,
} from 'lucide-react';

export const LiveIncidentTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId');
  const { fetchIncidentById } = useIncidentStore();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [ambulance, setAmbulance] = useState<AmbulanceData | null>(null);
  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [calculatedRoute, setCalculatedRoute] = useState<CalculatedRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let activeInc: IncidentRecord | null = null;
      if (incidentId) {
        try {
          activeInc = await fetchIncidentById(incidentId);
        } catch {
          // If the specific incident ID does not exist in the database, load latest active incident
          await useIncidentStore.getState().fetchIncidents();
          activeInc = useIncidentStore.getState().incidents[0] || null;
        }
      } else {
        await useIncidentStore.getState().fetchIncidents();
        activeInc = useIncidentStore.getState().incidents[0] || null;
      }

      setIncident(activeInc);

      // Load hospitals
      const hospitals = await hospitalService.getAllHospitals();
      const targetHosp = activeInc?.assigned_hospital_id
        ? hospitals.find((h) => h.id === activeInc?.assigned_hospital_id) || hospitals[0]
        : hospitals[0];
      setHospital(targetHosp || null);

      // Load ambulances
      const ambulances = await ambulanceService.getAllAmbulances();
      const targetAmb = activeInc?.assigned_ambulance_id
        ? ambulances.find((a) => a.id === activeInc?.assigned_ambulance_id) || ambulances[0]
        : ambulances[0];
      setAmbulance(targetAmb || null);

      // Calculate Real Driving Route via Mappls / MapMyIndia API
      if (activeInc && (targetAmb || targetHosp)) {
        const originLat = targetAmb?.current_latitude || activeInc.latitude || 12.9716;
        const originLng = targetAmb?.current_longitude || activeInc.longitude || 77.5946;
        const destLat = targetHosp?.latitude || activeInc.latitude || 12.8953;
        const destLng = targetHosp?.longitude || activeInc.longitude || 77.5986;

        const route = await routeService.computeRoute({
          origin: { lat: originLat, lng: originLng },
          destination: { lat: destLat, lng: destLng },
          profile: 'emergency',
        });
        setCalculatedRoute(route);
      }

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load live tracking telemetry.');
      setIsLoading(false);
    }
  }, [incidentId, fetchIncidentById]);

  useEffect(() => {
    loadData();

    // Auto-refresh telemetry every 10 seconds
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  if (isLoading && !incident) {
    return (
      <AppShell sidebarVariant='top'>
        <div className="max-w-7xl mx-auto py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-600 mt-4">Connecting to Live PostGIS Navigation Stream...</p>
        </div>
      </AppShell>
    );
  }

  if (error && !incident) {
    return (
      <AppShell sidebarVariant='top'>
        <div className="max-w-3xl mx-auto py-12">
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </AppShell>
    );
  }

  const reporterName = incident?.reporter_name || 'Citizen Caller';
  const reporterPhone = incident?.reporter_phone || 'Emergency Contact';
  const assignedAmbNumber = ambulance?.ambulance_number || incident?.assigned_ambulance_number || (incident?.assigned_ambulance_id ? `Unit ${incident.assigned_ambulance_id}` : 'Pending Unit Assignment');
  const assignedHospitalName = hospital?.name || incident?.assigned_hospital_name || 'Pending Hospital Assignment';
  const hospitalIcuBeds = hospital ? (hospital.available_icu_beds ?? hospital.availableICUBeds ?? 0) : 0;
  const hospitalEmergencyBeds = hospital ? (hospital.available_beds ?? hospital.availableEmergencyBeds ?? 0) : 0;

  const etaDisplay = calculatedRoute?.formatted_duration || (incident?.assigned_ambulance_id ? 'Calculating...' : 'Pending Assignment');
  const distanceDisplay = calculatedRoute?.formatted_distance || (incident?.assigned_ambulance_id ? 'Computing...' : 'Standby');

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <PageHeader
          pillTag="Live Map HUD"
          title={`Tracking Incident: ${incident?.id || incidentId || 'LIVE'}`}
          subtitle={`Caller: ${reporterName} (${reporterPhone}) • Destination: ${assignedHospitalName}`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => window.open('tel:108')}
                className="btn-pulse-glow"
              >
                <PhoneCall className="w-3.5 h-3.5 mr-1" />
                <span>Call Emergency 108</span>
              </Button>
            </div>
          }
        />

        {/* 3 Top Real-Time Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0B1B4F] border border-blue-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ESTIMATED TIME OF ARRIVAL</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{etaDisplay}</p>
              <span className="text-[10px] text-slate-300">Distance: {distanceDisplay} (Mappls Engine)</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="bg-[#0B1B4F] border border-blue-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DESTINATION TRAUMA CENTER</span>
              <p className="text-base font-black text-white mt-1 truncate max-w-[200px]">{assignedHospitalName}</p>
              <span className="text-[10px] text-emerald-300 font-bold">{hospitalIcuBeds} ICU / {hospitalEmergencyBeds} Emergency Beds Free</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0B1B4F] border border-blue-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ASSIGNED AMBULANCE</span>
              <p className="text-base font-black text-white mt-1">{assignedAmbNumber} ({ambulance?.ambulance_type || 'ALS'})</p>
              <span className="text-[10px] text-slate-300">Driver: {ambulance?.driver_name || 'Paramedic Unit'}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <Ambulance className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        {/* Main Content: Map + Status Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interactive Map (Takes 2 Columns) */}
          <div className="lg:col-span-2 h-[520px]">
            <EmergencyMap
              incidents={
                incident
                  ? [
                    {
                      id: incident.id,
                      incidentNumber: String(incident.incident_number || incident.id),
                      type: (incident.emergency_type as any) || 'medical',
                      severity: (typeof incident.severity === 'string' ? incident.severity : 'critical') as any,
                      lat: incident.latitude || 12.9716,
                      lng: incident.longitude || 77.5946,
                      address: incident.address || 'Reported Incident Coordinates',
                    },
                  ]
                  : []
              }
              ambulances={
                ambulance
                  ? [
                    {
                      id: ambulance.id,
                      unitCode: ambulance.ambulance_number,
                      type: (ambulance.ambulance_type as any) || 'ALS',
                      status: (ambulance.status as any) || 'en_route',
                      speedKmH: ambulance.current_speed_kmh || 45,
                      heading: ambulance.current_heading || 90,
                      lat: ambulance.current_latitude || 12.9716,
                      lng: ambulance.current_longitude || 77.5946,
                    },
                  ]
                  : []
              }
              hospitals={
                hospital
                  ? [
                    {
                      id: hospital.id,
                      name: hospital.name,
                      traumaLevel: hospital.trauma_level || 'Level 1',
                      icuBedsAvailable: hospitalIcuBeds,
                      lat: hospital.latitude,
                      lng: hospital.longitude,
                    },
                  ]
                  : []
              }
              showGreenCorridor={true}
              className="h-full"
            />
          </div>

          {/* Right Information & Triage Timeline (Takes 1 Column) */}
          <div className="space-y-4">
            {/* Caller & Incident Details */}
            <Card className="p-5 border border-slate-200 shadow-xl bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">CALLER INFORMATION</span>
                <Badge variant="danger">{String(incident?.emergency_type || 'MEDICAL').toUpperCase()}</Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">{reporterName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{reporterPhone}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block text-[11px]">Location Pinpoint:</span>
                <span className="text-slate-600 font-medium">{incident?.address || 'GPS Telemetry Point'}</span>
              </div>
            </Card>

            {/* Destination Hospital Card */}
            <Card className="p-5 border border-emerald-500/30 bg-gradient-to-br from-[#0B1B4F] to-[#0A192F] text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                  ALLOCATED TRAUMA CENTER
                </span>
                <Badge variant="success">{hospital?.trauma_level || 'LEVEL 1'}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white">{assignedHospitalName}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{hospital?.address || 'Emergency Trauma Facility'}</p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Live ICU Capacity:</span>
                <span className="text-emerald-400 font-bold">{hospitalIcuBeds} Beds Ready</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default LiveIncidentTracking;
