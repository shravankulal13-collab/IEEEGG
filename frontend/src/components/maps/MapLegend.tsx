// ============================================================
// PRIMARY OWNER: khushi.shettyyy / SK
// ROLE: Command Center Visualization
// MODULE: ResQGrid Map HUD Legend Component
// ============================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Ambulance } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
      <div className="bg-[#0B1B4F]/95 backdrop-blur-md border border-blue-500/40 rounded-2xl p-3 shadow-2xl text-white text-xs max-w-[220px]">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between font-extrabold text-[11px] tracking-wide text-blue-200 cursor-pointer border-b border-blue-900/60 pb-1.5"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            MAP HUD LEGEND
          </span>
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>

        {!collapsed && (
          <div className="mt-2 space-y-1.5 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" style={{ animationDuration: '2s' }} />
              <span className="text-slate-200">Critical SOS Incident</span>
            </div>
            <div className="flex items-center gap-2">
              <Ambulance className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-slate-200">ALS / BLS Ambulance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white text-[8px] flex items-center justify-center font-bold">H</span>
              <span className="text-slate-200">Medical Center (ICU Ready)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-1 rounded-full bg-emerald-400" />
              <span className="text-slate-200">Green Wave Corridor</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapLegend;
