// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Map & Routing Service Provider Status Badge
// ============================================================

import React from 'react';
import { Badge } from '../ui/Badge';

export interface ProviderStatusProps {
  providerName?: string;
  isOnline?: boolean;
  latencyMs?: number;
  className?: string;
}

export const ProviderStatus: React.FC<ProviderStatusProps> = ({
  providerName = 'TomTom Routing',
  isOnline = true,
  latencyMs = 18,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs ${className}`}>
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="font-bold text-slate-800">{providerName}</span>
      <Badge variant={isOnline ? 'success' : 'danger'}>
        {isOnline ? `${latencyMs}ms` : 'OFFLINE'}
      </Badge>
    </div>
  );
};

export default ProviderStatus;
