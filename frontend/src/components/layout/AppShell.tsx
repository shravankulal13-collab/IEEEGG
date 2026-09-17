// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Application Shell Master Layout (Top-Navigation Structure)
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';
import { Topbar } from './Topbar';

export interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean; // Maintained for backward compatibility
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans text-slate-900">
      <Topbar />
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
