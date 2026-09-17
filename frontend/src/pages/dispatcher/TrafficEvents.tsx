// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Live Road Congestion & Incident Telemetry
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, MapPin, Zap, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const TrafficEvents: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');

  const events = [
    {
      id: 'TRF-102',
      type: 'Road Construction Bottleneck',
      severity: 'high' as const,
      location: 'Flyover Ramp 2, South Highway',
      impact: '+8 mins delay (Rerouted around ring road)',
      reportedAt: '12 mins ago',
      status: 'ACTIVE_AVOIDANCE',
      detourRoute: 'Bypass North Expressway (Saved: 6.2 mins)',
    },
    {
      id: 'TRF-104',
      type: 'Vehicle Stall & Lane Obstruction',
      severity: 'medium' as const,
      location: 'Sector 8 Junction',
      impact: '+3 mins delay (Single lane cleared for emergency)',
      reportedAt: '25 mins ago',
      status: 'MONITORING',
      detourRoute: 'Green Signal Preemption Active on Lane 1',
    },
    {
      id: 'TRF-105',
      type: 'Waterlogging & Slow Moving Traffic',
      severity: 'medium' as const,
      location: 'Underpass 4B, Hospital Avenue',
      impact: '+5 mins delay',
      reportedAt: '40 mins ago',
      status: 'REROUTED',
      detourRoute: 'Elevated Corridor 3 Cleared',
    },
  ];

  const filteredEvents = events.filter((ev) => filter === 'all' || ev.severity === filter);

  return (
    <AppShell sidebarVariant="top">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader

          title="Live Traffic & Road Incident Stream"
          subtitle="Real-time municipal sensors, road closures, and automated green corridor ambulance detours."

          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dispatcher')}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Command Center
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('/dispatcher/routes')}
              >
                Green Wave Corridors
              </Button>
            </div>
          }
        />

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">TOTAL CONGESTION SENSORS</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">42 Online</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">ACTIVE BOTTLENECK DETOURS</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">3 Cleared</span>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">AVG TIME SAVED BY PREEMPTION</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">5.4 min / trip</span>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Severity:</span>
            {(['all', 'high', 'medium'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${filter === lvl
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono font-medium">
            Showing {filteredEvents.length} events
          </span>
        </div>

        {/* Events Feed */}
        <div className="space-y-4">
          {filteredEvents.map((ev) => (
            <Card
              key={ev.id}
              className="p-5 bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">



                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{ev.type}</h3>
                    <span className="font-mono text-[11px] font-bold text-slate-400">({ev.id})</span>
                    <Badge variant={ev.severity === 'high' ? 'danger' : 'warning'}>
                      {ev.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">

                    <span>{ev.location}</span>
                  </p>
                  <p className="text-xs font-bold text-red-600 mt-1">{ev.impact}</p>
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-1.5">
                    Detour: {ev.detourRoute}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">{ev.reportedAt}</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 shrink-0">
                  {ev.status.replace(/_/g, ' ')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default TrafficEvents;
