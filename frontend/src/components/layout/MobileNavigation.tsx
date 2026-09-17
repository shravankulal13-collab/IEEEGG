// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Mobile Navigation Bar
// ============================================================

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Radio, Ambulance, LayoutDashboard, Building2, Globe2 } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getMobileLinks = () => {
    const role = user?.role || 'citizen';
    if (role === 'ambulance_driver') {
      return [
        { label: 'Fleet', path: '/ambulance', icon: <Ambulance className="w-5 h-5" /> },
        { label: 'Active', path: '/ambulance/active', icon: <Radio className="w-5 h-5" /> },
        { label: 'Public', path: '/public', icon: <Globe2 className="w-5 h-5" /> },
      ];
    }
    if (role === 'dispatcher') {
      return [
        { label: 'Dispatch', path: '/dispatcher', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Fleet', path: '/dispatcher/fleet', icon: <Ambulance className="w-5 h-5" /> },
        { label: 'Public', path: '/public', icon: <Globe2 className="w-5 h-5" /> },
      ];
    }
    if (role === 'hospital_admin') {
      return [
        { label: 'Medical', path: '/hospital', icon: <Building2 className="w-5 h-5" /> },
        { label: 'Inbound', path: '/hospital/emergency', icon: <Radio className="w-5 h-5" /> },
        { label: 'Public', path: '/public', icon: <Globe2 className="w-5 h-5" /> },
      ];
    }
    return [
      { label: 'SOS Home', path: '/citizen', icon: <Radio className="w-5 h-5" /> },
      { label: 'Report', path: '/citizen/report', icon: <Radio className="w-5 h-5" /> },
      { label: 'Public', path: '/public', icon: <Globe2 className="w-5 h-5" /> },
    ];
  };

  const links = getMobileLinks();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 px-3 py-2 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-lg transition-colors ${
              isActive ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </button>
        );
      })}
    </div>
  );
};
