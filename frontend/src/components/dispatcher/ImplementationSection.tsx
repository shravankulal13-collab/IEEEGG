// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: ResQGrid Implementation & Response Flow Presentation
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Truck,
  Building2,
  GitFork,
  BarChart3,
  ShieldCheck,
  Bell,
  Users2,
  ArrowRight,
  FileText,
  Headphones,
  ArrowUp,
  Activity,
} from 'lucide-react';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  linkText: string;
  route?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  hoverBorder: string;
}

const MODULES: ModuleCard[] = [
  {
    id: 'incidents',
    title: 'Incident Management',
    description: 'View and manage real-time incidents from multiple channels.',
    linkText: 'Learn more',
    route: '/dispatcher/incidents',
    icon: PhoneCall,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    borderColor: 'border-red-100',
    hoverBorder: 'hover:border-red-400',
  },
  {
    id: 'fleet',
    title: 'Ambulance Fleet',
    description: 'Track ambulance location, status and ETA in real-time.',
    linkText: 'Learn more',
    route: '/dispatcher/fleet',
    icon: Truck,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#2563EB]',
    borderColor: 'border-blue-100',
    hoverBorder: 'hover:border-blue-400',
  },
  {
    id: 'hospitals',
    title: 'Hospital Network',
    description: 'Coordinate with nearby hospitals and check bed availability.',
    linkText: 'Learn more',
    icon: Building2,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-100',
    hoverBorder: 'hover:border-teal-400',
  },
  {
    id: 'traffic',
    title: 'Traffic & Routing',
    description: 'Enable faster routes with real-time traffic insights and clearance.',
    linkText: 'Learn more',
    icon: GitFork,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-100',
    hoverBorder: 'hover:border-purple-400',
  },
  {
    id: 'analytics',
    title: 'Operational Analytics',
    description: 'Monitor response metrics, SLA and system performance.',
    linkText: 'Learn more',
    route: '/dispatcher/analytics',
    icon: BarChart3,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-100',
    hoverBorder: 'hover:border-amber-400',
  },
  {
    id: 'audit',
    title: 'Audit & Compliance',
    description: 'Maintain logs, track actions and ensure accountability.',
    linkText: 'Learn more',
    route: '/dispatcher/audit',
    icon: ShieldCheck,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    borderColor: 'border-sky-100',
    hoverBorder: 'hover:border-sky-400',
  },
  {
    id: 'alerts',
    title: 'Alert Stream',
    description: 'Receive real-time notifications across all agencies.',
    linkText: 'Learn more',
    route: '/dispatcher/notifications',
    icon: Bell,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-100',
    hoverBorder: 'hover:border-rose-400',
  },
  {
    id: 'coordination',
    title: 'Multi-Agency Coordination',
    description: 'Unified operations for police, ambulance, hospitals and civic authorities.',
    linkText: 'Learn more',
    icon: Users2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    hoverBorder: 'hover:border-emerald-400',
  },
];

const FLOW_STEPS = [
  {
    step: '1. Incident Reported',
    desc: 'Citizen reports an emergency',
    badge: 'SOS',
    icon: PhoneCall,
    color: 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]',
    dotColor: 'bg-red-500',
  },
  {
    step: '2. Incident Processing',
    desc: 'Incident is validated and prioritized',
    badge: 'LOG',
    icon: FileText,
    color: 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]',
    dotColor: 'bg-blue-500',
  },
  {
    step: '3. Dispatch & Coordinate',
    desc: 'Nearest ambulance is assigned',
    badge: 'OPS',
    icon: Headphones,
    color: 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    dotColor: 'bg-cyan-500',
  },
  {
    step: '4. En Route',
    desc: 'Real-time tracking and traffic clearance',
    badge: 'GPS',
    icon: Truck,
    color: 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    dotColor: 'bg-blue-400',
  },
  {
    step: '5. Hospital Handover',
    desc: 'Patient is transferred to the right hospital',
    badge: 'CARE',
    icon: Building2,
    color: 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    dotColor: 'bg-emerald-500',
  },
];

export const ImplementationSection: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Intersection observer to trigger staggered card reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Subtle cycling highlight along workflow steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative mt-12 select-none" ref={sectionRef}>
      {/* 1. Clean Subtle Separator */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-8">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* 2. Pristine White Implementation Canvas */}
      <div className="bg-white text-slate-900 px-4 md:px-8 lg:px-12 py-6 md:py-10 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="max-w-[1600px] mx-auto space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>BUILT FOR REAL IMPACT</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                How <span className="text-[#07133A]">ResQ</span>
                <span className="text-[#FF1F2D]">Grid</span> Works
              </h2>
              <p className="text-sm md:text-base text-slate-600 mt-2 max-w-2xl font-medium">
                Integrated modules working together for a safer, faster and more efficient emergency response.
              </p>
            </div>

            {/* Right Side EKG Medical Trust Accent */}
            <div className="hidden lg:flex items-center gap-4 text-right">
              <div className="flex flex-col text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-800 uppercase tracking-wider">Technology • People</span>
                <span>Safer Communities</span>
              </div>
              <div className="w-32 h-10 flex items-center justify-center">
                <svg className="w-full h-8" viewBox="0 0 120 30" fill="none">
                  <path
                    d="M0 15 H40 L45 5 L55 25 L65 8 L72 18 L76 15 H120"
                    stroke="#FF1F2D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ops-ekg-line"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. Staggered 8 Implementation Architecture Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MODULES.map((mod, index) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => mod.route && navigate(mod.route)}
                  style={{
                    transitionDelay: `${index * 80}ms`,
                  }}
                  className={`group relative rounded-2xl bg-white border ${mod.borderColor} ${mod.hoverBorder} p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform cursor-pointer flex flex-col justify-between ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  } hover:-translate-y-1.5`}
                >
                  <div>
                    {/* Module Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl ${mod.iconBg} ${mod.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-xs`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-slate-900 tracking-tight font-display mb-1.5 group-hover:text-blue-600 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  {/* Action Link with Arrow */}
                  <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                      {mod.linkText}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. The Response Flow (Emergency Workflow Sequence) */}
          <div className="pt-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold font-mono uppercase tracking-widest text-red-500 mb-1">
                  FROM INCIDENT TO IMPACT
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  The Response Flow
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                  A seamless journey from distress call to hospital handover.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>Lives Move Forward</span>
                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
            </div>

            {/* Horizontal Workflow Stepper (Responsive Stack on Mobile) */}
            {/* Horizontal Workflow Stepper with Animated Telemetry Signal Line */}
            <div className="relative">
              {/* Telemetry connection line on desktop */}
              <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-slate-100 z-0">
                <div className="h-full bg-gradient-to-r from-red-500 via-blue-500 to-emerald-500 ops-telemetry-line opacity-80" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                {FLOW_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isHighlighted = activeStep === idx;
                  return (
                    <div
                      key={step.step}
                      className={`relative rounded-2xl p-5 border transition-all duration-300 flex flex-col items-center text-center ${
                        isHighlighted
                          ? 'bg-slate-50/90 border-blue-300 shadow-md ring-1 ring-blue-200'
                          : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      {/* Step Icon Badge */}
                      <div
                        className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-3.5 transition-transform duration-300 ${
                          isHighlighted ? 'scale-110' : ''
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      {/* Step Name */}
                      <h4 className="text-xs font-bold text-slate-900 tracking-tight font-display mb-1">
                        {step.step}
                      </h4>

                      {/* Step Explanation */}
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {step.desc}
                      </p>

                      {/* Connected Arrow Indicator on Desktop */}
                      {idx < FLOW_STEPS.length - 1 && (
                        <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center shadow-xs text-slate-400">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Stronger Systems. Safer Communities. White Operational CTA Card */}
        <div className="mt-14 pt-10 border-t border-slate-100">
          <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 p-8 md:p-10 text-center shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-[#2563EB] text-xs font-bold tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>COMMUNITY-FIRST DISPATCH EXCELLENCE</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-display mb-2">
              Stronger Systems. <span className="text-[#FF1F2D]">Safer Communities.</span>
            </h3>

            <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-6">
              Integrated emergency response coordination powering real-time dispatch, route clearance, and hospital trauma preparedness.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-600 shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Continue to Dispatch Hub</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dispatcher/incidents')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs transition-all"
              >
                <span>View Active Incident Queue</span>
                <ArrowRight className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
