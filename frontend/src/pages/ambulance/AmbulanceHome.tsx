// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Driver Home Dashboard (ResQGrid Cockpit)
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { type IncidentRecord } from '../../services/incident.service';
import { AppShell } from '../../components/layout/AppShell';
import { HeroSection } from '../../components/layout/HeroSection';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Navigation,
  Gauge,
  History,
  ShieldAlert,
  MapPin,
  Zap,
  ArrowRight,
  GitFork,
  Radio,
  Clock,
  HeartPulse,
} from 'lucide-react';

export const AmbulanceHome: React.FC = () => {
  const navigate = useNavigate();
  const [dutyStatus, setDutyStatus] = useState<'available' | 'offline'>('available');
  const [activeIncident, setActiveIncident] = useState<IncidentRecord | null>(null);

  useEffect(() => {
    // 1. Check local storage / session for the most recent citizen emergency request
    const storedData = localStorage.getItem('resqgrid_active_incident_data');
    const storedId = localStorage.getItem('resqgrid_active_incident_id');
    const storeActive = useIncidentStore.getState().activeIncident;

    let initialActive: IncidentRecord | null = null;
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed && !['resolved', 'cancelled', 'false_report'].includes(parsed.status)) {
          initialActive = parsed;
        }
      } catch {
        // ignore parse failure
      }
    } else if (storeActive && !['resolved', 'cancelled', 'false_report'].includes(storeActive.status)) {
      initialActive = storeActive;
    }

    if (initialActive) {
      setActiveIncident(initialActive);
    }

    // 2. Fetch fresh list from backend API
    useIncidentStore
      .getState()
      .fetchIncidents()
      .then(() => {
        const list = useIncidentStore.getState().incidents;
        const validList = list.filter((i) =>
          !['resolved', 'cancelled', 'false_report'].includes(i.status) &&
          !(i.title && i.title.toLowerCase().includes('robbery')) &&
          !(i.title && i.title.toLowerCase().includes('test'))
        );

        // If a specific stored incident ID exists, find it
        const matched = storedId ? validList.find((i) => i.id === storedId) : null;
        const active = matched || (storedData ? initialActive : (validList.length > 0 ? validList[0] : null));

        if (active && !['resolved', 'cancelled', 'false_report'].includes(active.status)) {
          setActiveIncident(active);
        } else {
          setActiveIncident(null);
        }
      })
      .catch(() => {
        if (!initialActive) {
          setActiveIncident(null);
        }
      });
  }, []);

  const incidentId = activeIncident?.id || '';
  const incidentTitle = activeIncident?.title || 'Emergency Medical Dispatch Response';
  const incidentAddress = activeIncident?.address || '123 Medical Drive, Sector 4, Bengaluru';

  return (
    <AppShell sidebarVariant='top'>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Animated Flagship Ambulance Driver Hero */}
        <HeroSection
          badgeText=""
          headingPrefix="Ambulance Fast Navigation &"
          typewriterPhrases={[
            'Emergency Response Routing',
            'Real-Time GPS Navigation',
            'Hospital Emergency Pre-Alerts',
            'Priority Traffic Clearance',
          ]}
          headingSuffix="with ResQGrid"
          subtitle="Unit AMB-104 (Advanced Life Support) | Live priority green routes, real-time dispatch alerts, and emergency ER navigation."
          primaryCta={{
            label: activeIncident ? "Open Navigation & Deviations" : "View Vehicle Readiness",
            onClick: () => activeIncident ? navigate(`/ambulance/navigation?incidentId=${incidentId}`) : navigate('/ambulance/status'),
            variant: "red"
          }}
          secondaryCta={{
            label: dutyStatus === 'available' ? 'Status: ON DUTY' : 'Status: OFF DUTY',
            onClick: () => setDutyStatus(dutyStatus === 'available' ? 'offline' : 'available')
          }}
          tickerItems={[
            { text: 'Unit AMB-104 (ALS)' },
            { text: 'Speed: 54 km/h (Nominal)' },
            { text: 'GPS Accuracy: ±2.8m' },
            { text: 'O2 Tank: 98% Full' },
            { text: 'Green Wave Corridor: Preempted' }
          ]}
        />

        {/* Live Active Emergency Assignment Banner (Deep Navy + Urgent Crimson) */}
        {activeIncident ? (
          <div className="bg-gradient-to-r from-[#0B1B4F] via-[#0A192F] to-[#070F1E] border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(229,9,20,0.25)] relative overflow-hidden text-white">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black tracking-widest uppercase animate-pulse flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" />
                    PRIORITY DISPATCH ASSIGNMENT
                  </span>
                  <span className="text-xs font-mono text-red-300 font-bold">
                    Incident {activeIncident.incident_number ? `ER-${activeIncident.incident_number}` : (incidentId.length > 8 ? `ER-${incidentId.slice(0, 6).toUpperCase()}` : incidentId)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ⚡ 3 Route Deviations Available
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {incidentTitle}
                </h2>

                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{incidentAddress}</span>
                </p>
              </div>

              <div className="flex items-center gap-6 self-start md:self-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">ESTIMATED ARRIVAL</span>
                  <span className="text-3xl sm:text-4xl font-black text-red-400 font-mono">04 min</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4 relative z-10">
              <button
                onClick={() => navigate(`/ambulance/active?incidentId=${incidentId}`)}
                className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-red-600 to-[#B80710] hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                ACCEPT & RESPOND NOW
              </button>

              <button
                onClick={() => navigate(`/ambulance/navigation?incidentId=${incidentId}`)}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl border border-sky-400/40 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <GitFork className="w-4 h-4 text-sky-300" />
                <span>GPS & Route Deviations</span>
              </button>

              <button
                onClick={() => navigate(`/ambulance/dispatch?incidentId=${incidentId}`)}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                Dispatch Dossier
              </button>
            </div>
          </div>
        ) : (
          /* Unit on Standby Banner when no active callout */
          <div className="bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      UNIT ON ACTIVE STANDBY
                    </span>
                    <span className="text-xs text-slate-300 font-bold">Unit AMB-104 (ALS)</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Ready & Available for Emergency Callouts
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Vehicle systems nominal • GPS live • Priority audio alert will sound automatically upon dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/ambulance/status')}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-white/15 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Vehicle Readiness
                </button>
                <button
                  onClick={() => navigate('/ambulance/history')}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/15 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Trip History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4-Card Cockpit Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            onClick={() => navigate('/ambulance/active')}
            className="cursor-pointer hover-lift p-5 border border-[#1E3A8A] shadow-xl bg-[#0B1B4F] text-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white group-hover:text-rose-400 transition-colors">
                Active Emergency
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">Manage triage lifecycle & vitals</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-rose-400">
              <span>Open Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card
            onClick={() => navigate('/ambulance/navigation')}
            className="cursor-pointer hover-lift p-5 border border-[#1E3A8A] shadow-xl bg-[#0B1B4F] text-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white group-hover:text-sky-400 transition-colors">
                Turn-by-Turn GPS
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">Preempted green signal corridors</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-sky-400">
              <span>Launch Navigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card
            onClick={() => navigate('/ambulance/status')}
            className="cursor-pointer hover-lift p-5 border border-[#1E3A8A] shadow-xl bg-[#0B1B4F] text-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                Vehicle Readiness
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">Oxygen, battery & defibrillator</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-emerald-400">
              <span>Check Equipment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card
            onClick={() => navigate('/ambulance/history')}
            className="cursor-pointer hover-lift p-5 border border-[#1E3A8A] shadow-xl bg-[#0B1B4F] text-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white group-hover:text-purple-400 transition-colors">
                Trip History
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">Past emergency mission logs</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-purple-400">
              <span>View Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        </div>

        {/* Telemetry & Pre-Arrival Hospital Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Telemetry Readiness Card */}
          <div className="bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-black text-sky-300 uppercase tracking-wider">VEHICLE TELEMETRY STATUS</h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">NOMINAL</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">GPS Navigation Precision:</span>
                <span className="font-bold text-emerald-400">High Precision (3m)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">O2 Oxygen Cylinder:</span>
                <span className="font-bold text-sky-400">98% Full</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Defibrillator & ECG:</span>
                <span className="font-bold text-emerald-400">Calibrated & Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Vehicle Battery:</span>
                <span className="font-bold text-white">14.2V (Normal)</span>
              </div>
            </div>
          </div>

          {/* Destination Hospital Status */}
          <div className="lg:col-span-2 bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl p-6 shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">PRE-ARRIVED DESTINATION</span>
                <h3 className="text-base font-black text-white mt-0.5">St. Jude Medical Center (Level 1)</h3>
              </div>
              <Badge variant="success">ICU BAY RESERVED</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/60 rounded-2xl p-3 text-center border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ICU BEDS</span>
                <span className="text-xl font-black text-emerald-400">4 Available</span>
              </div>
              <div className="bg-slate-900/60 rounded-2xl p-3 text-center border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">CATH LAB</span>
                <span className="text-xl font-black text-sky-400">Active / Ready</span>
              </div>
              <div className="bg-slate-900/60 rounded-2xl p-3 text-center border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">BLOOD BANK</span>
                <span className="text-xl font-black text-rose-400">O-Neg Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AmbulanceHome;
