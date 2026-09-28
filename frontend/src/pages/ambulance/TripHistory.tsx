// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Trip Response History UI (ResQGrid Cockpit)
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  ArrowLeft,
  MapPin,
  Building2,
  User,
  Clock,
  CheckCircle2,
  HeartPulse,
  Flame,
  Car,
  Shield,
  Filter,
} from 'lucide-react';
import { tripHistoryService, type CompletedTripRecord } from '../../services/tripHistory.service';

export const TripHistory: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<CompletedTripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    tripHistoryService.getAllTrips().then((data) => {
      setTrips(data);
      setIsLoading(false);
    }).catch(() => {
      setTrips(tripHistoryService.getLocalTrips());
      setIsLoading(false);
    });
  }, []);

  const filteredTrips = trips.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'medical':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'accident':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'police':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <AppShell sidebarVariant="top">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Trip Response Logs: Unit AMB-104 (ALS)"
          subtitle="Audit records of completed emergency dispatches, patient pickup telemetry, and trauma hospital handovers."
          badge={<Badge variant="success">{trips.length} MISSIONS COMPLETED</Badge>}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ambulance')}
              className="border-white/20 text-slate-200 hover:bg-white/10 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Cockpit
            </Button>
          }
        />

        {/* Dynamic Analytics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-[#0B1B4F] border border-[#1E3A8A] text-white shadow-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL PATIENT TRANSFERS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{trips.length}</span>
              <span className="text-xs font-bold text-emerald-400">100% Handover Rate</span>
            </div>
            <p className="text-[11px] text-slate-300">All dispatches resolved without incident</p>
          </Card>

          <Card className="p-5 bg-[#0B1B4F] border border-[#1E3A8A] text-white shadow-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              AVERAGE RESPONSE TIME
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">13.5</span>
              <span className="text-xs font-bold text-slate-300">mins / mission</span>
            </div>
            <p className="text-[11px] text-slate-300">With AI Green Wave Preemption Corridor</p>
          </Card>

          <Card className="p-5 bg-[#0B1B4F] border border-[#1E3A8A] text-white shadow-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PRIMARY DESTINATION
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-sky-400 truncate">BMCRI Trauma Care</span>
            </div>
            <p className="text-[11px] text-slate-300">Victoria Hospital Central Trauma Bay</p>
          </Card>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </span>
          {['all', 'medical', 'accident', 'fire', 'police'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mission List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs font-bold text-slate-400">Loading mission audit history...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-12 text-center bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl text-white space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Completed Missions In This Category</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Completed emergency trips will automatically appear here once patient handover is finalized.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-5 border border-[#1E3A8A] bg-[#0B1B4F] hover:border-sky-400/50 rounded-2xl shadow-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black font-mono text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                      {trip.incidentNumber}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/10 uppercase">
                      {getCategoryIcon(trip.category)}
                      <span>{trip.category}</span>
                    </span>
                    <h3 className="text-sm font-black text-white truncate">{trip.type}</h3>
                    <Badge variant="success" className="text-[10px] gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      COMPLETED
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    <p className="text-slate-300 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-slate-400">Pickup:</span>
                      <span className="font-semibold text-slate-200 truncate">{trip.pickup}</span>
                    </p>
                    <p className="text-slate-300 flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-400">Hospital:</span>
                      <span className="font-semibold text-sky-300 truncate">{trip.hospital}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Caller: <strong className="text-slate-200">{trip.patientName}</strong> ({trip.patientPhone})</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">DURATION</span>
                    <span className="font-mono text-emerald-400 font-black text-sm">{trip.duration}</span>
                  </div>
                  <div className="text-right sm:mt-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">HANDOVER TIME</span>
                    <span className="text-xs text-slate-200 font-medium">{trip.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TripHistory;
