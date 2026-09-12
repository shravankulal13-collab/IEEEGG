// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen User Profile Screen
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Heart } from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/citizen')}
          className="text-xs font-bold text-blue-600 hover:underline mb-2 block"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
            SS
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Saishree Shet</h1>
            <p className="text-xs text-slate-500">Citizen ID: CIT-88492</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Location Services Verified</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Medical & Emergency Profile
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-semibold block">Blood Group</span>
              <span className="font-extrabold text-slate-900 text-sm">O Positive (O+)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-semibold block">Emergency Phone</span>
              <span className="font-extrabold text-slate-900 text-sm">+91 98765 43210</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            Primary Emergency Contacts
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Spouse / Next of Kin</p>
                <p className="text-slate-500">+91 91234 56789</p>
              </div>
              <span className="text-xs text-blue-600 font-bold">Primary</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
