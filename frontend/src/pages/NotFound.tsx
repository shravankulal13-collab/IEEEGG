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
    <div className="min-h-screen bg-[#061136] text-white flex flex-col justify-center items-center px-4 font-sans text-center relative overflow-hidden">
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 -right-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-lg mx-auto bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-600/20 border border-red-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-red-600/20">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-rose-400 block">
          404 • Page Not Found
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Incident Unreachable
        </h1>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          The requested coordinate or subsystem does not exist or has been relocated by emergency command.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </button>

          <button
            onClick={() => navigate('/citizen/report')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#E50914] hover:bg-[#D9232D] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition active:scale-95 cursor-pointer"
          >
            <Siren className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

