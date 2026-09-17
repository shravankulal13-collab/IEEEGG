// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / khushi.shettyyy
// ROLE: Citizen & Ambulance Visualization
// MODULE: Live Animated Ambulance Vehicle Marker
// ============================================================

import React from 'react';
import { Navigation, Ambulance } from 'lucide-react';

export interface AmbulanceMarkerProps {
  id: string;
  unitCode: string;
  type?: 'ALS' | 'BLS' | 'MICU';
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'transporting';
  speedKmH?: number;
  heading?: number;
  driverName?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const AmbulanceMarker: React.FC<AmbulanceMarkerProps> = ({
  unitCode,
  type = 'ALS',
  status,
  speedKmH = 68,
  heading = 45,
  driverName = 'Officer Raj',
  onClick,
  selected = false,
}) => {
  const isEnRoute = status === 'en_route' || status === 'dispatched' || status === 'transporting';

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-transform group ${selected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}`}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Pulse Beacon Rings when En Route */}
      {isEnRoute && (
        <>
          <div className="absolute -inset-3 rounded-full bg-red-600/30 animate-ping pointer-events-none" />
          <div className="absolute -inset-1.5 rounded-full bg-blue-600/40 animate-pulse pointer-events-none" />
        </>
      )}

      {/* Main Vehicle Marker Body */}
      <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl shadow-2xl border-2 transition-all ${
        selected
          ? 'bg-[#0B1B4F] border-red-500 shadow-red-500/40'
          : 'bg-[#070F1E] border-blue-500/70 shadow-blue-900/50'
      }`}>
        <Ambulance className="w-6 h-6 text-red-400" />

        {/* Emergency Beacon Flash */}
        {isEnRoute && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border border-white animate-bounce" />
        )}
      </div>

      {/* Heading Direction Arrow */}
      {heading !== undefined && (
        <div
          className="w-4 h-4 text-blue-400 -mt-1 transition-transform"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <Navigation className="w-4 h-4 fill-blue-400" />
        </div>
      )}

      {/* Callout Information Badge */}
      <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#0B1B4F]/95 border border-blue-400/40 text-white shadow-lg text-[10px] font-black tracking-tight whitespace-nowrap flex items-center gap-1.5">
        <span className="text-red-400 font-extrabold">{unitCode}</span>
        <span className="text-emerald-400">{type}</span>
        {speedKmH > 0 && (
          <span className="text-amber-300 font-mono">{speedKmH} km/h</span>
        )}
      </div>

      {/* Hover Card Dossier */}
      <div className="hidden group-hover:block absolute bottom-full mb-2 bg-[#0B1B4F]/95 backdrop-blur-md border border-blue-500/40 rounded-xl p-2.5 shadow-2xl text-left w-44 z-50 pointer-events-none">
        <div className="flex items-center justify-between text-[11px] font-bold text-white border-b border-blue-900/60 pb-1 mb-1">
          <span>{unitCode} ({type})</span>
          <span className="text-emerald-400 uppercase text-[9px]">{status.replace('_', ' ')}</span>
        </div>
        <p className="text-[10px] text-slate-300">Driver: {driverName}</p>
        <p className="text-[10px] text-slate-300">Telemetry: GPS Active</p>
      </div>
    </div>
  );
};

export default AmbulanceMarker;
