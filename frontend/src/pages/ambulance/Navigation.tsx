// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Turn-by-Turn Navigation & Dynamic Route Deviations (ResQGrid Cockpit)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { useAmbulanceStore } from '../../store/ambulanceStore';
import { hospitalService, type HospitalData } from '../../services/hospital.service';
import { ambulanceService, type AmbulanceData } from '../../services/ambulance.service';
import { tripHistoryService } from '../../services/tripHistory.service';
import { type IncidentRecord } from '../../services/incident.service';
import { apiRequest } from '../../services/api';
import { EmergencyMap } from '../../components/maps/EmergencyMap';
import { Spinner } from '../../components/ui/Spinner';
import { 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft,
  Building2,
  Radio,
  Navigation as NavIcon,
  MapPin,
  Zap,
  Phone,
  AlertTriangle,
  GitFork,
  RefreshCw,
  CheckCircle2,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  FileText,
} from 'lucide-react';

export interface RouteDeviationOption {
  id: string;
  name: string;
  tag: string;
  distanceKm: number;
  durationMinutes: number;
  timeDeltaText: string;
  trafficLevel: 'low' | 'moderate' | 'heavy';
  signalsCount: number;
  description: string;
  polyline: [number, number][];
  steps: {
    instruction: string;
    distance: string;
    duration: string;
    maneuver: 'straight' | 'left' | 'right' | 'arrive';
  }[];
  signals: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    etaSeconds: number;
    status: 'preempted' | 'queued';
  }[];
}

export const Navigation: React.FC = () => {
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
  const [speed, setSpeed] = useState<number>(54);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedDeviationId, setSelectedDeviationId] = useState<string>('route-primary');
  const [showDetourAlert, setShowDetourAlert] = useState<boolean>(false);
  const [simulatedTrafficEvent, setSimulatedTrafficEvent] = useState<any | null>(null);
  const [missionStage, setMissionStage] = useState<'en_route' | 'on_scene' | 'transporting' | 'completed'>('en_route');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Metro Coordinates (Bengaluru Core)
  const defaultIncidentCoord = { lat: 12.9716, lng: 77.5946 };
  const defaultAmbCoord = { lat: 12.9340, lng: 77.6100 };
  const defaultHospCoord = { lat: 12.9634, lng: 77.5755 };

  // Dynamic Route Deviations & Detour Presets (degraded dynamically on traffic events)
  const isTrafficDegraded = !!simulatedTrafficEvent;
  const primaryDelay = simulatedTrafficEvent?.addedDelayMinutes || 3;
  const primaryDuration = isTrafficDegraded ? 4 + primaryDelay : 4;

  const routeDeviations: RouteDeviationOption[] = [
    {
      id: 'route-primary',
      name: 'Primary Green Wave Corridor',
      tag: isTrafficDegraded ? `DEGRADED (+${primaryDelay} MIN)` : 'FASTEST (AI PREEMPTED)',
      distanceKm: 2.8,
      durationMinutes: primaryDuration,
      timeDeltaText: isTrafficDegraded ? `+${primaryDelay} min delay` : 'Fastest Route',
      trafficLevel: isTrafficDegraded ? 'heavy' : 'low',
      signalsCount: 3,
      description: isTrafficDegraded
        ? `Degraded due to ${simulatedTrafficEvent.description} - Switch recommended.`
        : 'Direct arterial route with synchronized green-wave signal preemption.',
      polyline: [
        [defaultAmbCoord.lat, defaultAmbCoord.lng],
        [defaultAmbCoord.lat + 0.012, defaultAmbCoord.lng - 0.005],
        [defaultAmbCoord.lat + 0.025, defaultAmbCoord.lng - 0.010],
        [defaultIncidentCoord.lat, defaultIncidentCoord.lng],
      ],
      steps: [
        {
          instruction: isTrafficDegraded
            ? 'Head North on Hosur Arterial Road toward Richmond Circle (CONGESTION AHEAD ⚠️)'
            : 'Head North on Hosur Arterial Road toward Richmond Circle (Green Corridor Active ⚡)',
          distance: '1.2 km',
          duration: isTrafficDegraded ? `${1.5 + primaryDelay} min` : '1.5 min',
          maneuver: 'straight',
        },
        {
          instruction: 'Turn Left at Richmond Junction onto Medical Concourse (Signal Preempted 🚦)',
          distance: '0.9 km',
          duration: '1.2 min',
          maneuver: 'left',
        },
        {
          instruction: 'Arrive at Emergency Patient Pickup Location on Right (123 Medical Drive)',
          distance: '0.7 km',
          duration: '1.0 min',
          maneuver: 'arrive',
        },
      ],
      signals: [
        { id: 'sig-1', name: 'Hosur Main Road / St. John Crossing', lat: defaultAmbCoord.lat + 0.008, lng: defaultAmbCoord.lng - 0.003, etaSeconds: 50, status: 'preempted' },
        { id: 'sig-2', name: 'Richmond Circle Signal Junction', lat: defaultAmbCoord.lat + 0.022, lng: defaultAmbCoord.lng - 0.011, etaSeconds: 120, status: isTrafficDegraded ? 'queued' : 'preempted' },
        { id: 'sig-3', name: 'Medical Concourse East Gate', lat: defaultIncidentCoord.lat - 0.004, lng: defaultIncidentCoord.lng + 0.002, etaSeconds: 190, status: 'preempted' },
      ],
    },
    {
      id: 'route-elevated-bypass',
      name: 'Elevated Flyover Bypass Deviation',
      tag: isTrafficDegraded ? 'RECOMMENDED DETOUR (-2 MIN)' : 'BOTTLENECK DETOUR',
      distanceKm: 3.4,
      durationMinutes: 5,
      timeDeltaText: isTrafficDegraded ? 'Saves 2 min' : '+1 min (+0.6 km)',
      trafficLevel: 'low',
      signalsCount: 2,
      description: 'Elevated bypass avoiding surface intersection bottlenecks and construction zones.',
      polyline: [
        [defaultAmbCoord.lat, defaultAmbCoord.lng],
        [defaultAmbCoord.lat + 0.008, defaultAmbCoord.lng + 0.012],
        [defaultAmbCoord.lat + 0.022, defaultAmbCoord.lng + 0.006],
        [defaultAmbCoord.lat + 0.032, defaultAmbCoord.lng - 0.004],
        [defaultIncidentCoord.lat, defaultIncidentCoord.lng],
      ],
      steps: [
        {
          instruction: 'Take Ramp Right onto Airport Elevated Expressway (Bypassing Surface Bottlenecks)',
          distance: '1.8 km',
          duration: '2.0 min',
          maneuver: 'right',
        },
        {
          instruction: 'Take Exit 4 towards Medical Center North Concourse (Flyover Clearance)',
          distance: '1.0 km',
          duration: '1.5 min',
          maneuver: 'left',
        },
        {
          instruction: 'Arrive at Patient Emergency Location at Medical Drive Bay',
          distance: '0.6 km',
          duration: '1.0 min',
          maneuver: 'arrive',
        },
      ],
      signals: [
        { id: 'sig-e1', name: 'Elevated Ramp Inbound Merge', lat: defaultAmbCoord.lat + 0.010, lng: defaultAmbCoord.lng + 0.010, etaSeconds: 65, status: 'preempted' },
        { id: 'sig-e2', name: 'Exit 4 North Concourse Junction', lat: defaultAmbCoord.lat + 0.028, lng: defaultAmbCoord.lng - 0.002, etaSeconds: 160, status: 'preempted' },
      ],
    },
    {
      id: 'route-outer-ring',
      name: 'Outer Ring Road Expressway Detour',
      tag: 'WIDE MULTI-LANE BYPASS',
      distanceKm: 4.1,
      durationMinutes: 6,
      timeDeltaText: '+2 min (+1.3 km)',
      trafficLevel: 'low',
      signalsCount: 4,
      description: 'Wide 6-lane perimeter corridor offering maximum emergency vehicle maneuvering room.',
      polyline: [
        [defaultAmbCoord.lat, defaultAmbCoord.lng],
        [defaultAmbCoord.lat - 0.004, defaultAmbCoord.lng - 0.014],
        [defaultAmbCoord.lat + 0.016, defaultAmbCoord.lng - 0.022],
        [defaultAmbCoord.lat + 0.034, defaultAmbCoord.lng - 0.016],
        [defaultIncidentCoord.lat, defaultIncidentCoord.lng],
      ],
      steps: [
        {
          instruction: 'Merge West onto 6-Lane Outer Ring Highway Corridor (Emergency Lane Open)',
          distance: '2.2 km',
          duration: '2.5 min',
          maneuver: 'straight',
        },
        {
          instruction: 'Turn Right at Tech Park Boulevard toward Sector 4 Medical Hub',
          distance: '1.2 km',
          duration: '1.8 min',
          maneuver: 'right',
        },
        {
          instruction: 'Arrive at Emergency Scene (123 Medical Drive)',
          distance: '0.7 km',
          duration: '1.2 min',
          maneuver: 'arrive',
        },
      ],
      signals: [
        { id: 'sig-o1', name: 'Outer Ring Highway Merge A', lat: defaultAmbCoord.lat - 0.002, lng: defaultAmbCoord.lng - 0.012, etaSeconds: 45, status: 'preempted' },
        { id: 'sig-o2', name: 'Tech Park Boulevard Crossing', lat: defaultAmbCoord.lat + 0.014, lng: defaultAmbCoord.lng - 0.020, etaSeconds: 110, status: 'preempted' },
        { id: 'sig-o3', name: 'Sector 4 Inbound Signal', lat: defaultAmbCoord.lat + 0.030, lng: defaultAmbCoord.lng - 0.014, etaSeconds: 180, status: 'preempted' },
        { id: 'sig-o4', name: 'Medical Drive West Entry', lat: defaultIncidentCoord.lat - 0.002, lng: defaultIncidentCoord.lng - 0.002, etaSeconds: 230, status: 'preempted' },
      ],
    },
  ];

  const activeDeviation =
    routeDeviations.find((d) => d.id === selectedDeviationId) || routeDeviations[0];

  const loadData = useCallback(async () => {
    setIsLoading(true);
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

      // Check store for active/recent incidents if not loaded by id
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

      // Fallback synthetic active incident if list is empty
      if (!activeInc) {
        activeInc = {
          id: targetId || 'ER-2048-ACTIVE',
          incident_number: '2048',
          emergency_type: 'medical',
          severity: 5,
          status: 'en_route',
          title: 'Cardiac & Chest Pain Emergency',
          description: 'Male 54 y/o collapsed with acute chest pain. CPR in progress by bystander.',
          latitude: defaultIncidentCoord.lat,
          longitude: defaultIncidentCoord.lng,
          address: '123 Medical Drive, Sector 4, Bengaluru',
          reporter_name: 'Rahul Sharma (Citizen)',
          reporter_phone: '+91 98765 43210',
          assigned_ambulance_number: 'KA-05-EA-4820 (ALS Unit)',
          assigned_hospital_name: 'Victoria Hospital (BMCRI Trauma Care)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as IncidentRecord;
      }
      setIncident(activeInc);
      if (activeInc.status === 'arrived' || (activeInc.status as string) === 'on_scene') {
        setMissionStage('on_scene');
      } else if (activeInc.status === 'transporting') {
        setMissionStage('transporting');
      } else if (activeInc.status === 'resolved' || (activeInc.status as string) === 'completed') {
        setMissionStage('completed');
      } else {
        setMissionStage('en_route');
      }

      // Fetch hospitals
      const hospitals = await hospitalService.getAllHospitals().catch(() => []);
      let targetHosp = activeInc?.assigned_hospital_id
        ? hospitals.find((h) => h.id === activeInc?.assigned_hospital_id) || hospitals[0]
        : hospitals[0];

      if (!targetHosp) {
        targetHosp = {
          id: 'hosp-bmcri-1',
          name: activeInc?.assigned_hospital_name || 'Victoria Hospital (BMCRI Trauma Care)',
          latitude: defaultHospCoord.lat,
          longitude: defaultHospCoord.lng,
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
          id: 'amb-als-104',
          ambulance_number: activeInc?.assigned_ambulance_number || 'KA-05-EA-4820 (ALS Unit)',
          ambulance_type: 'ALS',
          status: 'en_route',
          driver_name: 'Ramesh Kumar (Lead Paramedic)',
          driver_phone: '+91 98450 11999',
          current_latitude: defaultAmbCoord.lat,
          current_longitude: defaultAmbCoord.lng,
          current_speed_kmh: 54,
          current_heading: 45,
        } as AmbulanceData;
      }
      setAmbulance(targetAmb);

      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [incidentId, fetchIncidentById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time Traffic Event Polling from Backend Route Monitoring Service
  useEffect(() => {
    let isMounted = true;
    const pollTrafficEvents = async () => {
      try {
        const res = await apiRequest<{ success: boolean; data: any[] }>('/demo/traffic-events');
        if (isMounted && res && res.data) {
          const active = res.data.find(
            (e: any) => e.eventType !== 'NORMAL' && new Date(e.expiresAt).getTime() > Date.now()
          );
          if (active) {
            setSimulatedTrafficEvent(active);
            setShowDetourAlert(true);
          } else {
            setSimulatedTrafficEvent(null);
            setShowDetourAlert(false);
          }
        }
      } catch {
        // quiet fallback
      }
    };

    pollTrafficEvents();
    const interval = setInterval(pollTrafficEvents, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle Switch to Elevated Flyover Bypass
  const handleSwitchToBypass = async () => {
    setSelectedDeviationId('route-elevated-bypass');
    setCurrentStepIndex(0);
    setStatusToast('🚦 REROUTED: Switched to Elevated Flyover Bypass (+2 min savings) [SIMULATION]');
    setTimeout(() => setStatusToast(null), 4000);

    try {
      await apiRequest('/demo/route-change', 'POST', {
        incidentId: incident?.id || incidentId || 'ER-77',
        previousRoute: 'Primary Green Wave Corridor (7 min)',
        newRoute: 'Elevated Flyover Bypass (5 min)',
        reason: simulatedTrafficEvent?.description || 'Road blockage detected on primary route',
        source: 'SIMULATION',
      });
    } catch {
      // quiet fallback
    }
  };

  // Handle direct in-navigation mission stage transitions
  const handleAdvanceMissionStage = async () => {
    if (!incident) return;
    setIsUpdatingStatus(true);
    try {
      let nextStage: 'en_route' | 'on_scene' | 'transporting' | 'completed' = 'on_scene';
      let incidentStatus = 'arrived';
      let ambStatus = 'on_scene';
      let toastMessage = '📍 Status: ARRIVED AT PATIENT SCENE';

      if (missionStage === 'en_route') {
        nextStage = 'on_scene';
        incidentStatus = 'arrived';
        ambStatus = 'on_scene';
        toastMessage = '📍 Status: ARRIVED AT PATIENT SCENE';
      } else if (missionStage === 'on_scene') {
        nextStage = 'transporting';
        incidentStatus = 'transporting';
        ambStatus = 'transporting';
        toastMessage = `🏥 Status: TRANSPORTING PATIENT TO ${hospital?.name || 'HOSPITAL'}`;
      } else if (missionStage === 'transporting') {
        nextStage = 'completed';
        incidentStatus = 'resolved';
        ambStatus = 'available';
        toastMessage = '✅ Mission Completed! Unit marked AVAILABLE.';
      }

      setMissionStage(nextStage);

      // 1. Sync Incident to database (traversing valid state machine paths)
      if (incident.id && incident.id.length > 8) {
        if (incidentStatus === 'arrived') {
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
        } else if (incidentStatus === 'transporting' && incident.status === 'en_route') {
          await updateIncidentStatus(incident.id, 'arrived').catch(() => {});
        }
        await updateIncidentStatus(incident.id, incidentStatus).catch(() => {});
      }

      // 2. Sync Ambulance to database (traversing valid state machine paths)
      if (ambulance?.id && ambulance.id.length > 8) {
        if (ambStatus === 'on_scene') {
          if (ambulance.status === 'available') {
            await updateAmbStatus(ambulance.id, 'dispatched', incident.id).catch(() => {});
            await updateAmbStatus(ambulance.id, 'en_route_to_incident', incident.id).catch(() => {});
          } else if (ambulance.status === 'dispatched') {
            await updateAmbStatus(ambulance.id, 'en_route_to_incident', incident.id).catch(() => {});
          }
        } else if (ambStatus === 'transporting' && ambulance.status === 'en_route_to_incident') {
          await updateAmbStatus(ambulance.id, 'on_scene', incident.id).catch(() => {});
        }
        await updateAmbStatus(ambulance.id, ambStatus, incident.id).catch(() => {});
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
      } else {
        const updated = { ...incident, status: incidentStatus as any };
        setIncident(updated);
        localStorage.setItem('resqgrid_active_incident_data', JSON.stringify(updated));
      }

      setIsUpdatingStatus(false);
      setStatusToast(toastMessage);
      setTimeout(() => setStatusToast(null), 4000);

      if (nextStage === 'completed') {
        setTimeout(() => {
          navigate('/ambulance/history');
        }, 1200);
      }
    } catch {
      setIsUpdatingStatus(false);
    }
  };

  // Live telemetry speedometer fluctuation simulation (48 - 62 km/h)
  useEffect(() => {
    const speedInterval = setInterval(() => {
      setSpeed((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(46, Math.min(64, prev + delta));
        return next;
      });
    }, 2500);

    return () => clearInterval(speedInterval);
  }, []);

  if (isLoading && !incident) {
    return (
      <div className="h-screen bg-[#061136] flex flex-col items-center justify-center text-white">
        <Spinner size="lg" />
        <p className="text-xs font-bold text-slate-300 mt-4">Initializing GPS Emergency Navigation & Deviations HUD...</p>
      </div>
    );
  }

  const patientAddress = incident?.address || '123 Medical Drive, Sector 4, Bengaluru';
  const hospitalName = hospital?.name || incident?.assigned_hospital_name || 'Victoria Hospital (BMCRI Trauma Care)';
  const callerName = incident?.reporter_name || 'Rahul Sharma (Citizen)';
  const callerPhone = incident?.reporter_phone || '+91 98765 43210';
  const assignedAmbNumber = ambulance?.ambulance_number || incident?.assigned_ambulance_number || 'KA-05-EA-4820 (ALS Unit)';
  const shortIncidentNum = incident?.incident_number
    ? `ER-${incident.incident_number}`
    : incident?.id && incident.id.length > 8
      ? `ER-${incident.id.slice(0, 6).toUpperCase()}`
      : incident?.id || 'ER-2048';

  const currentStep = activeDeviation.steps[currentStepIndex] || activeDeviation.steps[0];

  const mapRoute = {
    routeId: activeDeviation.id,
    provider: 'osrm' as const,
    distanceKm: activeDeviation.distanceKm,
    durationMinutes: activeDeviation.durationMinutes,
    polyline: activeDeviation.polyline,
    steps: [],
    greenWaveSignals: activeDeviation.signals.map((s) => ({
      ...s,
      preempted: s.status === 'preempted',
    })),
    trafficLevel: activeDeviation.trafficLevel,
  };

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'left':
        return <CornerUpLeft className="w-6 h-6 text-white" />;
      case 'right':
        return <CornerUpRight className="w-6 h-6 text-white" />;
      case 'arrive':
        return <CheckCircle2 className="w-6 h-6 text-emerald-300" />;
      default:
        return <ArrowUp className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="h-screen bg-[#061136] text-white font-sans flex flex-col overflow-hidden">
      {/* Top Banner Navigation Instructions (ResQGrid Midnight Navy Theme) */}
      <div className="bg-[#0B1B4F] border-b-2 border-emerald-500/50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-2xl z-20">
        <div className="min-w-0 flex flex-1 items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/ambulance')}
            className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/15 transition cursor-pointer active:scale-95"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-600/30 border border-emerald-400 shrink-0">
            {getManeuverIcon(currentStep.maneuver)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeDeviation.tag}
              </span>
              <span className="text-xs text-sky-300 font-bold hidden sm:inline-block">
                Unit: {assignedAmbNumber} • Call #{shortIncidentNum}
              </span>
              <span className="text-xs text-slate-300 font-medium hidden md:inline-block">
                • Patient: {callerName}
              </span>
            </div>
            <h1 className="text-sm sm:text-base lg:text-lg leading-tight font-black text-white mt-1 truncate">
              {currentStep.instruction}
            </h1>
          </div>
        </div>

        {/* Speedometer & ETA Countdown */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">SPEED</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {speed} <span className="text-xs font-bold text-slate-400">km/h</span>
            </span>
          </div>

          <div className="text-right border-l border-white/15 pl-4 sm:pl-6">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {String(activeDeviation.durationMinutes).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-slate-300">min</span>
            </div>
            <span className="text-[11px] text-sky-300 font-bold block">{activeDeviation.distanceKm} km to scene</span>
          </div>
        </div>
      </div>

      {/* Dynamic Route Deviations & Detour Options Bar */}
      <div className="bg-[#0A183D] border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none z-20">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <GitFork className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Route Deviations:
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {routeDeviations.map((dev) => {
            const isSelected = selectedDeviationId === dev.id;
            return (
              <button
                key={dev.id}
                onClick={() => {
                  setSelectedDeviationId(dev.id);
                  setCurrentStepIndex(0);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-sky-400 shadow-lg shadow-blue-600/30 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                }`}
              >
                <span className="font-extrabold">{dev.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {dev.durationMinutes}m ({dev.distanceKm}km)
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            // Recalculate / Reroute feedback
            const nextIdx = (routeDeviations.findIndex((d) => d.id === selectedDeviationId) + 1) % routeDeviations.length;
            setSelectedDeviationId(routeDeviations[nextIdx].id);
            setCurrentStepIndex(0);
          }}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition active:scale-95"
          title="Recalculate route deviations"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reroute Deviation</span>
        </button>
      </div>

      {/* Detour Alert Banner (If Primary has congestion or simulated detour recommended) */}
      {showDetourAlert && (
        <div className="bg-gradient-to-r from-red-950/95 via-[#0B1B4F] to-amber-950/95 border-b-2 border-amber-500/80 px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-20 shadow-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  TRAFFIC ADVISORY
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                  {simulatedTrafficEvent?.eventType || 'ROAD_BLOCKAGE'}
                </span>
              </div>
              <p className="text-amber-100 font-bold mt-0.5 truncate">
                {simulatedTrafficEvent?.description || 'Heavy surface congestion reported (+3 min delay).'} Primary ETA degraded to {primaryDuration} min. Elevated Bypass is 5 min (Saves 2 min).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedDeviationId !== 'route-elevated-bypass' && (
              <button
                onClick={handleSwitchToBypass}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>SWITCH TO ELEVATED BYPASS</span>
                <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono">5 MIN</span>
              </button>
            )}
            <button
              onClick={() => setShowDetourAlert(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Status Transition Toast */}
      {statusToast && (
        <div className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 text-center shadow-lg animate-pulse z-20 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Main Interactive Map Canvas with Active Green Corridor & Deviations */}
      <div className="flex-1 relative">
        <EmergencyMap
          center={{
            lat: (Number(ambulance?.current_latitude) || defaultAmbCoord.lat),
            lng: (Number(ambulance?.current_longitude) || defaultAmbCoord.lng),
          }}
          incidents={[
            {
              id: incident?.id || 'inc-1',
              incidentNumber: shortIncidentNum,
              type: (incident?.emergency_type as any) || 'medical',
              severity: 'critical',
              lat: Number(incident?.latitude) || defaultIncidentCoord.lat,
              lng: Number(incident?.longitude) || defaultIncidentCoord.lng,
              address: patientAddress,
            },
          ]}
          ambulances={[
            {
              id: ambulance?.id || 'amb-1',
              unitCode: assignedAmbNumber,
              type: (ambulance?.ambulance_type as any) || 'ALS',
              status: (ambulance?.status as any) || 'en_route',
              speedKmH: speed,
              heading: 45,
              lat: Number(ambulance?.current_latitude) || defaultAmbCoord.lat,
              lng: Number(ambulance?.current_longitude) || defaultAmbCoord.lng,
            },
          ]}
          hospitals={[
            {
              id: hospital?.id || 'hosp-1',
              name: hospitalName,
              traumaLevel: hospital?.trauma_level || 'Level 1',
              icuBedsAvailable: hospital?.available_icu_beds || hospital?.availableICUBeds || 12,
              lat: Number(hospital?.latitude) || defaultHospCoord.lat,
              lng: Number(hospital?.longitude) || defaultHospCoord.lng,
            },
          ]}
          showGreenCorridor={true}
          activeRoute={mapRoute}
          className="h-full rounded-none border-none"
        />

        {/* Turn Step Stepper & Deviation Stats Box Overlaid on Map */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
          <div className="bg-[#0B1B4F]/95 backdrop-blur-md border border-sky-400/50 rounded-2xl p-3 shadow-2xl text-xs space-y-2 max-w-xs text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                ACTIVE DEVIATION STATUS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeDeviation.signalsCount} Signals Preempted
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              {activeDeviation.description}
            </p>
            <div className="flex items-center justify-between text-[11px] font-bold pt-1">
              <span className="text-slate-400">Step {currentStepIndex + 1} of {activeDeviation.steps.length}:</span>
              <span className="text-emerald-400">{currentStep.distance} ({currentStep.duration})</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentStepIndex((prev) => (prev + 1) % activeDeviation.steps.length)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl border border-emerald-400 shadow-2xl backdrop-blur-md text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Next Turn ({currentStepIndex + 1}/{activeDeviation.steps.length})</span>
          </button>
        </div>
      </div>

      {/* Bottom Operational Action Bar */}
      <div className="bg-[#0B1B4F] border-t border-[#1E3A8A] p-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
              ALLOCATED DESTINATION HOSPITAL
            </span>
            <span className="text-xs sm:text-sm font-black text-white">{hospitalName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          <a
            href={`tel:${callerPhone}`}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded-2xl border border-white/15 transition cursor-pointer"
            title={`Call Patient / Caller (${callerPhone})`}
          >
            <Phone className="w-4 h-4" />
          </a>

          <button
            onClick={() => alert('Direct VHF Radio Channel 1 linked to Dispatch Command.')}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-2xl border border-white/15 transition cursor-pointer"
            title="Radio Dispatch Command"
          >
            <Radio className="w-4 h-4 animate-pulse" />
          </button>

          {/* Primary In-Navigation Mission Lifecycle Action Button */}
          {missionStage === 'en_route' && (
            <button
              onClick={handleAdvanceMissionStage}
              disabled={isUpdatingStatus}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              <span>{isUpdatingStatus ? 'UPDATING STATUS...' : 'MARK ARRIVED ON SCENE'}</span>
            </button>
          )}

          {missionStage === 'on_scene' && (
            <button
              onClick={handleAdvanceMissionStage}
              disabled={isUpdatingStatus}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Building2 className="w-4 h-4" />
              <span>{isUpdatingStatus ? 'UPDATING STATUS...' : 'START ER TRANSPORT TO HOSPITAL'}</span>
            </button>
          )}

          {missionStage === 'transporting' && (
            <button
              onClick={handleAdvanceMissionStage}
              disabled={isUpdatingStatus}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUpdatingStatus ? 'UPDATING STATUS...' : 'COMPLETE HANDOVER & MARK READY'}</span>
            </button>
          )}

          {missionStage === 'completed' && (
            <div className="px-5 py-2.5 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-2xl border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>MISSION COMPLETED</span>
            </div>
          )}

          {/* Secondary Button to Inspect Full Call Dossier */}
          <button
            onClick={() => navigate(`/ambulance/active?incidentId=${incident?.id || incidentId}`)}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-white/15 transition cursor-pointer text-xs font-bold flex items-center gap-1.5"
            title="Inspect Emergency Call Dossier"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Call Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;


