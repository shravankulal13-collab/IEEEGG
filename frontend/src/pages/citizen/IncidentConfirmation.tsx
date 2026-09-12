// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Incident Confirmation Screen (Stitch Reference 3)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Phone, RefreshCw, Compass } from 'lucide-react';

export const IncidentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const incidentId = searchParams.get('incidentId') || 'ER-2048';
  const location = searchParams.get('location') || '123 Medical Drive';

  const [step, setStep] = useState<number>(2); // 1: reported, 2: dispatching, 3: assigned, 4: en_route

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(3), 2500);
    const timer2 = setTimeout(() => setStep(4), 5000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Top Checkmark Header */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Emergency request received</h1>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
            Help is on the way. Please stay calm and remain at your location.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">INCIDENT ID</span>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{incidentId}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{location}</span>
            </div>
          </div>

          {/* Dynamic Status Pill */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-blue-700">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <span>
              {step < 3
                ? 'Finding nearest ambulance...'
                : step === 3
                ? 'Ambulance AMB-104 assigned!'
                : 'Ambulance AMB-104 is En Route'}
            </span>
          </div>

          {/* Response Timeline */}
          <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Step 1 */}
            <div className="relative flex items-start gap-3">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Emergency reported</p>
                <p className="text-[10px] text-slate-400">Just now</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                  step >= 2
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {step >= 2 ? '•' : ''}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Dispatch initiated</p>
                <p className="text-[10px] text-slate-400">Identifying closest units</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                  step >= 3
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-slate-300'
                }`}
              >
                {step >= 3 ? '✓' : ''}
              </div>
              <div>
                <p className={`text-xs font-bold ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Ambulance assigned
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                  step >= 4
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-slate-300'
                }`}
              >
                {step >= 4 ? '✓' : ''}
              </div>
              <div>
                <p className={`text-xs font-bold ${step >= 4 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Ambulance en route
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/citizen/tracking?incidentId=${incidentId}`)}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            {step < 4 ? 'Initializing Live Tracking...' : 'Open Live Tracking'}
          </button>
          <button
            onClick={() => alert('Contacting Dispatch Center: 112 / 108')}
            className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            Contact Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};
