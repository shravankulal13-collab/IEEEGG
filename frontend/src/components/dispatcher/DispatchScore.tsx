// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Multi-Criteria Dispatch Proximity Score Component
// ============================================================

import React from 'react';

export interface DispatchScoreProps {
  score: number; // 0 to 100
  label?: string;
  className?: string;
}

export const DispatchScore: React.FC<DispatchScoreProps> = ({
  score,
  label = 'Proximity Match',
  className = '',
}) => {
  const getColor = () => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-black ${getColor()} ${className}`}>
      <span>{score.toFixed(1)}%</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    </div>
  );
};

export default DispatchScore;
