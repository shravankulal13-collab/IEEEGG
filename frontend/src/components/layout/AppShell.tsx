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
  sidebarVariant?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen flex flex-col font-sans text-slate-100 relative selection:bg-red-500 selection:text-white"
      style={{
        backgroundColor: '#061136',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #102B7B 0%, #0B1B4F 45%, #061136 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Ambient glowing radial lights */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      <Topbar />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;