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
  sidebarVariant?: 'sidebar' | 'top';
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showSidebar = true,
  sidebarVariant = 'sidebar',
}) => {
  const isTopNavigation = sidebarVariant === 'top';

  return (
    <div className="min-h-screen bg-[#071338] flex flex-col font-sans">

      {/* Global / Command Center Topbar */}
      <Topbar />

      <div className="flex-1 flex overflow-hidden">

        {/* Normal sidebar for other portals only */}
        {showSidebar && !isTopNavigation && (
          <Sidebar variant="sidebar" />
        )}

        <main
          className={
            isTopNavigation
              ? 'flex-1 overflow-y-auto'
              : 'flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8'
          }
        >
          {isTopNavigation ? (
            <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 pt-8">
              {children}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          )}
        </main>

      </div>

      <MobileNavigation />
    </div>
  );
};

export default AppShell;