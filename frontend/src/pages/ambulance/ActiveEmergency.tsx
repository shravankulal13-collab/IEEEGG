// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Active Emergency Driver Operational Controls
// ============================================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAmbulanceStore } from '../../store/ambulanceStore';

export const ActiveEmergency: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incidentId') || 'ER-2048';
  const { updateStatus } = useAmbulanceStore();

  const [currentStage, setCurrentStage] = useState<'dispatched' | 'en_route' | 'on_scene' | 'transporting' | 'completed'>('en_route');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageChange = async (nextStage: 'en_route' | 'on_scene' | 'transporting' | 'completed') => {
    setIsUpdating(true);
    try {
      const statusMap: Record<string, string> = {
        en_route: 'en_route_to_incident',
        on_scene: 'on_scene',
        transporting: 'transporting',
        completed: 'available',
      };

      await updateStatus('amb-104-id', statusMap[nextStage], incidentId);
      setCurrentStage(nextStage);
      setIsUpdating(false);

      if (nextStage === 'completed') {
        alert('Mission Completed! Status reset to AVAILABLE.');
        navigate('/ambulance');
      }
    } catch (error) {
      setCurrentStage(nextStage);
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/ambulance')}
          className="text-xs font-bold text-blue-400 hover:underline block"
        >
          ← Back to Driver Dashboard
        </button>

        {/* Incident Summary Card */}
        <div className="bg-slate-800 border-2 border-red-600 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <span className="text-[10px] font-bold text-red-400 tracking-wider">ACTIVE EMERGENCY RESPONSE</span>
              <h1 className="text-2xl font-black text-white">Incident {incidentId}</h1>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full uppercase">
              {currentStage.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-bold">Destination:</span>
              <span className="text-slate-100">123 Medical Drive, High-Fidelity City</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-bold">Citizen Contact:</span>
              <span className="text-slate-100">+91 98765 43210</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate(`/ambulance/navigation?incidentId=${incidentId}`)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Open Turn-by-Turn Navigation Map
            </button>
          </div>
        </div>

        {/* State Machine Operational Action Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase">
            RESPONSE LIFECYCLE CONTROLS
          </h2>

          <div className="space-y-3">
            {currentStage === 'dispatched' && (
              <button
                onClick={() => handleStageChange('en_route')}
                disabled={isUpdating}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Start Response (Mark En Route)
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStage === 'en_route' && (
              <button
                onClick={() => handleStageChange('on_scene')}
                disabled={isUpdating}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Mark Arrived at Patient Scene
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            {currentStage === 'on_scene' && (
              <button
                onClick={() => handleStageChange('transporting')}
                disabled={isUpdating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Begin Transport to Hospital
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStage === 'transporting' && (
              <button
                onClick={() => handleStageChange('completed')}
                disabled={isUpdating}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Complete Mission & Mark Available
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
