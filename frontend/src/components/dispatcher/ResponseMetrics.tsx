// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Response Metrics Diagnostic Component
// ============================================================

import React from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, Zap } from 'lucide-react';

export interface ResponseMetricsProps {
  dispatchLatencyMs?: number;
  slaPercent?: number;
  className?: string;
}

export const ResponseMetrics: React.FC<ResponseMetricsProps> = ({
  dispatchLatencyMs = 328,
  slaPercent = 99.4,
  className = '',
}) => {
  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>SLA & Latency Metrics</span>
        </h4>
        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Compliant
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-bold">DISPATCH LATENCY</span>
          <span className="text-base font-black text-purple-600 font-mono">{dispatchLatencyMs} ms</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-bold">SLA ACCURACY</span>
          <span className="text-base font-black text-emerald-600 font-mono">{slaPercent}%</span>
        </div>
      </div>
    </Card>
  );
};

export default ResponseMetrics;
