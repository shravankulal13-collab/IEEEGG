// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Ambulance Dispatch Invitation Modal & Request Screen (ResQGrid Theme)
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Phone,
  ShieldCheck,
  Ambulance,
  User,
  HeartPulse,
  Navigation,
  Radio,
} from 'lucide-react';

import { useIncidentStore } from '../../store/incidentStore';
import { type IncidentRecord } from '../../services/incident.service';

export const DispatchRequest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawIncidentId = searchParams.get('incidentId');
  const storedId = localStorage.getItem('resqgrid_active_incident_id');
  const incidentId =
    rawIncidentId && rawIncidentId !== 'null' && rawIncidentId !== 'undefined' && rawIncidentId.trim() !== ''
      ? rawIncidentId.trim()
      : (storedId || 'ER-2048');

  const [timeLeft, setTimeLeft] = useState(30);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [incident, setIncident] = useState<IncidentRecord | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('resqgrid_active_incident_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed) setIncident(parsed);
      } catch {
        // ignore
      }
    }

    if (incidentId) {
      useIncidentStore
        .getState()
        .fetchIncidentById(incidentId)
        .then((data) => setIncident(data))
        .catch(() => {});
    }
  }, [incidentId]);

  useEffect(() => {
    if (status !== 'pending') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleAccept = () => {
    setStatus('accepted');
    setTimeout(() => {
      navigate(`/ambulance/navigation?incidentId=${incidentId}`);
    }, 1200);
  };

  const handleDecline = () => {
    setStatus('declined');
    setTimeout(() => {
      navigate('/ambulance');
    }, 1200);
  };

  const progressPercent = (timeLeft / 30) * 100;

  const shortIncidentNum = incident?.incident_number
    ? `ER-${incident.incident_number}`
    : incidentId.length > 8
      ? `ER-${incidentId.slice(0, 6).toUpperCase()}`
      : (incidentId.startsWith('ER-') ? incidentId : `ER-${incidentId}`);

  const incidentTitle = incident?.title || 'Emergency Medical Dispatch Response';
  const incidentLocation = incident?.address || '123 Medical Drive, Sector 4, Bengaluru';
  const callerName = incident?.reporter_name || 'Rahul Sharma (Citizen)';
  const callerPhone = incident?.reporter_phone || '+91 98765 43210';
  const hospitalName = incident?.assigned_hospital_name || 'Victoria Hospital (BMCRI Trauma Care)';
  const clinicalNotes = incident?.description || 'Emergency paramedical response and Advanced Life Support required immediately.';

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Page Header with High Contrast ResQGrid Navigation */}
        <PageHeader
          title={`Emergency Dispatch Callout: ${shortIncidentNum}`}
          subtitle="Immediate Paramedic Callout • Live Emergency Response Network"
          badge={
            <Badge variant="danger" className="animate-pulse">
              URGENT DISPATCH INVITATION
            </Badge>
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ambulance')}
              className="border-white/20 text-white hover:bg-white/10 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Button>
          }
        />

        {/* Countdown Header Banner */}
        <div className="p-6 bg-[#0B1B4F] border-2 border-red-500/50 rounded-3xl shadow-2xl text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
                <HeartPulse className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-black text-rose-400 uppercase tracking-widest block">
                  PRIORITY EMERGENCY CALLOUT
                </span>
                <h2 className="text-2xl font-black text-white mt-0.5">
                  {incidentTitle}
                </h2>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-white/15 px-5 py-3 rounded-2xl self-start sm:self-auto">
              <Clock className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div>
                <span className="text-[10px] font-black text-slate-300 uppercase block">TIME TO ACCEPT</span>
                <span className="text-2xl font-black font-mono text-amber-400 leading-none">
                  {timeLeft.toString().padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                timeLeft > 10 ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 'bg-red-500 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Columns: Patient Details & Route Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-[#0B1B4F] border border-[#1E3A8A] text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  PATIENT & SCENE SUMMARY
                </span>
                <span className="px-3 py-1 bg-red-600/30 border border-red-500/40 text-rose-300 text-xs font-bold rounded-full">
                  Critical Severity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sky-400">
                    <MapPin className="w-4 h-4" />
                    <span>Patient Pickup Location</span>
                  </div>
                  <p className="text-sm font-extrabold text-white">{incidentLocation}</p>
                  <p className="text-slate-300 font-medium">Auto-allocated coordinates (~1.8 km away)</p>
                </div>

                <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <User className="w-4 h-4" />
                    <span>Caller Contact</span>
                  </div>
                  <p className="text-sm font-extrabold text-white">{callerName}</p>
                  <p className="text-slate-300 font-medium">{callerPhone} • Citizen Caller</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10 space-y-1.5 text-xs">
                <span className="font-bold text-slate-300 block">Triage Clinical Notes:</span>
                <p className="text-slate-100 leading-relaxed font-medium">
                  {clinicalNotes}
                </p>
              </div>
            </Card>

            {/* Destination Hospital Allocation Card */}
            <Card className="p-6 bg-[#0B1B4F] border border-[#1E3A8A] text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  ALLOCATED DESTINATION HOSPITAL
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full">
                  ICU Bed Reserved
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-900/70 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-black text-white">{hospitalName}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Trauma Level 1 • ICU Beds Headroom Pre-Alerted
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-bold text-white">Green Wave Priority Corridor Synced</span>
                </div>
                <span className="text-emerald-400 font-bold font-mono">3 Traffic Signals Preempted</span>
              </div>
            </Card>
          </div>

          {/* Right Column: Tactical Action Panel */}
          <div className="space-y-6">
            <Card className="p-6 bg-[#0B1B4F] border border-[#1E3A8A] text-white shadow-xl space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                DISPATCH RESPONSE ACTIONS
              </h3>

              {status === 'pending' && (
                <div className="space-y-3 pt-1">
                  <button
                    onClick={handleAccept}
                    className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>ACCEPT & START NAVIGATION</span>
                  </button>

                  <button
                    onClick={handleDecline}
                    className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>DECLINE (PASS TO NEXT UNIT)</span>
                  </button>
                </div>
              )}

              {status === 'accepted' && (
                <div className="p-5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-emerald-300">Dispatch Accepted</h4>
                  <p className="text-xs text-slate-200">Opening turn-by-turn emergency navigation...</p>
                </div>
              )}

              {status === 'declined' && (
                <div className="p-5 bg-red-500/20 border border-red-500/40 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-rose-300">Dispatch Passed</h4>
                  <p className="text-xs text-slate-200">Rerouting call to next nearest ambulance unit...</p>
                </div>
              )}
            </Card>

            {/* Radio & Dispatcher Support Card */}
            <Card className="p-6 bg-[#0B1B4F] border border-[#1E3A8A] text-white shadow-xl space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                COMMAND CENTER DISPATCHER
              </span>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Sarah Jenkins</h4>
                  <p className="text-[11px] text-slate-300">Lead Dispatch Controller • Desk 4</p>
                </div>
              </div>

              <button
                onClick={() => alert('Initiating direct radio patch to Dispatch Desk 4 (+91 80 2297 5000)...')}
                className="w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-sky-300 border border-white/10 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Dispatch Command</span>
              </button>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DispatchRequest;

