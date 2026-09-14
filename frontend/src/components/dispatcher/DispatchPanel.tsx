// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Interactive Dispatch Control Panel Component
// ============================================================

import React from 'react';
import { Card } from '../ui/Card';
import { DispatchCandidateList, type DispatchCandidate } from './DispatchCandidateList';

export interface DispatchPanelProps {
  incidentId: string;
  incidentType: string;
  candidates: DispatchCandidate[];
  onDispatch: (unitId: string) => void;
  className?: string;
}

export const DispatchPanel: React.FC<DispatchPanelProps> = ({
  incidentId,
  incidentType,
  candidates,
  onDispatch,
  className = '',
}) => {
  return (
    <Card className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">DISPATCH MATRIX</span>
          <h3 className="text-sm font-extrabold text-slate-900">{incidentType} ({incidentId})</h3>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-mono font-bold">
          {candidates.length} Available Units
        </span>
      </div>

      <DispatchCandidateList candidates={candidates} onDispatchUnit={onDispatch} />
    </Card>
  );
};

export default DispatchPanel;
