// ============================================================
// PRIMARY OWNER: Anush KD / khushi.shettyyy
// ROLE: Routing & Resilience
// MODULE: Alternative Route Comparison HUD
// ============================================================

import React from 'react';

export interface AlternativeRouteLayerProps {
  alternativeRoutes?: {
    id: string;
    name: string;
    timeDeltaMinutes: number;
    distanceKm: number;
    hasTolls?: boolean;
  }[];
  onSelectRoute?: (id: string) => void;
}

export const AlternativeRouteLayer: React.FC<AlternativeRouteLayerProps> = ({
  alternativeRoutes = [
    { id: 'alt-1', name: 'Via Outer Bypass', timeDeltaMinutes: 4, distanceKm: 6.2 },
    { id: 'alt-2', name: 'Via Central Arterial', timeDeltaMinutes: 7, distanceKm: 5.8 },
  ],
  onSelectRoute,
}) => {
  return (
    <div className="absolute top-20 left-4 z-20 space-y-1.5 pointer-events-auto">
      {alternativeRoutes.map((route) => (
        <button
          key={route.id}
          onClick={() => onSelectRoute?.(route.id)}
          className="bg-[#0A192F]/85 hover:bg-[#0B1B4F] backdrop-blur-md border border-slate-700 hover:border-blue-400 rounded-xl px-3 py-1.5 shadow-lg text-left text-white text-xs flex items-center justify-between gap-3 transition"
        >
          <div>
            <span className="font-bold text-slate-200 block">{route.name}</span>
            <span className="text-[10px] text-slate-400">{route.distanceKm} km</span>
          </div>
          <span className="text-amber-400 font-mono font-bold text-[11px]">
            +{route.timeDeltaMinutes} min
          </span>
        </button>
      ))}
    </div>
  );
};

export default AlternativeRouteLayer;
