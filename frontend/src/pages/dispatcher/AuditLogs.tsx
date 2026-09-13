// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Operational Audit & Regulatory Compliance Viewer (/dispatcher/audit)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  RefreshCw,
  Shield,
  Eye,
  X,
} from 'lucide-react';
import {
  analyticsService,
  type AuditLogEntry,
} from '../../services/analytics.service';
import { Table, type Column } from '../../components/ui/Table';
import { ErrorState } from '../../components/ui/ErrorState';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getAuditLogs({
        limit,
        offset,
        entityType: entityTypeFilter || undefined,
      });
      setLogs(res.entries || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve operational audit logs');
    } finally {
      setLoading(false);
    }
  }, [limit, offset, entityTypeFilter]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {new Date(item.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (item) => {
        const act = item.action.toLowerCase();
        const badgeColor = act.includes('create')
          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
          : act.includes('update') || act.includes('status')
          ? 'bg-blue-950/60 text-cyan-300 border-blue-800/60'
          : act.includes('dispatch')
          ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
          : act.includes('cancel') || act.includes('delete')
          ? 'bg-red-950/60 text-[#FF1F2D] border-red-800/60'
          : 'bg-slate-900/60 text-slate-300 border-slate-800';

        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider border ${badgeColor}`}
          >
            {item.action}
          </span>
        );
      },
    },
    {
      header: 'Entity',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-200 capitalize">
            {item.entity_type}
          </span>
          {item.entity_id && (
            <span className="font-mono text-[11px] text-cyan-400/80">
              ({item.entity_id.slice(0, 8)})
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actor ID',
      render: (item) => (
        <span className="font-mono text-xs text-slate-400">
          {item.actor_user_id ? item.actor_user_id.slice(0, 12) : 'SYSTEM'}
        </span>
      ),
    },
    {
      header: 'IP Address',
      render: (item) => (
        <span className="font-mono text-xs text-slate-400">
          {item.ip_address || '127.0.0.1'}
        </span>
      ),
    },
    {
      header: 'Payload',
      align: 'right',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEntry(item);
          }}
          className="p-1.5 rounded-lg text-cyan-400 hover:bg-blue-950/60 transition-colors"
          title="Inspect change payload"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header & Entity Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#07133A]/90 p-4 rounded-2xl border border-blue-900/30 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" /> Operational Audit & Regulatory Compliance
          </h2>
          <p className="text-xs text-slate-400">
            Immutable log of all emergency lifecycle mutations ({total} total recorded)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setOffset(0);
            }}
            className="px-3 py-1.5 rounded-xl border border-blue-900/40 text-xs bg-[#050B24] text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="">All Entities</option>
            <option value="incident">Incidents</option>
            <option value="ambulance">Ambulances</option>
            <option value="dispatch">Dispatches</option>
            <option value="hospital">Hospitals</option>
            <option value="user">Users / Auth</option>
          </select>

          <button
            type="button"
            onClick={loadAuditLogs}
            title="Refresh Audit Logs"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 border border-blue-900/40 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadAuditLogs} />}

      {/* Audit Log Table */}
      <Table
        data={logs}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        emptyMessage="No audit log entries recorded for this filter."
        onRowClick={(item) => setSelectedEntry(item)}
      />

      {/* Payload Inspection Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B24]/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#07133A] rounded-2xl shadow-2xl border border-blue-900/50 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-blue-900/30 bg-[#050B24]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Audit Entry Mutation: {selectedEntry.action}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-blue-950/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto text-slate-300">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Entity:</span>{' '}
                  <strong className="text-white capitalize">{selectedEntry.entity_type}</strong> (
                  <span className="text-cyan-400 font-mono">{selectedEntry.entity_id}</span>)
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span>{' '}
                  <strong className="text-white font-mono">
                    {new Date(selectedEntry.created_at).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Data Diff */}
              <div className="space-y-3">
                {selectedEntry.old_data && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Pre-State (old_data)
                    </span>
                    <pre className="p-3 rounded-xl bg-[#050B24] border border-blue-900/40 text-xs font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedEntry.old_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedEntry.new_data && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Mutated State (new_data)
                    </span>
                    <pre className="p-3 rounded-xl bg-[#0B1B4A]/60 border border-blue-800/60 text-xs font-mono text-cyan-300 overflow-x-auto">
                      {JSON.stringify(selectedEntry.new_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-blue-900/30 bg-[#050B24] text-right">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0B1B4A] text-slate-200 hover:bg-[#10245C] border border-blue-900/40"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
