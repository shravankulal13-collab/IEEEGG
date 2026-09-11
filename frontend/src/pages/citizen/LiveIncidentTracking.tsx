// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Live Incident Tracking Screen (Stitch Reference 4)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Activity, Radio, FileText, Settings, HelpCircle, User, Compass, Plus, Minus } from 'lucide-react';

export const LiveIncidentTracking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId') || 'ER-2048';

  const [eta, setEta] = useState(6);
  const [distance, setDistance] = useState(2.4);

  // Simulated live telemetry movement update
  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
      setDistance((prev) => (prev > 0.3 ? Number((prev - 0.2).toFixed(1)) : 0.2));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-6 px-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            <h1 className="text-base font-bold tracking-tight text-slate-900">Emergency Intelligence</h1>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                742
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Unit 742</p>
                <p className="text-xs text-slate-500">Active Duty</p>
              </div>
            </div>
            <button className="w-full mt-3 py-1.5 px-3 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-semibold transition-colors">
              Go Offline
            </button>
          </div>

          <nav className="space-y-1">
            <button onClick={() => navigate('/citizen')} className="w-full flex items-center gap-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button onClick={() => navigate('/citizen/history')} className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
              <Activity className="w-4 h-4" />
              Incidents
            </button>
            <button onClick={() => navigate('/ambulance')} className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
              <Radio className="w-4 h-4" />
              Fleet
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
              <FileText className="w-4 h-4" />
              Reports
            </button>
          </nav>
        </div>

        <div className="space-y-1 border-t border-slate-200 pt-3">
          <button onClick={() => navigate('/citizen/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </div>
      </aside>

      {/* Main Tracking Area: Map + Right Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Live Map Area */}
        <div className="flex-1 relative bg-slate-200 overflow-hidden">
          {/* Map Image Background */}
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1400&q=80"
            alt="Live Tracking Map"
            className="w-full h-full object-cover filter contrast-105 brightness-95"
          />

          {/* Top Live Pill Overlay */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-2 text-xs font-bold text-slate-900 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{incidentId} | Live</span>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
            <button className="w-9 h-9 bg-white border border-slate-200 rounded-lg shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50">
              <Plus className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 bg-white border border-slate-200 rounded-lg shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50">
              <Minus className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 bg-white border border-slate-200 rounded-lg shadow-md flex items-center justify-center text-blue-600 hover:bg-slate-50">
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Simulated Route Line SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <path
              d="M 620 180 L 450 350 L 320 580"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray="8 6"
              fill="none"
            />
          </svg>

          {/* Citizen Location Marker */}
          <div className="absolute top-[180px] left-[620px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold bg-white/90 px-1.5 py-0.5 rounded shadow text-slate-800 mt-1">Citizen</span>
          </div>

          {/* Ambulance Location Marker */}
          <div className="absolute top-[350px] left-[450px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 animate-bounce">
            <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded shadow mt-1">AMB-104</span>
          </div>
        </div>

        {/* Right Information Panel */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto shrink-0">
          <div>
            {/* Header / Vehicle Info */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Ambulance<br />AMB-104</h2>
                <p className="text-xs text-slate-500 mt-1">Driver: Raj</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-extrabold tracking-wide uppercase border border-blue-200">
                EN ROUTE
              </span>
            </div>

            {/* Metrics Boxes (ETA & Distance) */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider">ETA</span>
                <span className="text-3xl font-extrabold text-blue-600">{String(eta).padStart(2, '0')}</span>
                <span className="text-xs font-bold text-slate-700 ml-1">min</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider">DISTANCE</span>
                <span className="text-3xl font-extrabold text-slate-900">{distance}</span>
                <span className="text-xs font-bold text-slate-700 ml-1">km</span>
              </div>
            </div>

            {/* Mission Status Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase mb-4">MISSION STATUS</h3>
              <div className="space-y-4 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="relative flex items-center gap-2 text-xs font-bold text-slate-900">
                  <div className="absolute -left-5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">
                    ✓
                  </div>
                  Dispatched
                </div>

                <div className="relative flex items-center gap-2 text-xs font-bold text-blue-600">
                  <div className="absolute -left-5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">
                    •
                  </div>
                  En Route
                </div>

                <div className="relative flex items-center gap-2 text-xs font-bold text-slate-300">
                  <div className="absolute -left-5 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                  Arrived
                </div>

                <div className="relative flex items-center gap-2 text-xs font-bold text-slate-300">
                  <div className="absolute -left-5 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                  Completed
                </div>
              </div>
            </div>
          </div>

          {/* Footer Live indicator */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live updating now
          </div>
        </aside>
      </div>
    </div>
  );
};
