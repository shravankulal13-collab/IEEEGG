// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Route Comparison Matrix Component
// ============================================================

import React from 'react';
import { RouteAlternativeCard, type RouteAlternativeCardProps } from './RouteAlternativeCard';

export interface RouteComparisonProps {
  routes: RouteAlternativeCardProps[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  className?: string;
}

export const RouteComparison: React.FC<RouteComparisonProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {routes.map((rt) => (
        <RouteAlternativeCard
          key={rt.id}
          {...rt}
          selected={rt.id === selectedRouteId}
          onSelect={() => onSelectRoute?.(rt.id)}
        />
      ))}
    </div>
  );
};

export default RouteComparison;
