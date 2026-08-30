// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Turn-by-Turn Navigation UI
// ============================================================

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId') || 'ER-2048';

  return (
    <div className="h-screen bg-slate-900 text-white font-sans flex flex-col overflow-hidden">
      {/* Top Banner Navigation Instructions */}
      <div className="bg-blue-700 px-6 py-4 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white text-blue-700 flex items-center justify-center font-black text-2xl shadow">
            ➔
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">NEXT TURN IN 200m</span>
            <h1 className="text-xl font-black text-white">Turn Right onto Medical Drive</h1>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-white">06 min</span>
          <span className="text-xs text-blue-200 block">2.4 km remaining</span>
        </div>
      </div>

      {/* Main Turn-by-Turn Map Canvas */}
      <div className="flex-1 relative bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1400&q=80"
          alt="Driver Navigation Map"
          className="w-full h-full object-cover filter contrast-125 brightness-90"
        />

        {/* Route Overlay SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <path
            d="M 300 700 L 480 400 L 700 220"
            stroke="#3b82f6"
            strokeWidth="6"
            fill="none"
          />
        </svg>

        {/* Current Ambulance Marker */}
        <div className="absolute top-[400px] left-[480px] -translate-x-1/2 -translate-y-1/2 z-10 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-red-600 border-4 border-white flex items-center justify-center shadow-2xl">
            🚑
          </div>
        </div>

        {/* Destination Marker */}
        <div className="absolute top-[220px] left-[700px] -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg">
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Bottom Operational Action Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 px-6 flex items-center justify-between z-20">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block">DESTINATION</span>
          <span className="text-sm font-bold text-white">123 Medical Drive ({incidentId})</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Calling dispatch center...')}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700"
          >
            <Phone className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={() => navigate(`/ambulance/active?incidentId=${incidentId}`)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors"
          >
            Update Operational Status
          </button>
        </div>
      </div>
    </div>
  );
};
