// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Operational Attention & Tactical Alert Panel
// ============================================================

import React from 'react';
import { Bell, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import type { IncidentRecord } from '../../services/incident.service';
import type { OperationalOverview } from '../../services/analytics.service';
import type { ConnectionState } from '../../services/socket';

interface OperationalAlertsProps {
  incidents: IncidentRecord[];
  overview?: OperationalOverview | null;
  connectionState?: ConnectionState;
  onSelectIncident?: (incident: IncidentRecord) => void;
  className?: string;
}

export const OperationalAlerts: React.FC<OperationalAlertsProps> = ({
  incidents,
  onSelectIncident,
  className = '',
}) => {
  const criticalUnassigned = incidents.filter(
    (i) => (i.severity ?? 0) >= 4 && i.status !== 'resolved' && i.status !== 'cancelled'
  );

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between select-none ops-white-card-lift ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight font-display">
              Operational Alerts
            </h4>
            <p className="text-[11px] text-slate-500">
              {criticalUnassigned.length} active alerts
            </p>
          </div>
        </div>

        <a
          href="/dispatcher/notifications"
          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium hover:text-slate-900 transition-colors"
        >
          View All →
        </a>
      </div>

      {/* Body: All Systems Operational shield state or critical alerts list */}
      {criticalUnassigned.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center select-none flex-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-2.5 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h5 className="text-sm font-bold text-slate-900 tracking-tight font-display">
            All Systems Operational
          </h5>
          <p className="text-xs text-slate-500 mt-0.5">
            No critical active alerts at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-44 pr-1">
          {criticalUnassigned.map((inc) => (
            <div
              key={inc.id}
              className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-red-50/70 border border-red-200 text-xs"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">{inc.title || inc.emergency_type}</span>
                  <p className="text-[11px] text-slate-600">{inc.address || 'Location registered'}</p>
                </div>
              </div>
              {onSelectIncident && (
                <button
                  type="button"
                  onClick={() => onSelectIncident(inc)}
                  className="text-blue-600 hover:text-blue-700 flex items-center shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
