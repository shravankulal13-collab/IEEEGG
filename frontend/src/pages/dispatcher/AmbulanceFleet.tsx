// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Ambulance Fleet Operations & Telemetry Monitoring (/dispatcher/fleet)
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Search,
  RefreshCw,
  Phone,
  User,
  Gauge,
  MapPin,
  Clock,
} from 'lucide-react';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import { getAmbulanceStatusColor } from '../../components/maps/AmbulanceMarker';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';

export const AmbulanceFleet: React.FC = () => {
  const { fleet, loading, error, refreshFleet } = useLiveTracking();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter fleet
  const filteredFleet = useMemo(() => {
    return fleet.filter((amb) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = amb.ambulance_number?.toLowerCase().includes(q);
        const matchDriver = amb.driver_name?.toLowerCase().includes(q);
        const matchType = amb.ambulance_type?.toLowerCase().includes(q);
        if (!matchNum && !matchDriver && !matchType) return false;
      }

      if (statusFilter !== 'ALL') {
        const norm = amb.status?.toLowerCase() || '';
        if (statusFilter === 'AVAILABLE' && !norm.includes('available')) return false;
        if (statusFilter === 'EN_ROUTE' && !norm.includes('route') && !norm.includes('dispatch')) return false;
        if (statusFilter === 'ON_SCENE' && !norm.includes('scene') && !norm.includes('arrive')) return false;
        if (statusFilter === 'TRANSPORTING' && !norm.includes('transport')) return false;
        if (statusFilter === 'OFFLINE' && !norm.includes('offline') && !norm.includes('maint')) return false;
      }

      return true;
    });
  }, [fleet, search, statusFilter]);

  // Counts
  const counts = useMemo(() => {
    let available = 0;
    let responding = 0;
    let offline = 0;
    fleet.forEach((a) => {
      const s = a.status?.toLowerCase() || '';
      if (s.includes('available')) available++;
      else if (s.includes('route') || s.includes('dispatch') || s.includes('scene') || s.includes('transport')) responding++;
      else offline++;
    });
    return { total: fleet.length, available, responding, offline };
  }, [fleet]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header & Fleet Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-[#07133A]/90 border border-blue-900/30 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Fleet
          </span>
          <div className="text-2xl font-extrabold text-white font-display">
            {counts.total}
          </div>
          <span className="text-[11px] text-slate-500">Registered response units</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#07133A]/90 border border-blue-900/30 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Available Units
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-display">
            {counts.available}
          </div>
          <span className="text-[11px] text-emerald-500/90">Ready for instant dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#07133A]/90 border border-blue-900/30 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Responding
          </span>
          <div className="text-2xl font-extrabold text-cyan-400 font-display">
            {counts.responding}
          </div>
          <span className="text-[11px] text-slate-500">En route / on scene / transit</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#07133A]/90 border border-blue-900/30 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Offline / Standby
          </span>
          <div className="text-2xl font-extrabold text-slate-400 font-display">
            {counts.offline}
          </div>
          <span className="text-[11px] text-slate-500">Maintenance or inactive</span>
        </div>
      </div>

      {/* Control Bar: Search + Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#07133A]/90 p-4 rounded-2xl border border-blue-900/30 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by vehicle #, driver, type..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-blue-900/40 bg-[#050B24] text-slate-100 placeholder-slate-500 focus:bg-[#07133A] focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 shadow-inner transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'AVAILABLE', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORTING', 'OFFLINE'].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-semibold uppercase text-[11px] tracking-wide transition-all shrink-0 ${
                  statusFilter === status
                    ? 'bg-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-[#0B1B4A] text-slate-300 hover:bg-[#10245C]'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            )
          )}

          <button
            type="button"
            onClick={refreshFleet}
            title="Refresh Fleet Status"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 border border-blue-900/40 ml-1 shrink-0 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ambulance Grid */}
      {loading && fleet.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-[#07133A]/90 border border-blue-900/30 space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton width="40%" height={20} />
                <Skeleton width="25%" height={20} />
              </div>
              <Skeleton width="70%" height={14} />
              <Skeleton width="100%" height={40} />
            </div>
          ))}
        </div>
      ) : error && fleet.length === 0 ? (
        <ErrorState message={error} onRetry={refreshFleet} />
      ) : filteredFleet.length === 0 ? (
        <EmptyState
          title="No Ambulances Found"
          description="No fleet units matched your current filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFleet.map((amb) => {
            const { bg, label } = getAmbulanceStatusColor(amb.status);
            return (
              <div
                key={amb.id}
                className="group relative rounded-2xl bg-[#07133A]/90 border border-blue-900/30 p-5 shadow-lg hover:border-blue-700/60 hover:bg-[#0B1B4A]/70 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Vehicle Number & Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-cyan-400">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-display">
                          {amb.ambulance_number}
                        </h4>
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                          {amb.ambulance_type || 'ALS Life Support'}
                        </span>
                      </div>
                    </div>

                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-xs"
                      style={{ backgroundColor: bg }}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Driver & Telemetry Specs */}
                  <div className="space-y-2 py-3 border-y border-blue-900/30 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <User className="w-3.5 h-3.5" /> Assigned Driver
                      </span>
                      <strong className="text-white">
                        {amb.driver_name || 'Standby Operator'}
                      </strong>
                    </div>

                    {amb.driver_phone && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5" /> Contact
                        </span>
                        <a
                          href={`tel:${amb.driver_phone}`}
                          className="font-mono text-cyan-400 hover:underline"
                        >
                          {amb.driver_phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Gauge className="w-3.5 h-3.5" /> Live Speed
                      </span>
                      <strong className="font-mono text-cyan-400">
                        {amb.current_speed_kmh != null ? `${amb.current_speed_kmh} km/h` : '0 km/h'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer: GPS Coordinates & Update Time */}
                <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="font-mono text-cyan-400/90 truncate">
                      {amb.current_latitude && amb.current_longitude
                        ? `${amb.current_latitude.toFixed(4)}, ${amb.current_longitude.toFixed(4)}`
                        : 'No GPS fix'}
                    </span>
                  </div>

                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {amb.last_gps_update
                      ? new Date(amb.last_gps_update).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Live'}
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
