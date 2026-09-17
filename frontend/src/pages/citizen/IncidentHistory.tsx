// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Incident History Screen (ResQGrid Core)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Calendar, Stethoscope, Car, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';

export const IncidentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const incidents = [
    {
      id: 'ER-2048',
      type: 'Medical Emergency',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
      date: '29 Aug 2026',
      responseTime: '08 min',
      status: 'COMPLETED',
      borderColor: 'border-l-4 border-l-blue-600',
    },
    {
      id: 'ER-2035',
      type: 'Vehicle Accident',
      icon: <Car className="w-5 h-5 text-red-600" />,
      date: '15 Aug 2026',
      responseTime: '12 min',
      status: 'COMPLETED',
      borderColor: 'border-l-4 border-l-red-500',
    },
  ];

  const filtered = incidents.filter(
    (inc) => inc.id.toLowerCase().includes(search.toLowerCase()) || inc.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          pillTag="Incident History"
          title="Emergency Incident Records"
          subtitle="Review past medical responses, timeline dispatches, and hospital destinations."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/citizen')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Button>
          }
        />

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by incident ID (e.g., ER-2048) or category..."
              className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50"
            />
          </div>
          <button className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            Status: All
          </button>
          <button className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            Type: All
          </button>
          <button className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/citizen/tracking?incidentId=${item.id}`)}
              className={`p-5 border border-slate-200 bg-white hover:border-blue-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${item.borderColor}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{item.type}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {item.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right border-t sm:border-t-0 pt-3 sm:pt-0 justify-between sm:justify-end">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                    RESPONSE TIME
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">{item.responseTime}</span>
                </div>
                <Badge variant="success">{item.status}</Badge>
                <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No past emergency incidents found matching your query.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default IncidentHistory;
