// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Completed Trip Log History
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export const TripHistory: React.FC = () => {
  const navigate = useNavigate();

  const trips = [
    {
      id: 'TRIP-904',
      incidentId: 'ER-2047',
      type: 'Medical Emergency',
      date: '29 Aug 2026',
      duration: '18 min',
      distance: '4.2 km',
      destination: 'St. Jude Memorial Hospital',
      status: 'COMPLETED',
    },
    {
      id: 'TRIP-889',
      incidentId: 'ER-2035',
      type: 'Traffic Accident',
      date: '15 Aug 2026',
      duration: '24 min',
      distance: '6.8 km',
      destination: 'City General Hospital',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/ambulance')}
          className="text-xs font-bold text-blue-400 hover:underline block"
        >
          ← Back to Driver Dashboard
        </button>

        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black">Completed Response Log</h1>
          <p className="text-xs text-slate-400">AMB-104 Past Emergency Dispatches</p>
        </div>

        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-base font-bold text-white">{trip.type}</span>
                  <span className="ml-2 text-xs text-slate-400 font-mono">({trip.incidentId})</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                  {trip.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400 block">Date</span>
                  <span className="font-bold">{trip.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Response Time</span>
                  <span className="font-bold text-blue-400">{trip.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Distance</span>
                  <span className="font-bold">{trip.distance}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Hospital Drop-off: {trip.destination}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
