// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Driver Home Dashboard
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Gauge, History, ShieldAlert, MapPin } from 'lucide-react';

export const AmbulanceHome: React.FC = () => {
  const navigate = useNavigate();
  const [dutyStatus, setDutyStatus] = useState<'available' | 'offline'>('available');
  const [hasAssignment] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
              🚑
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">AMB-104 (Unit 742)</h1>
              <p className="text-xs text-slate-400">Driver: Raj • Advanced Life Support</p>
            </div>
          </div>

          <button
            onClick={() => setDutyStatus(dutyStatus === 'available' ? 'offline' : 'available')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-all ${
              dutyStatus === 'available'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {dutyStatus === 'available' ? 'ON DUTY (AVAILABLE)' : 'GO ON DUTY'}
          </button>
        </header>

        {/* Active Emergency Dispatch Alert Card */}
        {hasAssignment && (
          <div className="bg-gradient-to-r from-red-950 to-slate-900 border-2 border-red-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-pulse">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black tracking-widest uppercase mb-2 inline-block">
                  NEW DISPATCH ASSIGNMENT
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white mt-1">Incident ER-2048 (Medical)</h2>
                <p className="text-xs text-red-200 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  123 Medical Drive, High-Fidelity City
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">ESTIMATED ETA</span>
                <span className="text-3xl font-black text-red-400">06 min</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => navigate('/ambulance/active?incidentId=ER-2048')}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors text-center"
              >
                ACCEPT & RESPOND NOW
              </button>
              <button
                onClick={() => navigate('/ambulance/navigation?incidentId=ER-2048')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700"
              >
                View Map
              </button>
            </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/ambulance/active')}
            className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl text-left transition-all group"
          >
            <ShieldAlert className="w-6 h-6 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white">Active Emergency</h3>
            <p className="text-[10px] text-slate-400 mt-1">Manage current response</p>
          </button>

          <button
            onClick={() => navigate('/ambulance/navigation')}
            className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl text-left transition-all group"
          >
            <Navigation className="w-6 h-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white">Navigation</h3>
            <p className="text-[10px] text-slate-400 mt-1">Turn-by-turn route view</p>
          </button>

          <button
            onClick={() => navigate('/ambulance/status')}
            className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl text-left transition-all group"
          >
            <Gauge className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white">Vehicle Status</h3>
            <p className="text-[10px] text-slate-400 mt-1">Telemetry & readiness</p>
          </button>

          <button
            onClick={() => navigate('/ambulance/history')}
            className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl text-left transition-all group"
          >
            <History className="w-6 h-6 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-white">Trip History</h3>
            <p className="text-[10px] text-slate-400 mt-1">Past response logs</p>
          </button>
        </div>

        {/* Readiness Dashboard */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">VEHICLE READINESS</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block">GPS TELEMETRY</span>
              <span className="text-sm font-extrabold text-emerald-400">HIGH ACCURACY (3m)</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block">O2 CYLINDER</span>
              <span className="text-sm font-extrabold text-blue-400">98% FULL</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block">DEFIBRILLATOR</span>
              <span className="text-sm font-extrabold text-emerald-400">READY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
