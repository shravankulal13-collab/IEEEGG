// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Incident Queue Component
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
} from 'lucide-react';
import type { IncidentRecord } from '../../services/incident.service';
import { IncidentCard } from './IncidentCard';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';

interface IncidentQueueProps {
  incidents: IncidentRecord[];
  selectedIncidentId: string | null;
  onSelectIncident: (incident: IncidentRecord) => void;
  onViewDetails?: (incident: IncidentRecord) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onViewDetails,
  loading = false,
  error = null,
  onRefresh,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'time' | 'severity'>('time');

  // Filtered and sorted incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Search text matching
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchNum = String(inc.incident_number || '').includes(q);
          const matchTitle = (inc.title || '').toLowerCase().includes(q);
          const matchDesc = (inc.description || '').toLowerCase().includes(q);
          const matchType = (inc.emergency_type || '').toLowerCase().includes(q);
          const matchAddr = (inc.address || inc.city || '').toLowerCase().includes(q);
          if (!matchNum && !matchTitle && !matchDesc && !matchType && !matchAddr) {
            return false;
          }
        }

        // Severity filter
        if (severityFilter === 'CRITICAL' && (inc.severity ?? 0) < 4) return false;
        if (severityFilter === 'HIGH' && inc.severity !== 3) return false;
        if (severityFilter === 'MEDIUM' && inc.severity !== 2) return false;
        if (severityFilter === 'LOW' && (inc.severity ?? 1) > 1) return false;

        // Status filter
        if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          return (b.severity ?? 1) - (a.severity ?? 1);
        }
        // Time desc (newest first)
        const timeA = new Date(a.reported_at || a.created_at).getTime();
        const timeB = new Date(b.reported_at || b.created_at).getTime();
        return timeB - timeA;
      });
  }, [incidents, search, severityFilter, statusFilter, sortBy]);

  const criticalCount = useMemo(
    () => incidents.filter((i) => (i.severity ?? 0) >= 4).length,
    [incidents]
  );

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden ${className}`}>
      {/* Sticky Queue Header & Search */}
      <div className="sticky top-0 z-10 p-4 border-b border-slate-100 space-y-3 bg-white select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center">
              <span className="text-xs">📋</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">
              Live Incident Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#FF1F2D] text-white text-[11px] font-bold shadow-xs">
              {incidents.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dispatcher/incidents"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors hidden sm:inline"
            >
              View All →
            </a>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh incident list"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, type, address..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/80 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSeverityFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              severityFilter === 'ALL'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({incidents.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              severityFilter === 'CRITICAL'
                ? 'bg-[#FF1F2D] text-white shadow-xs'
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('HIGH')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              severityFilter === 'HIGH'
                ? 'bg-[#F97316] text-white'
                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            High (0)
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('MEDIUM')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              severityFilter === 'MEDIUM'
                ? 'bg-[#F59E0B] text-white'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Med (0)
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('LOW')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              severityFilter === 'LOW'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Low (0)
          </button>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verifying">Verifying</option>
            <option value="verified">Verified</option>
            <option value="dispatched">Dispatched</option>
            <option value="en_route">En Route</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'time' ? 'severity' : 'time')}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium text-xs hover:text-slate-900 transition-colors"
          >
            Sort: {sortBy === 'time' ? 'Recent' : 'Severity'} ▾
          </button>
        </div>
      </div>

      {/* Queue Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40">
        {loading && incidents.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between">
                  <Skeleton width="35%" height={16} />
                  <Skeleton width="20%" height={16} />
                </div>
                <Skeleton width="70%" height={14} />
              </div>
            ))}
          </div>
        ) : error && incidents.length === 0 ? (
          <ErrorState message={error} onRetry={onRefresh} />
        ) : filteredIncidents.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
            {/* Radar concentric circle reticle graphic */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border border-blue-200 animate-ping opacity-25" />
              <div className="absolute inset-1 rounded-full border border-blue-200" />
              <div className="absolute inset-3 rounded-full border border-blue-300/60" />
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center shadow-xs bg-white">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <div className="absolute top-0 bottom-0 w-[1px] bg-blue-200" />
              <div className="absolute left-0 right-0 h-[1px] bg-blue-200" />
            </div>

            <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1 font-display">
              No Active Incidents
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mb-4 leading-relaxed">
              There are currently no emergency incidents registered in the queue.
            </p>

            <a
              href="/dispatcher/incidents"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition-all"
            >
              View All Incidents
            </a>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isSelected={incident.id === selectedIncidentId}
              onSelect={onSelectIncident}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>

      {/* Queue Bottom Action */}
      <div className="p-3 border-t border-slate-100 bg-white text-center">
        <a
          href="/dispatcher/incidents"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All Incidents →
        </a>
      </div>
    </div>
  );
};
