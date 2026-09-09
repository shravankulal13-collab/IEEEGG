// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Incident History Screen (Stitch Reference 5)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Stethoscope, Car, CheckCircle2, ShieldAlert } from 'lucide-react';

export const IncidentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const incidents = [
    {
      id: 'ER-2048',
      type: 'Medical',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
      date: '29 Aug 2026',
      responseTime: '08 min',
      status: 'COMPLETED',
      borderColor: 'border-l-4 border-l-blue-600',
    },
    {
      id: 'ER-2035',
      type: 'Accident',
      icon: <Car className="w-5 h-5 text-red-600" />,
      date: '15 Aug 2026',
      responseTime: '12 min',
      status: 'COMPLETED',
      borderColor: 'border-l-4 border-l-red-400',
    },
  ];

  const filtered = incidents.filter(
    (inc) => inc.id.toLowerCase().includes(search.toLowerCase()) || inc.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/citizen')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Incident History</h1>
          <p className="text-xs text-slate-500 mt-1">Review your past emergency requests and details.</p>
        </div>

        {/* Controls / Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents (e.g., ER-2048)"
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
          <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            Status: All
          </button>
          <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            Type: All
          </button>
          <button className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Incident List */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/citizen/tracking?incidentId=${item.id}`)}
              className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between ${item.borderColor}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{item.type}</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {item.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 text-right">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                    Response Time
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">{item.responseTime}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {item.status}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No past emergency incidents found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
