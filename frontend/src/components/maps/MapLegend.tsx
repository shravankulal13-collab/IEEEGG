// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Map Operational Legend
// ============================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-[#07133A]/90 backdrop-blur-md rounded-xl shadow-xl border border-blue-900/40 p-3 max-w-[340px] pointer-events-auto select-none transition-all">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="text-xs font-bold text-white tracking-wide">
          Map Legend
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-white p-0.5"
          aria-label={collapsed ? 'Expand legend' : 'Collapse legend'}
        >
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-2 pt-2 border-t border-blue-900/30 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-300">
          {/* Column 1: Incidents */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF1F2D] shadow-[0_0_6px_#ef4444]" />
              <span>Critical Incident</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span>Low Priority</span>
            </div>
          </div>

          {/* Column 2: Fleet & Hospital */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400">🚑</span>
              <span className="truncate">Ambulance (Available)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400">🚑</span>
              <span className="truncate">Ambulance (En Route)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                H
              </span>
              <span>Hospital</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
