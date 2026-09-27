// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Incident History Screen (ResQGrid Core)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  Search,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Ambulance,
  Building2,
  Radio,
  Clock,
} from 'lucide-react';

export const IncidentHistory: React.FC = () => {
  const navigate = useNavigate();
  const { incidents, fetchIncidents, isLoading } = useIncidentStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      (inc.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (inc.emergency_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (inc.assigned_hospital_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (inc.address || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' ||
      (inc.emergency_type || '').toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell sidebarVariant="top">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          title="Emergency Incident Records"
          subtitle="Review active and past emergency medical dispatches, triage allocations, and hospital routes."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/citizen')}
              className="border-white/20 text-slate-200 hover:bg-white/10"
            >
              Back to Dashboard
            </Button>
          }
        />

        {/* Search & Filter Bar */}
        <div className="bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-xl">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category, hospital, or address..."
              className="w-full pl-10 pr-3 py-2.5 text-xs border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-900/80 text-white placeholder-slate-400"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'cardiac', 'trauma', 'accident', 'respiratory'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 border rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {cat === 'all' ? 'All Types' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-300">
            <Spinner size="lg" />
            <p className="text-xs font-bold mt-3">Loading Incident Logs...</p>
          </div>
        )}

        {/* Incident List */}
        {!isLoading && (
          <div className="space-y-3">
            {filtered.map((item) => {
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recorded Incident';

              const hospitalName = item.assigned_hospital_name || 'Victoria Hospital (BMCRI Trauma Care)';
              const ambulanceNumber = item.assigned_ambulance_number || (item.assigned_ambulance_id ? `Unit ${item.assigned_ambulance_id.slice(0, 8)}` : 'KA-05-EA-4820 (ALS)');
              const emergencyType = (item.emergency_type || 'Medical Emergency').toUpperCase();

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/citizen/tracking?incidentId=${item.id}`)}
                  className="p-5 border border-[#1E3A8A] bg-[#0B1B4F] hover:border-sky-400/50 rounded-2xl shadow-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 text-white hover-lift"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-white">{emergencyType}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-sky-400" />
                          {hospitalName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
                        <Ambulance className="w-3.5 h-3.5 text-red-400" />
                        <span>{ambulanceNumber}</span>
                        {item.address && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[280px]">{item.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 border-white/10 pt-3 md:pt-0 justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        CORRIDOR STATUS
                      </span>
                      <span className="text-xs font-black text-emerald-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Green Wave Synced
                      </span>
                    </div>

                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-[#0B1B4F] rounded-3xl border border-[#1E3A8A] text-slate-300 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400 mx-auto">
                  <Radio className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Emergency Incident Records</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    When an emergency SOS or report is initiated, your logged response records and allocated hospitals will appear here.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => navigate('/citizen')}
                  className="mt-2 font-bold text-xs"
                >
                  <Radio className="w-3.5 h-3.5 mr-1.5" />
                  Launch Emergency SOS
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default IncidentHistory;
