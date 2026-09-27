// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Pan-India Live Traffic Operations & Road Incident Stream
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Activity,
  AlertTriangle,
  Search,
  Zap,
  Radio,
  Clock,
  CheckCircle2,
  RefreshCw,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import {
  trafficService,
  PAN_INDIA_TRAFFIC_INCIDENTS,
  PAN_INDIA_TRAFFIC_STATS,
  type TrafficIncident,
} from '../../services/traffic.service';

export const TrafficEvents: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>('All India');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'CRITICAL' | 'MAJOR' | 'MODERATE'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [incidents, setIncidents] = useState<TrafficIncident[]>(PAN_INDIA_TRAFFIC_INCIDENTS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  const cityList = ['All India', 'Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];

  useEffect(() => {
    // Poll/load latest incidents from trafficService
    trafficService.getTrafficIncidents().then((res) => {
      if (res.incidents && res.incidents.length > 0) {
        setIncidents(res.incidents);
      }
    });
  }, []);

  // Filter incidents
  const filteredEvents = incidents.filter((ev) => {
    const matchesCity = selectedCity === 'All India' || ev.city === selectedCity || (!ev.city && selectedCity === 'Bengaluru');
    const matchesSeverity = severityFilter === 'all' || ev.severity === severityFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      ev.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.city && ev.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ev.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSeverity && matchesSearch;
  });

  // Calculate stats for the selected city or pan-India summary
  const currentCityStats =
    selectedCity !== 'All India'
      ? trafficService.getCityStats(selectedCity)
      : {
          city: 'All India',
          avgSpeedKmh: 27.8,
          congestionIndex: 68,
          activeBottlenecks: incidents.length,
          avgTimeSavedMinutes: 5.8,
          status: 'MODERATE' as const,
        };

  const handleTriggerSimulation = () => {
    setIsSimulating(true);
    setSimulationNotice('Simulating emergency green wave signal preemption across active arterial bottlenecks...');

    setTimeout(() => {
      setIncidents((prev) =>
        prev.map((ev, i) =>
          i === 0
            ? {
                ...ev,
                status: 'CLEARED',
                detourRoute: 'Green Wave Preempted Corridor Active (0s delay)',
              }
            : ev
        )
      );
      setIsSimulating(false);
      setSimulationNotice('Green wave preemption successfully cleared lead bottleneck corridor!');
      setTimeout(() => setSimulationNotice(null), 4000);
    }, 1200);
  };

  const handleResetEvents = () => {
    setIncidents(PAN_INDIA_TRAFFIC_INCIDENTS);
    setSimulationNotice('Traffic sensors recalibrated to live telemetry baseline.');
    setTimeout(() => setSimulationNotice(null), 3000);
  };

  return (
    <AppShell sidebarVariant="top">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <PageHeader
          pillTag="Live India Traffic Telemetry Grid"
          title="Pan-India Traffic Operations & Congestion Radar"
          subtitle="Real-time multi-city arterial traffic telemetry, dynamic roadblock detection, and automated green corridor ambulance detours."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dispatcher')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Command Center
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('/dispatcher/routes')}
                className="btn-pulse-glow"
              >
                <Zap className="w-4 h-4 mr-1" />
                Green Wave Corridors
              </Button>
            </div>
          }
        />

        {/* Pan-India City Selector Tabs */}
        <div className="bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl p-2.5 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none text-white">
          {cityList.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCity === city
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {city === 'All India' ? <Radio className="w-3.5 h-3.5 text-white animate-pulse" /> : null}
              <span>{city}</span>
              {city !== 'All India' && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-sky-300">
                  {PAN_INDIA_TRAFFIC_INCIDENTS.filter((i) => i.city === city).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 4 Live Traffic KPIs for Selected Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AVERAGE ARTERIAL SPEED</span>
              <Gauge className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{currentCityStats.avgSpeedKmh}</span>
              <span className="text-xs font-bold text-slate-400">km/h</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 mt-1">
              {currentCityStats.avgSpeedKmh < 25 ? 'High Congestion Zone' : 'Moderate Flow Rate'}
            </p>
          </div>

          <div className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CONGESTION INDEX</span>
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${currentCityStats.congestionIndex > 70 ? 'text-red-400' : 'text-amber-400'}`}>
                {currentCityStats.congestionIndex}%
              </span>
              <span className="text-xs font-bold text-slate-400">Peak Load</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${currentCityStats.congestionIndex > 70 ? 'bg-red-500' : 'bg-amber-400'}`}
                style={{ width: `${currentCityStats.congestionIndex}%` }}
              />
            </div>
          </div>

          <div className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE BOTTLENECK DETOURS</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400">{filteredEvents.length} Active</span>
            <p className="text-[11px] font-bold text-emerald-400 mt-1">Automated rerouting online</p>
          </div>

          <div className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AVG TIME SAVED BY PREEMPTION</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-400">{currentCityStats.avgTimeSavedMinutes}</span>
              <span className="text-xs font-bold text-slate-400">mins / trip</span>
            </div>
            <p className="text-[11px] font-bold text-emerald-300 mt-1">Via ResQGrid Green Wave Corridors</p>
          </div>
        </div>

        {/* Live Simulation Notice */}
        {simulationNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{simulationNotice}</span>
            </div>
            <button onClick={() => setSimulationNotice(null)} className="text-emerald-300 hover:text-white font-black cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Filter and Search Action Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl p-3.5 shadow-xl text-white">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roads, junctions, flyovers across India..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/15 rounded-xl text-xs font-medium text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          {/* Center: Severity Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-300 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Severity:
            </span>
            {(['all', 'CRITICAL', 'MAJOR', 'MODERATE'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                  severityFilter === lvl
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {lvl === 'all' ? 'All Severities' : lvl.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Right: Simulation Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerSimulation}
              disabled={isSimulating}
              className="text-xs border-sky-400/30 text-sky-300 hover:bg-sky-500/10"
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-sky-400" />
              {isSimulating ? 'Preempting Signals...' : 'Simulate Preemption'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetEvents}
              className="text-xs border-white/15 text-slate-300 hover:bg-white/10"
              title="Reset to live sensor baseline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Events Feed */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-white">
              Active Traffic Bottlenecks & Detour Feeds ({filteredEvents.length})
            </h3>
            <span className="text-xs text-slate-300 font-medium">
              Region: <strong className="text-sky-300">{selectedCity}</strong>
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] p-12 text-center text-white">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">All Corridors Clear</h4>
              <p className="text-xs text-slate-300 mt-1">No traffic bottlenecks match your search criteria.</p>
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-5 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-sky-400/40 transition-all text-white"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                      ev.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : ev.severity === 'MAJOR'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-sky-400 border border-blue-500/30'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-white">{ev.roadName}</h4>
                      <span className="font-mono text-[11px] font-bold text-slate-400">({ev.id})</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-sky-300 text-[10px] font-bold border border-white/10">
                        {ev.city}
                      </span>
                      <Badge variant={ev.severity === 'CRITICAL' ? 'danger' : ev.severity === 'MAJOR' ? 'warning' : 'info'}>
                        {ev.severity}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">{ev.description}</p>

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Detour: {ev.detourRoute}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Clearance Est: {ev.estimatedClearanceMinutes} mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">{ev.reportedAt}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                      ev.status === 'CLEARED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : ev.status === 'REROUTED'
                        ? 'bg-blue-500/20 text-sky-300 border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {(ev.status || 'MONITORING').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default TrafficEvents;
