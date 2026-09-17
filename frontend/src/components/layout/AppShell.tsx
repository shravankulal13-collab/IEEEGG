// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Application Shell Master Layout
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';

export interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans overflow-x-hidden">
      <Topbar />
      <div className="flex-1 flex min-h-0">
        {showSidebar && <Sidebar />}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
};
