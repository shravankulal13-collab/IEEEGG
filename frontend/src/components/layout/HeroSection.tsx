// ============================================================
// PRIMARY OWNER: SK / khushi.shettyyy
// ROLE: Core Platform + UI Experience Lead
// MODULE: Universal Animated Hero Section
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Radio,
  Zap,
  Building2,
} from 'lucide-react';

export interface HeroCta {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'red' | 'emerald' | 'blue' | 'white';
}

export interface TickerItem {
  icon?: React.ReactNode;
  text: string;
}

export interface HeroSectionProps {
  badgeText?: string;
  badgeDotColor?: string;
  headingPrefix?: string;
  fullBleed?: boolean;
  typewriterPhrases?: string[];
  headingSuffix?: string;
  subtitle?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  tickerItems?: (string | TickerItem)[];
  compact?: boolean;
  className?: string;
}

const DEFAULT_PHRASES = [
  'Green Signal Corridors',
  'Emergency Incident Triaging',
  'ICU Bed Allocation',
  'Ambulance Telemetry Tracking',
];

const DEFAULT_TICKER: TickerItem[] = [
  { text: 'Hospital Intake Network' },
  { text: 'PostGIS Location History' },
  { text: 'Socket.IO Realtime Telemetry' },
  { text: 'Role-Based Access Control' },
  { text: 'Dispatch Execution < 400ms' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  badgeText = 'Emergency Response & Trauma Coordination Platform',
  badgeDotColor = '#E50914',
  headingPrefix = 'Emergency Coordination &',
  fullBleed = false,
  typewriterPhrases = DEFAULT_PHRASES,
  headingSuffix = 'with ResQGrid',
  subtitle = 'Emergency incident triaging, PostGIS ambulance telemetry, traffic clearance corridors, and hospital ICU bed matching.',
  primaryCta,
  secondaryCta,
  tickerItems = DEFAULT_TICKER,
  compact = false,
  className = '',
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!typewriterPhrases || typewriterPhrases.length === 0) return;

    const currentPhrase = typewriterPhrases[phraseIndex % typewriterPhrases.length];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayedText !== currentPhrase) {
      timer = setTimeout(() => {
        setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
      }, 70);
    } else if (!isDeleting && displayedText === currentPhrase) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && displayedText !== '') {
      timer = setTimeout(() => {
        setDisplayedText(currentPhrase.slice(0, displayedText.length - 1));
      }, 40);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, phraseIndex, typewriterPhrases]);

  return (
    <section

      style={{
        background: 'radial-gradient(circle at 50% 15%, #102B7B 0%, #0B1B4F 55%, #061136 100%)',
      }}
    >
      {/* Ambient background particles & grid glow */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 text-center ${compact ? 'py-8 sm:py-10' : 'py-12 sm:py-16'}`}>

        {/* Pill Badge */}
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs sm:text-sm font-bold text-sky-300 shadow-md backdrop-blur-md mb-5 animate-fade-in hover:bg-white/15 transition-all">
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: badgeDotColor }}
            />
            <span className="tracking-wide">{badgeText}</span>
          </div>
        )}

        {/* Dynamic Animated Headline */}
        <h1 className="font-extrabold tracking-tight text-white leading-tight mb-4 text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
          {headingPrefix && <span>{headingPrefix} </span>}
          <span className="text-[#E50914] inline-block drop-shadow-[0_4px_16px_rgba(229,9,20,0.4)]">
            {displayedText}
          </span>
          <span className="inline-block w-1.5 h-8 sm:h-12 bg-red-500 animate-pulse ml-1 align-middle" />
          {headingSuffix && (
            <>
              <br className="hidden sm:inline" />
              <span> {headingSuffix}</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-slate-300 font-medium text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
        )}

        {/* CTA Buttons */}
        {(primaryCta || secondaryCta) && (
          <div className="flex items-center justify-center gap-3.5 sm:gap-4 flex-wrap mb-8">
            {primaryCta && (
              <button
                onClick={primaryCta.onClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-extrabold text-sm sm:text-base text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: primaryCta.variant === 'emerald' ? '#10B981' : primaryCta.variant === 'blue' ? '#2563EB' : '#E50914',
                  boxShadow: primaryCta.variant === 'emerald'
                    ? '0 8px 25px rgba(16, 185, 129, 0.45)'
                    : primaryCta.variant === 'blue'
                      ? '0 8px 25px rgba(37, 99, 235, 0.45)'
                      : '0 8px 25px rgba(229, 9, 20, 0.45)',
                }}
              >
                <span>{primaryCta.label}</span>
                {primaryCta.icon || <ArrowRight className="w-4 h-4" />}
              </button>
            )}

            {secondaryCta && (
              <button
                onClick={secondaryCta.onClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm sm:text-base text-slate-200 bg-white/10 border border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-sm"
              >
                {secondaryCta.icon}
                <span>{secondaryCta.label}</span>
              </button>
            )}
          </div>
        )}

        {/* Bottom Feature / Telemetry Ticker Ribbon */}
        {tickerItems && tickerItems.length > 0 && (
          <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm font-semibold text-slate-300">
            {tickerItems.map((item, idx) => {
              const isObj = typeof item === 'object' && item !== null;
              const text = isObj ? item.text : item;
              const icon = isObj ? item.icon : <Zap className="w-3.5 h-3.5 text-amber-400" />;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-all shadow-xs"
                >
                  {icon}
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
