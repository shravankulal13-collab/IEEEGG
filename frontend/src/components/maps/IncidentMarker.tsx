// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet / khushi.shettyyy
// ROLE: Citizen & Dispatch Visualization
// MODULE: Live Urgent Incident Location Marker
// ============================================================

import React from 'react';
import { Home, Flame, HeartPulse, Activity } from 'lucide-react';

export interface IncidentMarkerProps {
  id: string;
  incidentNumber?: string;
  type?: 'cardiac' | 'trauma' | 'fire' | 'accident' | 'home' | string;
  severity?: 'critical' | 'high' | 'moderate' | 'low';
  victimCount?: number;
  reportedTime?: string;
  address?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const IncidentMarker: React.FC<IncidentMarkerProps> = ({
  incidentNumber,
  type = 'home',
  victimCount = 1,
  address,
  onClick,
  selected = false,
}) => {
  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'cardiac':
        return <HeartPulse className="w-5 h-5 text-white" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-white" />;
      case 'trauma':
      case 'accident':
        return <Activity className="w-5 h-5 text-white" />;
      case 'home':
        return <Home className="w-5 h-5 text-white" />;
      default:
        return <Home className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-transform group ${selected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}`}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Pulse Halo */}
      <div className="absolute -inset-2 rounded-full bg-slate-800/30 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />

      {/* Main Origin Badge (Matches Reference Image) */}
      <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#272B30] text-white shadow-xl border-[2.5px] border-white transition-all">
        {getIcon()}
      </div>

      {/* Stem Line connecting badge to ground anchor dot */}
      <div className="w-[2.5px] h-3 bg-[#272B30] -my-0.5" />

      {/* Ground Anchor Dot on exact GPS coordinate */}
      <div className="w-3.5 h-3.5 rounded-full bg-[#1E293B] border-2 border-white shadow-md ring-2 ring-slate-900/40" />

      {/* Optional Incident Label Badge */}
      {incidentNumber && (
        <div className="mt-1 px-2 py-0.5 rounded-full bg-[#1E293B]/90 backdrop-blur-sm border border-slate-600/60 text-white shadow-lg text-[9px] font-bold tracking-tight whitespace-nowrap">
          <span className="text-slate-200">{incidentNumber}</span>
        </div>
      )}

      {/* Hover Card Dossier */}
      <div className="hidden group-hover:block absolute bottom-full mb-2 bg-[#0B1B4F]/95 backdrop-blur-md border border-red-500/50 rounded-xl p-2.5 shadow-2xl text-left w-48 z-50 pointer-events-none">
        <div className="flex items-center justify-between text-[11px] font-bold text-white border-b border-red-900/60 pb-1 mb-1">
          <span className="text-red-400 font-extrabold">{incidentNumber}</span>
          <span className="text-red-400 uppercase text-[9px] font-black">CODE RED</span>
        </div>
        <p className="text-[10px] text-slate-200 capitalize">Type: {type}</p>
        <p className="text-[10px] text-slate-300">Victims: {victimCount}</p>
        {address && <p className="text-[10px] text-slate-400 truncate mt-0.5">{address}</p>}
      </div>
    </div>
  );
};

export default IncidentMarker;
