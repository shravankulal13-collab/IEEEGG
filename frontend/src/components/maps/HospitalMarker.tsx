// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde / khushi.shettyyy
// ROLE: Hospital & Trauma Center Visualization
// MODULE: Hospital Destination Marker with Real-time Capacity
// ============================================================

import React from 'react';
import { Building2, Store } from 'lucide-react';

export interface HospitalMarkerProps {
  id: string;
  name: string;
  traumaLevel?: 'Level 1' | 'Level 2' | 'Level 3' | string;
  icuBedsAvailable?: number;
  cathLabReady?: boolean;
  distanceKm?: number;
  onClick?: () => void;
  selected?: boolean;
}

export const HospitalMarker: React.FC<HospitalMarkerProps> = ({
  name,
  traumaLevel = 'Level 1',
  icuBedsAvailable = 4,
  distanceKm,
  onClick,
  selected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-transform group ${selected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}`}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Cyan/Blue Ambient Glow */}
      <div className="absolute -inset-2 rounded-full bg-sky-400/30 animate-pulse pointer-events-none" />

      {/* Main Destination Badge (Matches Reference Image) */}
      <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#0080FF] text-white shadow-xl border-[2.5px] border-white transition-all">
        <Store className="w-5 h-5 text-white" />
      </div>

      {/* Stem Line connecting badge to ground anchor dot */}
      <div className="w-[2.5px] h-3 bg-[#0080FF] -my-0.5" />

      {/* Ground Anchor Dot on exact destination GPS coordinate */}
      <div className="w-3.5 h-3.5 rounded-full bg-[#0080FF] border-2 border-white shadow-md ring-2 ring-blue-500/40" />

      {/* Hospital Callout Pill */}
      <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#0B1B4F]/95 border border-sky-400/50 text-white shadow-lg text-[10px] font-black tracking-tight whitespace-nowrap flex items-center gap-1.5">
        <span className="text-sky-300 font-extrabold truncate max-w-[120px]">{name}</span>
        {icuBedsAvailable !== undefined && <span className="text-sky-400 font-mono">{icuBedsAvailable} ICU</span>}
      </div>

      {/* Hover Card Dossier */}
      <div className="hidden group-hover:block absolute bottom-full mb-2 bg-[#0B1B4F]/95 backdrop-blur-md border border-sky-500/50 rounded-xl p-2.5 shadow-2xl text-left w-48 z-50 pointer-events-none">
        <div className="flex items-center justify-between text-[11px] font-bold text-white border-b border-sky-900/60 pb-1 mb-1">
          <span className="text-sky-400 font-extrabold">{name}</span>
          <span className="text-sky-300 uppercase text-[9px] font-black">{traumaLevel}</span>
        </div>
        <p className="text-[10px] text-sky-300">ICU Beds: {icuBedsAvailable} Available</p>
        <p className="text-[10px] text-slate-300">Resuscitation Bay: Ready</p>
        {distanceKm && <p className="text-[10px] text-slate-400 mt-0.5">{distanceKm} km from ambulance</p>}
      </div>
    </div>
  );
};

export default HospitalMarker;

