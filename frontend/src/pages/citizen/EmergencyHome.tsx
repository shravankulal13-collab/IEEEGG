// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Emergency Home Screen (Stitch Reference 1)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import { ReportEmergencyModal } from './ReportEmergency';
import { ShieldAlert, MapPin, Activity, Settings, HelpCircle, LayoutDashboard, FileText, Radio, User } from 'lucide-react';

export const EmergencyHome: React.FC = () => {
  const navigate = useNavigate();
  const geo = useGeolocation(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-6 px-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            <h1 className="text-base font-bold tracking-tight text-slate-900">Emergency Intelligence</h1>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                742
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Unit 742</p>
                <p className="text-xs text-slate-500">Active Duty</p>
              </div>
            </div>
            <button className="w-full mt-3 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">
              Go Offline
            </button>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/citizen/history')}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Activity className="w-4 h-4" />
              Incidents
            </button>
            <button
              onClick={() => navigate('/ambulance')}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Radio className="w-4 h-4" />
              Fleet
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
              <FileText className="w-4 h-4" />
              Reports
            </button>
          </nav>
        </div>

        <div className="space-y-1 border-t border-slate-200 pt-3">
          <button
            onClick={() => navigate('/citizen/profile')}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 text-sm font-medium">
            <span className="text-slate-900 font-bold">Emergency Intelligence</span>
            <button className="text-blue-600 border-b-2 border-blue-600 py-4 font-semibold">Citizen Portal</button>
            <button onClick={() => navigate('/ambulance')} className="text-slate-500 hover:text-slate-800 py-4">Driver Portal</button>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
            <button onClick={() => navigate('/citizen/profile')}>
              <User className="w-6 h-6 text-slate-700 hover:text-blue-600" />
            </button>
          </div>
        </header>

        {/* Central Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-between max-w-5xl mx-auto w-full">
          {/* Location Accuracy Pill */}
          <div className="bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm flex items-center gap-2 text-xs font-semibold text-slate-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>GPS Accuracy: {geo.status === 'available' ? `High (${geo.accuracy}m)` : 'Acquiring location...'}</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping ml-1" />
          </div>

          {/* Primary SOS Action Circle */}
          <div className="my-8 flex flex-col items-center">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-56 h-56 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-200 border-4 border-red-500 group"
            >
              <div className="text-4xl mb-1 group-hover:scale-110 transition-transform">✱</div>
              <span className="text-xl font-extrabold tracking-wider leading-tight px-4">
                SEND<br />EMERGENCY<br />SOS
              </span>
            </button>
          </div>

          {/* Bottom Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Location Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-800">Your location is ready</h3>
                <Settings className="w-4 h-4 text-slate-400 cursor-pointer" />
              </div>
              <div className="h-32 bg-slate-100 rounded-xl overflow-hidden relative mb-3 flex items-center justify-center border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                  alt="City Map preview"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{geo.address || '123 Medical Drive, High-Fidelity City'}</span>
              </div>
            </div>

            {/* Emergency Guidance & Recent Incidents */}
            <div className="space-y-4">
              {/* Guidance */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-3">Emergency Guidance</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">✚</span>
                      First Aid Basics
                    </div>
                    <span>›</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">🔥</span>
                      Fire Safety protocol
                    </div>
                    <span>›</span>
                  </div>
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-2">Recent Incidents</h3>
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-900">ER-2047</span>
                    <p className="text-xs text-slate-500">Medical</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                    COMPLETED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Emergency Reporting Modal */}
      {isReportModalOpen && (
        <ReportEmergencyModal onClose={() => setIsReportModalOpen(false)} />
      )}
    </div>
  );
};
