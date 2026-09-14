// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Ambulance Dispatch Invitation Modal & Request Screen
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle,
  MapPin, 
  Clock, 
  HeartPulse, 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Radio, 
  ArrowRight, 
  Phone,
  ShieldCheck,
} from 'lucide-react';

export const DispatchRequest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId') || 'ER-2048';
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');

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
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Pulse Glow on Screen Edges for Urgent Alert */}
      <div className="absolute inset-0 border-4 border-red-600/40 pointer-events-none animate-pulse" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-[#0A192F]/95 border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(229,9,20,0.35)] relative z-10 space-y-6 backdrop-blur-md">
        {/* Top Header: Badge + Countdown Timer */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-400 text-[10px] font-black tracking-wider uppercase border border-red-500/40">
                CRITICAL DISPATCH INVITATION
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">Incident {incidentId}</h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-lg font-black font-mono text-amber-400">
              {timeLeft.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 font-bold">sec</span>
          </div>
        </div>

        {/* Incident Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <HeartPulse className="w-4 h-4" />
              Category & Severity
            </div>
            <p className="text-base font-extrabold text-white">Trauma / Cardiac Arrest</p>
            <p className="text-xs text-slate-400">
              Male, 54 y/o | Loss of consciousness, severe chest pain reported by bystander.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              Pickup Location
            </div>
            <p className="text-base font-extrabold text-white truncate">123 Medical Drive, Sector 4</p>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">1.8 km away</span> | 
              <span className="text-slate-300">Est. Arrival: 4-6 min</span>
            </p>
          </div>
        </div>

        {/* Destination Hospital & Pre-emption Corridor */}
        <div className="bg-gradient-to-r from-blue-950/60 to-slate-900/80 border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Pre-Assigned Destination</p>
              <h4 className="text-sm font-extrabold text-white">St. Jude Trauma Center (Level 1)</h4>
              <p className="text-[11px] text-slate-400">ICU Bed & Resuscitation Bay Reserved</p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-extrabold">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Green Wave Active
            </span>
            <span className="text-[10px] text-slate-400">3 Signals Preempted</span>
          </div>
        </div>

        {/* Action Buttons */}
        {status === 'pending' && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleDecline}
              className="w-full sm:w-1/3 py-3.5 px-4 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-extrabold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              DECLINE (PASS)
            </button>

            <button
              onClick={handleAccept}
              className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm rounded-2xl shadow-[0_10px_25px_rgba(229,9,20,0.5)] flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              ACCEPT & COMMENCE ROUTING
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {status === 'accepted' && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center space-y-2 animate-fade-in">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-black text-emerald-300">Dispatch Accepted</h3>
            <p className="text-xs text-emerald-200">Initializing GPS telemetry and green wave corridors...</p>
          </div>
        )}

        {status === 'declined' && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-center space-y-2 animate-fade-in">
            <div className="w-10 h-10 mx-auto rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xl">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-black text-red-300">Dispatch Passed</h3>
            <p className="text-xs text-red-200">Rerouting request to next nearest available ambulance unit...</p>
          </div>
        )}

        {/* Quick Contact Dispatcher Note */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Dispatcher Command: Sarah Jenkins (Console #4)
          </span>
          <button 
            onClick={() => alert("Calling Dispatch Console (+1 800 555-EMRG)...")}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <Phone className="w-3 h-3" /> Call Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchRequest;
