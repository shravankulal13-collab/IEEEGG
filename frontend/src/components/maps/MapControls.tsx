// ============================================================
// PRIMARY OWNER: khushi.shettyyy / SK
// ROLE: Command Center UI
// MODULE: Glassmorphic Map Navigation & Layer Controls
// ============================================================

import React from 'react';
import { Plus, Minus, Compass, Layers, Maximize2, RefreshCw } from 'lucide-react';

export interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
  onToggleLayer?: () => void;
  onToggleFullscreen?: () => void;
  onRefresh?: () => void;
  activeLayer?: 'standard' | 'dark' | 'satellite';
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onToggleLayer,
  onToggleFullscreen,
  onRefresh,
  activeLayer = 'dark',
}) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      {/* Zoom Controls Pill */}
      <div className="bg-[#0B1B4F]/90 backdrop-blur-md border border-blue-500/40 rounded-2xl shadow-2xl p-1 flex flex-col gap-1 text-white">
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Recenter & Telemetry Tools */}
      <div className="bg-[#0B1B4F]/90 backdrop-blur-md border border-blue-500/40 rounded-2xl shadow-2xl p-1 flex flex-col gap-1 text-white">
        <button
          onClick={onRecenter}
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-blue-600 flex items-center justify-center text-slate-200 hover:text-white transition"
          title="Recenter GPS"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleLayer}
          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
          title={`Layer: ${activeLayer}`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MapControls;
