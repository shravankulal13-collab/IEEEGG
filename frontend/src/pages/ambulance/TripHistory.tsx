// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Trip Response History UI
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';

export const TripHistory: React.FC = () => {
  const navigate = useNavigate();

  const trips = [
    {
      id: 'TRIP-8041',
      incident: 'ER-2045',
      type: 'Cardiac Arrest',
      date: 'Today, 11:20 AM',
      pickup: '45 Residency Road, Central Area',
      hospital: 'St. Jude Medical Center',
      duration: '14 mins',
      status: 'COMPLETED',
    },
    {
      id: 'TRIP-8040',
      incident: 'ER-2039',
      type: 'Vehicle Collision (Medical)',
      date: 'Yesterday, 08:45 PM',
      pickup: 'Ring Road Junction 12',
      hospital: 'Metro General Emergency',
      duration: '18 mins',
      status: 'COMPLETED',
    },
    {
      id: 'TRIP-8039',
      incident: 'ER-2032',
      type: 'Severe Respiratory Distress',
      date: 'Yesterday, 02:15 PM',
      pickup: '78 Palm Avenue, Sector 2',
      hospital: 'St. Jude Medical Center',
      duration: '11 mins',
      status: 'COMPLETED',
    },
  ];

  return (
    <AppShell sidebarVariant='top'>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Trip Response Logs: AMB-104"
          subtitle="Audit logs of completed emergency responses, transport durations, and destination hospitals"
          badge={<Badge variant="info">34 TOTAL MISSIONS</Badge>}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ambulance')}
              className="border-white/20 text-slate-200 hover:bg-white/10"
            >
              Back to Dashboard
            </Button>
          }
        />

        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="p-5 border border-[#1E3A8A] bg-[#0B1B4F] hover:border-sky-400/50 rounded-2xl shadow-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                    {trip.incident}
                  </span>
                  <h3 className="text-sm font-black text-white">{trip.type}</h3>
                  <Badge variant="success">COMPLETED</Badge>
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Pickup: {trip.pickup}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-bold text-sky-300">{trip.hospital}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">RESPONSE TIME</span>
                  <span className="font-mono text-emerald-400 font-extrabold">{trip.duration}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">DATE & TIME</span>
                  <span className="text-slate-200 font-medium">{trip.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default TripHistory;
