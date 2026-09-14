// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Candidate Responders List Component
// ============================================================

import React from 'react';
import { Ambulance, ArrowRight } from 'lucide-react';
import { DispatchScore } from './DispatchScore';
import { Button } from '../ui/Button';

export interface DispatchCandidate {
  id: string;
  unitCode: string;
  type: string;
  distanceKm: number;
  etaMinutes: number;
  score: number;
  driver: string;
}

export interface DispatchCandidateListProps {
  candidates: DispatchCandidate[];
  onDispatchUnit?: (unitId: string) => void;
  className?: string;
}

export const DispatchCandidateList: React.FC<DispatchCandidateListProps> = ({
  candidates,
  onDispatchUnit,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {candidates.map((cand) => (
        <div
          key={cand.id}
          className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Ambulance className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">{cand.unitCode}</span>
                <span className="text-[10px] text-slate-500 font-medium">({cand.type})</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {cand.distanceKm} km away | ETA: <strong className="text-slate-800">{cand.etaMinutes} min</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DispatchScore score={cand.score} />
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDispatchUnit?.(cand.id)}
            >
              <span>Assign</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DispatchCandidateList;
