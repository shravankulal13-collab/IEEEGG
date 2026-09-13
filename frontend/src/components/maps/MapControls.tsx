// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Map Operational Controls & Layer Toggles
// ============================================================

import React from 'react';
import {
  Crosshair,
  Truck,
  AlertOctagon,
  Maximize2,
} from 'lucide-react';
import { useMapStore } from '../../store/mapStore';

interface MapControlsProps {
  onResetView?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({ onResetView }) => {
  const {
    showIncidents,
    showAmbulances,
    showHospitals,
    toggleLayer,
    triggerFit,
  } = useMapStore();

  return (
    <>
      {/* Top Right Action Stack */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto select-none">
        <div className="bg-[#07133A]/90 backdrop-blur-md rounded-xl shadow-xl border border-blue-900/40 p-1 flex flex-col gap-1 min-w-[95px]">
          <button
            type="button"
            onClick={() => triggerFit('all')}
            title="Fit view to all operations"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#0B1B4A] hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fit All</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('incidents')}
            title="Toggle incidents"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showIncidents
                ? 'text-white bg-red-950/50 border border-red-900/40'
                : 'text-slate-400 hover:bg-[#0B1B4A]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-[#FF1F2D]" />
            <span>Incidents</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('ambulances')}
            title="Toggle fleet"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showAmbulances
                ? 'text-white bg-blue-950/50 border border-blue-800/40'
                : 'text-slate-400 hover:bg-[#0B1B4A]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fleet</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('hospitals')}
            title="Toggle hospitals"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showHospitals
                ? 'text-white bg-emerald-950/50 border border-emerald-800/40'
                : 'text-slate-400 hover:bg-[#0B1B4A]'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">
              H
            </span>
            <span>Hospitals</span>
          </button>

          {onResetView && (
            <button
              type="button"
              onClick={onResetView}
              title="Reset to center coordinates"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#0B1B4A] hover:text-white transition-colors border-t border-blue-900/30 mt-0.5"
            >
              <Crosshair className="w-3.5 h-3.5 text-slate-400" />
              <span>Center</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Right Zoom Controls matching screenshot: + / — / 🎯 */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1 pointer-events-auto select-none">
        <div className="bg-[#07133A]/90 backdrop-blur-md rounded-xl shadow-xl border border-blue-900/40 p-1 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => useMapStore.getState().setZoom(useMapStore.getState().zoom + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-200 hover:bg-[#0B1B4A] hover:text-white text-sm font-bold transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => useMapStore.getState().setZoom(useMapStore.getState().zoom - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-200 hover:bg-[#0B1B4A] hover:text-white text-sm font-bold transition-colors"
            title="Zoom Out"
          >
            —
          </button>
          {onResetView && (
            <button
              type="button"
              onClick={onResetView}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#0B1B4A] hover:text-cyan-400 text-xs transition-colors border-t border-blue-900/40 pt-1"
              title="Center Location"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
