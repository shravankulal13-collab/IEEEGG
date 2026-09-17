// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Interactive Route Intelligence Panel Component
// ============================================================

import React from 'react';
import { Card } from '../ui/Card';
import { Zap } from 'lucide-react';
import { RouteComparison } from './RouteComparison';
import { type RouteAlternativeCardProps } from './RouteAlternativeCard';

export interface RoutePanelProps {
  routes: RouteAlternativeCardProps[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  className?: string;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  className = '',
}) => {
  return (
    <Card className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">ROUTE CORRIDORS</span>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Green Wave Routing Options</span>
          </h3>
        </div>
        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200">
          Preemption Active
        </span>
      </div>

      <RouteComparison
        routes={routes}
        selectedRouteId={selectedRouteId}
        onSelectRoute={onSelectRoute}
      />
    </Card>
  );
};

export default RoutePanel;
