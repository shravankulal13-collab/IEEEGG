// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Master Dispatcher Application Shell Layout
// ============================================================

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050B24] text-slate-100 relative">
      {/* Subtle atmospheric emergency-tech radial glows */}
      <div className="pointer-events-none absolute -top-48 -left-48 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute top-1/3 -right-48 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-48 left-1/3 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px]" />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full relative z-30">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Primary Viewport Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative z-10">
        <Topbar onOpenMobile={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 ops-page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
