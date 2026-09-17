// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Driver Home Dashboard (ResQGrid Cockpit)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';

export const AmbulanceHome: React.FC = () => {
  const navigate = useNavigate();
  const [dutyStatus, setDutyStatus] = useState<'available' | 'offline'>('available');
  const [hasAssignment] = useState(true);

  return (
    <AppShell sidebarVariant='top'>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Animated Flagship Cockpit Hero */}
        <HeroSection
          badgeText=""
          headingPrefix="Navigate Fast"
          typewriterPhrases={[
            'Green Signal Corridors',
            'Pre-Arrival Vitals Streams',
            'Turn-by-Turn GPS Routes',
            'Life Support Protocols'
          ]}
          headingSuffix="with ResQGrid"
          subtitle="Unit AMB-104 (Advanced Life Support) | Real-time traffic clearance, high-frequency telemetry, and direct trauma ER routing."
          primaryCta={{
            label: "Open Navigation & Map",
            onClick: () => navigate('/ambulance/navigation'),
            variant: "red"
          }}
          secondaryCta={{
            label: dutyStatus === 'available' ? 'Status: ON DUTY' : 'Status: OFF DUTY',
            onClick: () => setDutyStatus(dutyStatus === 'available' ? 'offline' : 'available')
          }}
          tickerItems={[
            { text: 'Unit AMB-104 (ALS)' },
            { text: 'Speed: 72 km/h' },
            { text: 'GPS Accuracy: ±3.2m' },
            { text: 'O2 Tank: 98% Full' },
            { text: 'Defibrillator: Ready' }
          ]}
        />

        {/* Live Active Emergency Assignment Banner (Deep Navy + Urgent Crimson) */}
        {hasAssignment && (
          <div className="bg-gradient-to-r from-[#0B1B4F] via-[#0A192F] to-[#070F1E] border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(229,9,20,0.25)] relative overflow-hidden text-white">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black tracking-widest uppercase animate-pulse">
                    PRIORITY DISPATCH ASSIGNMENT
                  </span>
                  <span className="text-xs font-mono text-red-300 font-bold">
                    Incident ER-2048
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Severe Cardiac Arrest & Trauma
                </h2>

                <p className="text-sm text-slate-300 flex items-center gap-2">

                  <span>123 Medical Drive, Sector 4 | Distance: 1.8 km</span>
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
                onClick={() => navigate('/ambulance/active?incidentId=ER-2048')}
                className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-red-600 to-[#B80710] hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition active:scale-95"
              >
                ACCEPT & RESPOND NOW
              </button>

              <button
                onClick={() => navigate('/ambulance/navigation?incidentId=ER-2048')}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition"
              >

                View Turn-by-Turn GPS
              </button>

              <button
                onClick={() => navigate('/ambulance/dispatch?incidentId=ER-2048')}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition"
              >

                Dispatch Dossier
              </button>
            </div>
          </div>
        )}

        {/* 4-Card Cockpit Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            onClick={() => navigate('/ambulance/active')}
            className="cursor-pointer hover-lift p-5 border border-slate-200 shadow-md bg-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">

            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                Active Emergency
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage triage lifecycle & vitals</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-red-600">
              <span>Open Triage</span>

            </div>
          </Card>

          <Card
            onClick={() => navigate('/ambulance/navigation')}
            className="cursor-pointer hover-lift p-5 border border-slate-200 shadow-md bg-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">

            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Turn-by-Turn GPS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Preempted green signal corridors</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600">
              <span>Launch Navigation</span>

            </div>
          </Card>

          <Card
            onClick={() => navigate('/ambulance/status')}
            className="cursor-pointer hover-lift p-5 border border-slate-200 shadow-md bg-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">

            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Vehicle Readiness
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Oxygen, battery & defibrillator</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-emerald-600">
              <span>Check Equipment</span>

            </div>
          </Card>

          <Card
            onClick={() => navigate('/ambulance/history')}
            className="cursor-pointer hover-lift p-5 border border-slate-200 shadow-md bg-white space-y-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">

            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                Trip History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Past emergency mission logs</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-purple-600">
              <span>View Logs</span>

            </div>
          </Card>
        </div>

        {/* Telemetry & Pre-Arrival Hospital Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Telemetry Readiness Card */}
          <div className="bg-[#0B1B4F] border border-blue-500/30 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <h3 className="text-xs font-black text-blue-200 uppercase tracking-wider">VEHICLE TELEMETRY STATUS</h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60">NOMINAL</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">MapMyIndia GPS Accuracy:</span>
                <span className="font-bold text-emerald-400">High Accuracy (3m)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">O2 Oxygen Cylinder:</span>
                <span className="font-bold text-blue-400">98% Full</span>
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
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">PRE-ARRIVED DESTINATION</span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">St. Jude Trauma Center (Level 1)</h3>
              </div>
              <Badge variant="success">ICU BAY RESERVED</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ICU BEDS</span>
                <span className="text-xl font-black text-emerald-600">4 Available</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">CATH LAB</span>
                <span className="text-xl font-black text-blue-600">Active / Ready</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">BLOOD BANK</span>
                <span className="text-xl font-black text-slate-900">O-Neg Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AmbulanceHome;
