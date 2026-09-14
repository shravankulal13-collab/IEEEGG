// ============================================================
// PRIMARY OWNER: Anush KD / khushi.shettyyy
// ROLE: Routing & Traffic Congestion
// MODULE: Live MapMyIndia Traffic Congestion Overlay
// ============================================================

import React from 'react';
import { Activity } from 'lucide-react';

export interface TrafficLayerProps {
  congestionLevel?: 'free_flow' | 'moderate' | 'heavy' | 'gridlock';
  averageSpeedKmH?: number;
  activeIncidentsCount?: number;
}

export const TrafficLayer: React.FC<TrafficLayerProps> = ({
  congestionLevel = 'moderate',
  averageSpeedKmH = 48,
  activeIncidentsCount = 2,
}) => {
  const getBadgeStyle = () => {
    switch (congestionLevel) {
      case 'free_flow':
        return { text: 'Free Flow (Green)', bg: 'bg-emerald-950/90', border: 'border-emerald-500/50', color: 'text-emerald-400' };
      case 'heavy':
      case 'gridlock':
        return { text: 'Heavy Bottleneck', bg: 'bg-red-950/90', border: 'border-red-500/50', color: 'text-red-400' };
      default:
        return { text: 'Moderate Flow', bg: 'bg-amber-950/90', border: 'border-amber-500/50', color: 'text-amber-400' };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
      <div className={`${style.bg} backdrop-blur-md border ${style.border} rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2.5 text-white`}>
        <Activity className={`w-4 h-4 ${style.color}`} />
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black tracking-wide ${style.color}`}>
              {style.text}
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              Avg: {averageSpeedKmH} km/h
            </span>
          </div>
          <p className="text-[9px] text-slate-400">
            {activeIncidentsCount} traffic events actively avoided by route engine
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafficLayer;
