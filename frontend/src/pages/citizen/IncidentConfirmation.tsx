// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Incident Confirmation Screen (ResQGrid Core)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { type IncidentRecord } from '../../services/incident.service';
import { Spinner } from '../../components/ui/Spinner';
import { ShieldCheck, Compass, Phone, AlertCircle, Ambulance, Building2 } from 'lucide-react';

export const IncidentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId');
  const { fetchIncidentById } = useIncidentStore();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) {
      setIsLoading(false);
      return;
    }

    fetchIncidentById(incidentId)
      .then((data) => {
        setIncident(data);
        setIsLoading(false);
      })
      .catch(() => {
        useIncidentStore.getState().fetchIncidents().then(() => {
          const fallback = useIncidentStore.getState().incidents[0] || null;
          setIncident(fallback);
          setIsLoading(false);
        }).catch((err: any) => {
          setError(err.message || 'Failed to load incident record.');
          setIsLoading(false);
        });
      });
  }, [incidentId, fetchIncidentById]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <Spinner size="lg" />
        <p className="text-xs font-bold text-slate-600 mt-3">Loading Incident Confirmation...</p>
      </div>
    );
  }

  const assignedAmb = incident?.assigned_ambulance_number || (incident?.assigned_ambulance_id ? `Unit ${incident.assigned_ambulance_id}` : 'Unit Assignment In Progress');
  const assignedHosp = incident?.assigned_hospital_name || 'Hospital Allocation In Progress';
  const reporter = incident?.reporter_name || 'Citizen Caller';

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black text-slate-900">Emergency Dispatched</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Registered for <span className="font-bold text-slate-800">{reporter}</span>
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-mono font-bold">
            ID: {incidentId || incident?.id || 'N/A'}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Assignment Summary */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            DYNAMIC LOGISTICS ALLOCATION
          </span>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Unit</p>
                <p className="text-xs font-black text-slate-900">{assignedAmb}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Destination Medical Center</p>
                <p className="text-xs font-black text-slate-900">{assignedHosp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/citizen/tracking?incidentId=${incidentId || incident?.id}`)}
            className="w-full py-3.5 bg-[#0B1B4F] hover:bg-[#0A192F] text-white font-extrabold text-xs rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Open Live GPS Tracking & Route HUD
          </button>
          <a
            href="tel:108"
            className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer block text-center"
          >
            <Phone className="w-4 h-4 text-slate-600 inline mr-1" />
            Contact Dispatch Command (108 / 112)
          </a>
        </div>
      </div>
    </div>
  );
};

export default IncidentConfirmation;
