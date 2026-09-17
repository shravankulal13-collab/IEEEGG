// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: 404 Not Found Page
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, Siren } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col justify-center items-center px-4 font-sans text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-[#E50914] text-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-600/40 animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="text-sm font-extrabold uppercase tracking-widest text-red-500 mb-2 block">
          Error 404 | Incident Unreachable
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
          Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mb-8 leading-relaxed">
          The requested coordinate or platform subsystem does not exist or has been relocated by emergency command.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </button>

          <button
            onClick={() => navigate('/citizen/report')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#E50914] hover:bg-[#D9232D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition-transform hover:scale-105 active:scale-95"
          >
            <Siren className="w-4 h-4 animate-pulse" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
