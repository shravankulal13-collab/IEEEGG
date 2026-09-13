// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Operational KPI Statistics Grid (6 Cards)
// ============================================================

import React from 'react';
import {
  AlertOctagon,
  Truck,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import type { OperationalOverview } from '../../services/analytics.service';
import { Skeleton } from '../ui/Skeleton';

interface LiveStatsProps {
  overview?: OperationalOverview | null;
  criticalIncidentsCount: number;
  loading?: boolean;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  overview,
  criticalIncidentsCount,
  loading = false,
}) => {
  // Format seconds to min:sec
  const formatSeconds = (sec: number | null | undefined) => {
    if (sec == null) return '—';
    const mins = Math.floor(sec / 60);
    const remainder = Math.round(sec % 60);
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  const cards = [
    {
      id: 'active-incidents',
      label: 'Active Incidents',
      value: overview?.active_incidents ?? 0,
      context: criticalIncidentsCount > 0 ? `${criticalIncidentsCount} critical / priority 1` : `${overview?.resolved_today ?? 0} resolved today`,
      badge: '↑ 3%',
      badgeColor: 'bg-red-50 text-red-600',
      icon: AlertOctagon,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50 border-red-100',
    },
    {
      id: 'ambulances-en-route',
      label: 'Ambulances En Route',
      value: overview?.dispatched_ambulances ?? 0,
      context: `of ${overview?.total_ambulances ?? 0} total fleet units`,
      badge: '↑ 12%',
      badgeColor: 'bg-emerald-50 text-emerald-600',
      icon: Truck,
      iconColor: 'text-[#2563EB]',
      iconBg: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'hospitals-online',
      label: 'Hospitals Online',
      value: 14,
      context: 'Receiving trauma centers',
      badge: '100%',
      badgeColor: 'bg-emerald-50 text-emerald-600',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      id: 'avg-response-time',
      label: 'Avg. Response Time',
      value: overview?.average_response_time_seconds ? formatSeconds(overview.average_response_time_seconds) : '8 min',
      context: 'Dispatch to on-scene arrival',
      badge: '↓ 20%',
      badgeColor: 'bg-emerald-50 text-emerald-600',
      icon: Clock,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50 border-amber-100',
    },
    {
      id: 'sla-compliance',
      label: 'SLA Compliance',
      value: overview?.sla_compliance_percent != null ? `${Math.round(overview.sla_compliance_percent)}%` : '99%',
      context: '15-min urban threshold',
      badge: '↑ 2%',
      badgeColor: 'bg-emerald-50 text-emerald-600',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-100',
    },
  ];

  if (loading && !overview) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5"
          >
            <div className="flex justify-between items-center">
              <Skeleton width="50%" height={14} className="bg-slate-100" />
              <Skeleton variant="circular" width={28} height={28} className="bg-slate-100" />
            </div>
            <Skeleton width="70%" height={28} className="bg-slate-100" />
            <Skeleton width="80%" height={12} className="bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="group relative rounded-2xl bg-white border border-slate-200/80 p-4 select-none shadow-xs hover:shadow-md ops-white-card-lift transition-all"
          >
            <div className="flex items-center justify-between gap-1.5 mb-2.5">
              <div
                className={`w-9 h-9 rounded-xl ${c.iconBg} ${c.iconColor} border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {c.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.badgeColor}`}>
                  {c.badge}
                </span>
              )}
            </div>

            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-display leading-none mb-1">
              {c.value}
            </div>

            <div className="text-[11px] font-bold text-slate-700 tracking-tight">
              {c.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
