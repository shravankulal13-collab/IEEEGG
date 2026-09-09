// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Vehicle Readiness & Telemetry Diagnostics
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, BatteryCharging } from 'lucide-react';

export const VehicleStatus: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/ambulance')}
          className="text-xs font-bold text-blue-400 hover:underline block"
        >
          ← Back to Driver Dashboard
        </button>

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black">Vehicle Diagnostics & Telemetry</h1>
            <p className="text-xs text-slate-400">AMB-104 • Unit 742 Readiness Controls</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-extrabold">
            SYSTEMS NOMINAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Radio className="w-5 h-5" />
              GPS & Telemetry Freshness
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">Signal Strength:</span>
                <span className="font-bold text-emerald-400">EXCELLENT (-65 dBm)</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">GPS Accuracy:</span>
                <span className="font-bold text-white">3 meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Telemetry Ping:</span>
                <span className="font-bold text-white">Just now (1s ago)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <BatteryCharging className="w-5 h-5" />
              Power & Equipment
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">Vehicle Battery:</span>
                <span className="font-bold text-emerald-400">14.2 V (Normal)</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">Medical O2 Tank:</span>
                <span className="font-bold text-blue-400">98% Capacity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suction & Vent:</span>
                <span className="font-bold text-emerald-400">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
