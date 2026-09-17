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
      {/* Ambient background particles & grid glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          {/* Pill Tag */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {pillTag ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-sky-300 shadow-xs backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>{pillTag}</span>
              </div>
            ) : null}
            {badge}
          </div>

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
