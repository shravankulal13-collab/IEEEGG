// ============================================================
// PRIMARY OWNER: Anush KD / khushi.shettyyy
// ROLE: Green Wave Corridor & Routing
// MODULE: Active Animated Emergency Corridor Polyline Layer
// ============================================================

import React from 'react';

export interface RouteLayerProps {
  coordinates?: [number, number][]; // [lat, lng] array
  color?: string;
  isGreenCorridor?: boolean;
  preemptedSignalsCount?: number;
}

export const RouteLayer: React.FC<RouteLayerProps> = ({
  color: _color = '#10B981',
  isGreenCorridor = true,
  preemptedSignalsCount = 3,
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 pointer-events-none">
      <div className="bg-[#0B1B4F]/90 backdrop-blur-md border border-emerald-500/50 rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2.5 text-white">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wide text-emerald-400 uppercase">
              {isGreenCorridor ? 'Green Wave Corridor Active' : 'Optimal Route'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-600/50">
              {preemptedSignalsCount} Signals Preempted
            </span>
          </div>
          <p className="text-[10px] text-slate-300">MapMyIndia Dynamic Traffic Preemption Enabled</p>
        </div>
      </div>
    </div>
  );
};

export default RouteLayer;
