// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Turn-by-Turn Navigation UI (ResQGrid Cockpit)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { hospitalService, type HospitalData } from '../../services/hospital.service';
import { ambulanceService, type AmbulanceData } from '../../services/ambulance.service';
import { routeService, type CalculatedRoute } from '../../services/route.service';
import { type IncidentRecord } from '../../services/incident.service';
import { EmergencyMap } from '../../components/maps/EmergencyMap';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft,
  Building2,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId');
  const { fetchIncidentById } = useIncidentStore();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [ambulance, setAmbulance] = useState<AmbulanceData | null>(null);
  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [route, setRoute] = useState<CalculatedRoute | null>(null);
  const [speed, setSpeed] = useState(62);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      let activeInc: IncidentRecord | null = null;
      if (incidentId) {
        activeInc = await fetchIncidentById(incidentId);
      } else {
        const list = useIncidentStore.getState().incidents;
        activeInc = list[0] || null;
      }
      setIncident(activeInc);

      const hospitals = await hospitalService.getAllHospitals();
      const targetHosp = activeInc?.assigned_hospital_id
        ? hospitals.find((h) => h.id === activeInc?.assigned_hospital_id) || hospitals[0]
        : hospitals[0];
      setHospital(targetHosp || null);

      const ambulances = await ambulanceService.getAllAmbulances();
      const targetAmb = activeInc?.assigned_ambulance_id
        ? ambulances.find((a) => a.id === activeInc?.assigned_ambulance_id) || ambulances[0]
        : ambulances[0];
      setAmbulance(targetAmb || null);

      // Compute Real Routing via MapMyIndia Mappls
      if (activeInc && (targetAmb || targetHosp)) {
        const originLat = targetAmb?.current_latitude || activeInc.latitude || 12.9716;
        const originLng = targetAmb?.current_longitude || activeInc.longitude || 77.5946;
        const destLat = targetHosp?.latitude || activeInc.latitude || 12.8953;
        const destLng = targetHosp?.longitude || activeInc.longitude || 77.5986;

        const calculated = await routeService.computeRoute({
          origin: { lat: originLat, lng: originLng },
          destination: { lat: destLat, lng: destLng },
          profile: 'emergency',
        });
        setRoute(calculated);
      }

      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [incidentId, fetchIncidentById]);

  useEffect(() => {
    loadData();

    const speedInterval = setInterval(() => {
      setSpeed(Math.floor(58 + Math.random() * 18));
    }, 4000);

    return () => clearInterval(speedInterval);
  }, [loadData]);

  if (isLoading && !incident) {
    return (
      <div className="h-screen bg-[#070F1E] flex flex-col items-center justify-center text-white">
        <Spinner size="lg" />
        <p className="text-xs font-bold text-slate-400 mt-4">Initializing MapMyIndia Mappls Routing HUD...</p>
      </div>
    );
  }

  const patientAddress = incident?.address || 'Reported Incident GPS Coordinates';
  const hospitalName = hospital?.name || incident?.assigned_hospital_name || 'Assigned Trauma Center (Pending)';
  const callerName = incident?.reporter_name || 'Emergency Caller';
  const etaMinutes = route ? Math.ceil(route.duration_seconds / 60) : 0;
  const distanceKm = route ? (route.distance_meters / 1000).toFixed(1) : '0.0';
  const nextStep = route?.steps[0]?.instruction || 'Proceed along designated emergency green corridor';

  return (
    <div className="h-screen bg-[#070F1E] text-white font-sans flex flex-col overflow-hidden">
      {/* Top Banner Navigation Instructions (ResQGrid Deep Navy) */}
      <div className="bg-[#0B1B4F] border-b-2 border-emerald-500/40 px-6 py-4 flex items-center justify-between shadow-2xl z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ambulance')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Back to Cockpit"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg border border-emerald-400">
            <ArrowRight className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600/40">
                MAPPLS LIVE ROUTING
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">Caller: {callerName}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white mt-0.5">
              {nextStep}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">SPEED</span>
            <span className="text-xl font-black text-amber-400 font-mono">{speed} km/h</span>
          </div>

          <div className="text-right border-l border-slate-700 pl-4 sm:pl-6">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">{String(etaMinutes).padStart(2, '0')}</span>
              <span className="text-xs font-bold text-slate-400">min</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold block">{distanceKm} km remaining</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="flex-1 relative">
        <EmergencyMap
          incidents={
            incident
              ? [
                  {
                    id: incident.id,
                    incidentNumber: String(incident.incident_number || incident.id),
                    type: (incident.emergency_type as any) || 'medical',
                    severity: 'critical',
                    lat: incident.latitude || 12.9716,
                    lng: incident.longitude || 77.5946,
                    address: patientAddress,
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
                    speedKmH: speed,
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
                    icuBedsAvailable: hospital.available_icu_beds || hospital.availableICUBeds || 4,
                    lat: hospital.latitude,
                    lng: hospital.longitude,
                  },
                ]
              : []
          }
          showGreenCorridor={true}
          className="h-full rounded-none border-none"
        />
      </div>

      {/* Bottom Operational Action Bar */}
      <div className="bg-[#0B1B4F] border-t border-blue-900/60 p-4 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DESTINATION TRAUMA FACILITY</span>
            <span className="text-sm font-extrabold text-white">{hospitalName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('tel:108')}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition cursor-pointer"
            title="Call Dispatch"
          >
            <Phone className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={() => navigate(`/ambulance/active?incidentId=${incident?.id || incidentId}`)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs rounded-xl shadow-[0_10px_25px_rgba(229,9,20,0.5)] flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            UPDATE PATIENT TRIAGE
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
