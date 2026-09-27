// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: PageHeader & Animated Hero Banner Component
// ============================================================

import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  typewriterPhrase?: string;
  pillTag?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  typewriterPhrase,
  pillTag,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-[#1E3A8A]/50 select-none ${className}`}
      style={{
        background: 'radial-gradient(circle at 40% 20%, #102B7B 0%, #0B1B4F 60%, #061136 100%)',
      }}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          {badge && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {badge}
            </div>
          )}

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
            {title}
            {typewriterPhrase && (
              <span className="text-[#E50914] ml-2 inline-block drop-shadow-[0_2px_10px_rgba(229,9,20,0.4)]">
                {typewriterPhrase}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
