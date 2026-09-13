// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Full Live Incident Queue & Dispatch Management (/dispatcher/incidents)
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Search,
  RefreshCw,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import {
  incidentService,
  type IncidentRecord,
} from '../../services/incident.service';
import { getSeverityDetails } from '../../components/maps/IncidentMarker';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';

export const IncidentList: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentService.listActive(100);
      setIncidents(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve active incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
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

      if (severityFilter === 'CRITICAL' && (inc.severity ?? 0) < 4) return false;
      if (severityFilter === 'HIGH' && inc.severity !== 3) return false;
      if (severityFilter === 'MEDIUM' && inc.severity !== 2) return false;
      if (severityFilter === 'LOW' && (inc.severity ?? 1) > 1) return false;

      if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

      return true;
    });
  }, [incidents, search, severityFilter, statusFilter]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#07133A]/90 p-4 rounded-2xl border border-blue-900/30 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-[#FF1F2D] animate-pulse" /> Live Incident Queue & Triage
          </h2>
          <p className="text-xs text-slate-400">
            Real-time emergency tracking, multi-agency dispatch prioritization and case management
          </p>
        </div>

        <button
          type="button"
          onClick={loadIncidents}
          title="Refresh Incidents"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 border border-blue-900/40 self-end sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#07133A]/90 p-4 rounded-2xl border border-blue-900/30 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, emergency, location..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-blue-900/40 bg-[#050B24] text-slate-100 placeholder-slate-500 focus:bg-[#07133A] focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 shadow-inner transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl font-semibold uppercase text-[11px] tracking-wide transition-all shrink-0 ${
                severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-[#FF1F2D] text-white shadow-[0_0_12px_rgba(255,31,45,0.4)]'
                    : 'bg-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-[#0B1B4A] text-slate-300 border border-blue-900/40 hover:bg-[#10245C]'
              }`}
            >
              {sev}
            </button>
          ))}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-blue-900/40 bg-[#050B24] text-slate-300 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verifying">Verifying</option>
            <option value="verified">Verified</option>
            <option value="dispatching">Dispatching</option>
            <option value="dispatched">Dispatched</option>
            <option value="en_route">En Route</option>
            <option value="arrived">Arrived</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadIncidents} />}

      {/* Incident Cards Grid */}
      {loading && incidents.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#07133A]/90 border border-blue-900/30 space-y-3">
              <Skeleton width="40%" height={20} />
              <Skeleton width="80%" height={16} />
              <Skeleton width="100%" height={36} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="LIVE OPERATIONS CLEAR"
          description="There are currently no active incidents matching the selected criteria."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSeverityFilter('ALL');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inc) => {
            const { label, bgColor, textColor, borderColor, isCritical } =
              getSeverityDetails(inc.severity);

            return (
              <div
                key={inc.id}
                onClick={() => navigate(`/dispatcher/incidents/${inc.id}`)}
                className={`group relative rounded-2xl border p-5 shadow-lg ops-card-lift cursor-pointer flex flex-col justify-between ${
                  isCritical
                    ? 'bg-[#0B1B4A]/80 border-red-500/40 hover:border-red-400'
                    : 'bg-[#07133A]/90 border-blue-900/30 hover:border-blue-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-[#050B24] border border-blue-900/40">
                        #{inc.incident_number || inc.id.slice(0, 8)}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs"
                        style={{ backgroundColor: bgColor, color: textColor, borderColor }}
                      >
                        {label}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/60 text-slate-300 border border-blue-900/30">
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white capitalize mb-1 group-hover:text-cyan-400 transition-colors">
                    {inc.title || `${inc.emergency_type} Emergency`}
                  </h3>

                  {inc.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {inc.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 truncate max-w-[190px]">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{inc.address || inc.city || 'Location reported'}</span>
                  </div>

                  <span className="flex items-center gap-1 text-cyan-400 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform">
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
