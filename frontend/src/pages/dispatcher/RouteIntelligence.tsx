// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Traffic Routing Engine & Signal Preemption
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Navigation, Zap, RefreshCw } from 'lucide-react';

export const RouteIntelligence: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppShell sidebarVariant="top">
      <PageHeader

        title="Traffic Routing Engine & Signal Preemption"
        subtitle="Dynamic congestion evasion, distance calculation, and emergency green-wave traffic signals"

        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/dispatcher')}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Command Center
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase block">Active Green Corridors</span>
          <span className="text-2xl font-black text-emerald-600">3 Corridors</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase block">Average Time Saved</span>
          <span className="text-2xl font-black text-blue-600">4.8 mins / trip</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase block">Congestion Avoidance</span>
          <span className="text-2xl font-black text-purple-600">99.4% Accuracy</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-6 text-white min-h-[360px] relative overflow-hidden flex flex-col justify-between shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
            alt="Routing Map"
            className="absolute inset-0 w-full h-full object-cover opacity-35 filter contrast-125"
          />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-400 text-xs font-bold">

              <span>Route 9 Green Corridor Cleared</span>
            </div>
            <span className="text-xs text-slate-300 font-mono font-bold">ETA: 04 min (Saved: 3.8 min)</span>
          </div>

          <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 max-w-md">
            <h4 className="text-xs font-bold text-white mb-1">Preempted Traffic Signals (Sector 4)</h4>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>Junction 4A (Main Blvd)</span>
                <span className="text-emerald-400 font-bold">HOLD GREEN (45s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Junction 4B (Hospital Ave)</span>
                <span className="text-emerald-400 font-bold">PREEMPTING NOW</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Live Signal Clearance Matrix</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">Corridor A (AMB-104)</p>
                  <p className="text-slate-500 text-[11px]">Medical Drive Expressway</p>
                </div>
                <Badge variant="success">CLEARED</Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">Corridor B (AMB-108)</p>
                  <p className="text-slate-500 text-[11px]">Bypass South Flyover</p>
                </div>
                <Badge variant="success">HOLD GREEN</Badge>
              </div>
            </div>
          </Card>

          <Button
            variant="danger"
            fullWidth
            onClick={() => navigate('/dispatcher/traffic')}
          >

            Inspect Traffic Bottlenecks
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default RouteIntelligence;
