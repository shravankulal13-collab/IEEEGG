// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Master Interactive Showcase Landing Page
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { checkApiHealth, type ApiHealthResponse } from '../services/api';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  PhoneCall,
  Navigation,
  X,
  Users,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Ambulance,
  Activity,
  Zap,
  Radio,
} from 'lucide-react';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { SplitText } from '../components/ui/SplitText';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchDemoRole } = useAuthStore();
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeModalFeature, setActiveModalFeature] = useState<{ title: string; desc: string; route: string } | null>(null);

  const handleEnterPortal = (role: 'citizen' | 'ambulance_driver' | 'dispatcher' | 'hospital_admin' | 'system_admin') => {
    const target = switchDemoRole(role);
    navigate(target);
  };

  // Typewriter Text Effect for Real Platform Capabilities
  const typewriterPhrases = [
    'Make Every Route Count',
    'Route-Deviation Detection',
    'Traffic-Aware Rerouting',
    'Emergency Telemetry',
    'Coordinated Trauma Dispatch',
  ];
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('Make Every Route Count');
  const [isDeleting, setIsDeleting] = useState(false);

  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null);

  // Health API ping
  useEffect(() => {
    let isMounted = true;
    const loadHealth = async () => {
      const data = await checkApiHealth();
      if (isMounted) setHealth(data);
    };
    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Typewriter Animation
  useEffect(() => {
    const currentPhrase = typewriterPhrases[typewriterIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayedText !== currentPhrase) {
      timeout = setTimeout(() => {
        setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
      }, 65);
    } else if (!isDeleting && displayedText === currentPhrase) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayedText !== '') {
      timeout = setTimeout(() => {
        setDisplayedText(currentPhrase.slice(0, displayedText.length - 1));
      }, 35);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setTypewriterIndex((prev) => (prev + 1) % typewriterPhrases.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, typewriterIndex]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const servicesData = [
    {
      id: 's1',
      title: 'Fracture & Trauma Stabilization',
      img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's2',
      title: 'Cardiac Arrest & Stroke Corridor',
      img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's3',
      title: 'Acute Respiratory & Infection Care',
      img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's4',
      title: 'Wound Care & Sterile Suture Units',
      subtitle: 'Sub-second digital telemetry with direct trauma surgeon pre-arrival alert.',
      isCustomCard: true,
    },
    {
      id: 's5',
      title: 'Pediatric & Neonatal Urgent Transit',
      img: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's6',
      title: 'Mass Casualty Disaster Coordination',
      img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's7',
      title: 'Advanced Life Support (ALS) Response',
      img: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's8',
      title: 'Surge Bed & ICU Room Allocation',
      subtitle: 'Automated bed availability reservation synced with active incoming ambulances.',
      isCustomCard: true,
    },
    {
      id: 's9',
      title: 'Obstetric & High-Risk Delivery Care',
      img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's10',
      title: 'Burn Trauma & Critical Care Unit',
      img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's11',
      title: 'Neurological & Brain Injury Response',
      img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
      isCustomCard: false,
    },
    {
      id: 's12',
      title: 'Toxicology & Poison Control Unit',
      subtitle: 'Instant poison control database matching and antidote dispatch coordination.',
      isCustomCard: true,
    },
  ];

  return (
    <div style={{ backgroundColor: '#F4F7FB', color: '#0F172A', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* ======================================================== */}
      {/* SECTION 1: HERO HEADER (IMAGE 1)                         */}
      {/* ======================================================== */}
      <section
        style={{
          background: 'radial-gradient(circle at 50% 20%, #102B7B 0%, #0B1B4F 55%, #061136 100%)',
          color: '#FFFFFF',
          padding: '24px 20px 80px 20px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #1E3A8A',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Topbar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <img src="/logo.png" alt="ResQGrid Logo" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
              <div style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#FFFFFF' }}>ResQ</span>
                <span style={{ color: '#E50914' }}>Grid</span>
              </div>
            </div>

            {/* Nav Menu */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', fontWeight: 600, color: '#CBD5E1' }} className="hidden md:flex">
              <button onClick={() => handleEnterPortal('citizen')} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }} className="hover:text-red-400 transition-colors">Citizen</button>
              <button onClick={() => handleEnterPortal('ambulance_driver')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }} className="hover:text-white transition-colors">Ambulance Services</button>
              <button onClick={() => handleEnterPortal('dispatcher')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }} className="hover:text-white transition-colors">Emergency Dispatch</button>
              <button onClick={() => handleEnterPortal('hospital_admin')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }} className="hover:text-white transition-colors">Hospitals</button>
              <button onClick={() => handleEnterPortal('system_admin')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }} className="hover:text-white transition-colors">Platform Admin</button>
            </nav>

            {/* Right CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {health?.status === 'healthy' && (
                <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(6, 78, 59, 0.7)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399', fontSize: '11px', fontWeight: 700 }} className="hidden sm:inline-block">
                  ● API Operational
                </span>
              )}
              <button
                onClick={() => navigate('/citizen/report')}
                style={{
                  backgroundColor: '#E50914',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 8px 20px rgba(229, 9, 20, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                className="hover:scale-105"
              >
                <span>Launch SOS Portal</span>
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          </div>

            {/* Hero Center Headline */}
            <div style={{ textAlign: 'center', paddingTop: '60px', paddingBottom: '20px', maxWidth: '960px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: 700, color: '#38BDF8', marginBottom: '20px' }}>
                <span>Emergency Response & Rapid Coordination Platform</span>
              </div>

              <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 24px 0', color: '#FFFFFF' }}>
                When Every Second Matters,<br />
                <span style={{ color: '#E50914', display: 'inline-block' }}>
                  {displayedText}
                </span>
                <br />
                with ResQGrid
              </h1>

              <p style={{ fontSize: '18px', color: '#CBD5E1', margin: '0 auto 36px auto', fontWeight: 500, maxWidth: '720px', lineHeight: 1.6 }}>
                Real-time ambulance tracking, route-deviation detection, traffic-aware rerouting, and coordinated emergency response helping emergency vehicles adapt to changing road conditions and reach critical destinations faster.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleEnterPortal('citizen')}
                  style={{
                    backgroundColor: '#E50914',
                    color: '#FFFFFF',
                    padding: '14px 32px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '15px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 25px rgba(229, 9, 20, 0.5)',
                  }}
                  className="hover:scale-105"
                >
                  <span>Launch 1-Tap SOS</span>
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>

                <button
                  onClick={() => handleEnterPortal('dispatcher')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#FFFFFF',
                    padding: '14px 32px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '15px',
                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                  className="hover:bg-white/10"
                >
                  <span>Enter Dispatch Hub</span>
                  <ArrowRight style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '6px' }} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: FEATURE RIBBON (IMAGE 2)                      */}
        {/* ======================================================== */}
        <div
          style={{
            backgroundColor: '#0B1B4F',
            color: '#FFFFFF',
            padding: '16px 0',
            borderBottom: '1px solid #1D4ED8',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div className="marquee-track" style={{ display: 'flex', gap: '48px', fontSize: '14px', fontWeight: 700, alignItems: 'center', textTransform: 'none' }}>
            {[1, 2, 3].map((loop) => (
              <React.Fragment key={loop}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap style={{ width: '16px', height: '16px', color: '#FACC15' }} />
                  Sub-500ms Dispatch Engine
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity style={{ width: '16px', height: '16px', color: '#60A5FA' }} />
                  Real-Time Telemetry Mesh
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation style={{ width: '16px', height: '16px', color: '#E50914' }} />
                  Green Signal Corridors
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 style={{ width: '16px', height: '16px', color: '#34D399' }} />
                  Trauma Hospital Network
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ambulance style={{ width: '16px', height: '16px', color: '#F87171' }} />
                  PostGIS Real-Time Telemetry
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio style={{ width: '16px', height: '16px', color: '#38BDF8' }} />
                  Socket.IO Live Mesh
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#10B981' }} />
                  Role-Based Multi-Portal RBAC
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: ULTIMATE SOLUTION (IMAGE 2 & 3)               */}
        {/* ======================================================== */}
        <section id="features" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            
            {/* Left Text Block */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', fontSize: '13px', fontWeight: 700, color: '#1E40AF', marginBottom: '20px' }}>
                <span>Emergency Care Platform</span>
              </div>

              <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, margin: '0 0 20px 0', letterSpacing: '-1.5px' }}>
                Fast & Coordinated<br />Emergency Care
              </h2>

              <div style={{ fontSize: '17px', color: '#475569', fontWeight: 500, lineHeight: 1.6 }}>
                <SplitText
                  text="Real-time coordination between patients, ambulances, and emergency hospitals."
                  textAlign="left"
                  delay={25}
                  duration={0.8}
                  splitType="chars"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  tag="p"
                />
              </div>
            </div>

          {/* Right Operational Capabilities Grid & Red Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Smart Ambulance Assignment', desc: 'Instantly finds and assigns the nearest available ambulance.', icon: <Radio style={{ width: '22px', height: '22px', color: '#E50914' }} /> },
                { title: 'Live Ambulance Tracking', desc: 'Track ambulance location and arrival time in real time.', icon: <Ambulance style={{ width: '22px', height: '22px', color: '#2563EB' }} /> },
                { title: 'Hospital Coordination', desc: 'Notifies nearby hospitals and reserves ICU beds in advance.', icon: <Building2 style={{ width: '22px', height: '22px', color: '#059669' }} /> },
                { title: 'Faster Emergency Routes', desc: 'Clears traffic signals to help emergency vehicles arrive faster.', icon: <Zap style={{ width: '22px', height: '22px', color: '#D97706' }} /> },
              ].map((item, idx) => (
                <SpotlightCard
                  key={idx}
                  spotlightColor="rgba(102, 163, 191, 0.35)"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '24px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                    minHeight: '165px',
                  }}
                >
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '6px', lineHeight: 1.25 }}>{item.title}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#475569', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </SpotlightCard>
              ))}
            </div>

            <div>
              <button
                onClick={() => navigate('/dispatcher')}
                style={{
                  backgroundColor: '#E50914',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 8px 20px rgba(229, 9, 20, 0.35)',
                }}
                className="hover:scale-105"
              >
                <span>Demo Preview</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 4: SERVICES CAROUSEL (IMAGE 3)                   */}
        {/* ======================================================== */}
        <div id="services" style={{ marginTop: '64px', position: 'relative' }}>
          
          {/* Scroll Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => scrollCarousel('left')}
              style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
            >
              <ChevronLeft style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
            >
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          {/* Continuous Marquee Track */}
          <div style={{ overflow: 'hidden', paddingBottom: '16px', margin: '0 -20px', padding: '0 20px' }}>
            <div className="services-marquee-track" style={{ gap: '24px' }}>
              {[...servicesData, ...servicesData].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => navigate('/citizen/report')}
                  style={{
                    minWidth: '270px',
                    maxWidth: '280px',
                    height: '240px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                    flexShrink: 0,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    backgroundColor: item.isCustomCard ? '#0B1B4F' : '#1E293B',
                  }}
                  className="hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {item.isCustomCard ? (
                    <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #0B1B4F 0%, #1D4ED8 100%)', color: '#FFFFFF' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px 0' }}>{item.title}</h3>
                      <p style={{ fontSize: '12px', color: '#93C5FD', margin: 0, lineHeight: 1.5 }}>{item.subtitle}</p>
                    </div>
                  ) : (
                    <>
                      <img
                        src={item.img}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: '20px',
                        }}
                      >
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                          {item.title}
                        </h3>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Centered Red Button */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button
              onClick={() => navigate('/citizen')}
              style={{
                backgroundColor: '#E50914',
                color: '#FFFFFF',
                padding: '12px 28px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 8px 20px rgba(229, 9, 20, 0.35)',
              }}
              className="hover:scale-105"
            >
              <span>View All Emergency Services</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </section>
      {/* ======================================================== */}
      {/* SECTION 5: USER JOURNEY WORKFLOW                          */}
      {/* ======================================================== */}
      <section id="advantages" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', backgroundColor: '#E0F2FE', border: '1px solid #BAE6FD', fontSize: '13px', fontWeight: 700, color: '#3368A0', marginBottom: '16px' }}>
            <span>How ResQGrid Helps</span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-1px', margin: '0 0 16px 0', lineHeight: 1.2 }}>
            From Emergency Call to Hospital — We Keep Every Step Connected
          </h2>

          <p style={{ fontSize: '16px', color: '#475569', fontWeight: 500, maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            ResQGrid connects citizens, ambulances, dispatch teams, and hospitals to coordinate emergency response in real time.
          </p>
        </div>

        {/* 5-Step Journey Timeline Container */}
        <div style={{ position: 'relative' }}>
          
          {/* Connecting Line (Desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block"
            style={{
              position: 'absolute',
              top: '42px',
              left: '8%',
              right: '8%',
              height: '3px',
              backgroundColor: '#C8DFDB',
              zIndex: 0,
              borderRadius: '9999px',
            }}
          />

          {/* 5 Step Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', position: 'relative', zIndex: 1 }}>
            {[
              {
                step: '01',
                title: 'Emergency Reported',
                desc: 'Citizen sends an emergency request.',
                icon: <PhoneCall style={{ width: '22px', height: '22px', color: '#3368A0' }} />,
                accentColor: '#3368A0',
              },
              {
                step: '02',
                title: 'Ambulance Assigned',
                desc: 'Quickly identify an available ambulance near the emergency.',
                icon: <Ambulance style={{ width: '22px', height: '22px', color: '#3368A0' }} />,
                accentColor: '#3368A0',
              },
              {
                step: '03',
                title: 'Live Tracking',
                desc: 'Follow the ambulance as it moves toward the emergency location.',
                icon: <Navigation style={{ width: '22px', height: '22px', color: '#66A3BF' }} />,
                accentColor: '#66A3BF',
              },
              {
                step: '04',
                title: 'Route Updated',
                desc: 'If traffic or a road problem occurs, the route can be changed.',
                icon: <Zap style={{ width: '22px', height: '22px', color: '#E50914' }} />,
                accentColor: '#E50914',
              },
              {
                step: '05',
                title: 'Hospital Prepared',
                desc: 'Help identify a suitable hospital before the ambulance arrives.',
                icon: <Building2 style={{ width: '22px', height: '22px', color: '#3368A0' }} />,
                accentColor: '#3368A0',
              },
            ].map((item, idx) => (
              <SpotlightCard
                key={idx}
                spotlightColor="rgba(102, 163, 191, 0.25)"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                }}
                className="hover:-translate-y-2 hover:shadow-lg hover:border-[#66A3BF]"
              >
                {/* Step Badge & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: item.accentColor, backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '9999px', letterSpacing: '0.5px' }}>
                    {item.step}
                  </span>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                    {item.desc}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: CORE OPERATIONAL MODULES                      */}
      {/* ======================================================== */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', fontSize: '12px', fontWeight: 700, color: '#1E40AF', marginBottom: '16px' }}>
            <span>Operational Subsystems</span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-1.5px', margin: 0 }}>
            Core operational modules & capabilities
          </h2>
        </div>

        {/* 3 Columns of Operational Module Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px 24px' }}>
          
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              onClick={() => navigate('/citizen/report')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldAlert style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Emergency Incident Reporting</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Instant GPS coordinate capture and emergency categorization.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/hospital/doctors')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Specialist Doctors Directory</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Roster of on-call trauma surgeons and hospital staff shifts.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/hospital/resources')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>ICU & Bed Capacity Management</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Persisted capacity tracking for emergency beds and ventilators.</p>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              onClick={() => navigate('/ambulance/status')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ambulance style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>ALS Fleet Diagnostics</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Oxygen levels, defibrillator capacitor readiness, and GPS accuracy.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/dispatcher/routes')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Navigation style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Green Signal Corridors</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Dynamic traffic signal preemption along active emergency routes.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/dispatcher/traffic')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Activity style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Live Traffic Integration</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Real-time congestion heatmaps from MapMyIndia and traffic feeds.</p>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              onClick={() => navigate('/dispatcher/analytics')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Operational SLA Analytics</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Response times, P50/P90 metrics, and triage distribution.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/admin')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>System Administration</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Provider circuit breaker state, database health, and microservice status.</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/dispatcher/audit')}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              className="hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0B1B4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Radio style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Audit Compliance Logs</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Immutable traceability of all operational decisions and dispatch overrides.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* PROFESSIONAL FOOTER                                     */}
      {/* ======================================================== */}
      <footer
        style={{
          background: 'linear-gradient(180deg, #070F2B 0%, #030712 100%)',
          color: '#CBD5E1',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '72px',
          paddingBottom: '36px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Main Footer Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '48px',
              paddingBottom: '56px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            
            {/* Column 1: Brand Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                onClick={() => navigate('/')}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', width: 'fit-content' }}
              >
                <img
                  src="/logo.png"
                  alt="ResQGrid Logo"
                  style={{
                    width: '46px',
                    height: '46px',
                    objectFit: 'contain',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '2px',
                    boxShadow: '0 0 20px rgba(229, 9, 20, 0.25)',
                  }}
                />
                <div style={{ fontWeight: 900, fontSize: '26px', letterSpacing: '-0.5px' }}>
                  <span style={{ color: '#FFFFFF' }}>ResQ</span>
                  <span style={{ color: '#E50914' }}>Grid</span>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.65, margin: 0, maxWidth: '320px' }}>
                Next-generation emergency response and trauma care coordination platform connecting citizens, ambulances, dispatch hubs, and emergency hospitals in real time.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 8px #10B981',
                    }}
                  />
                  Live Network Active • 24/7 Operations
                </span>
              </div>
            </div>

            {/* Column 2: Operational Portals */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 800, marginBottom: '20px', letterSpacing: '0.3px', textTransform: 'uppercase', opacity: 0.9 }}>
                Operational Portals
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <li>
                  <button
                    onClick={() => handleEnterPortal('citizen')}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                    className="hover:text-white transition-colors group"
                  >
                    <span className="text-red-500 font-bold group-hover:translate-x-1 transition-transform">›</span>
                    Citizen Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleEnterPortal('ambulance_driver')}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                    className="hover:text-white transition-colors group"
                  >
                    <span className="text-red-500 font-bold group-hover:translate-x-1 transition-transform">›</span>
                    Ambulance Services Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleEnterPortal('dispatcher')}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                    className="hover:text-white transition-colors group"
                  >
                    <span className="text-red-500 font-bold group-hover:translate-x-1 transition-transform">›</span>
                    Emergency Dispatch Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleEnterPortal('hospital_admin')}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                    className="hover:text-white transition-colors group"
                  >
                    <span className="text-red-500 font-bold group-hover:translate-x-1 transition-transform">›</span>
                    Hospitals Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleEnterPortal('system_admin')}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                    className="hover:text-white transition-colors group"
                  >
                    <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform">›</span>
                    Platform Administration
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: System Capabilities */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 800, marginBottom: '20px', letterSpacing: '0.3px', textTransform: 'uppercase', opacity: 0.9 }}>
                Core Capabilities
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#94A3B8' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#60A5FA' }} />
                  Smart Ambulance Assignment
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#60A5FA' }} />
                  Live GPS Route & Telemetry
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#60A5FA' }} />
                  Hospital ICU Bed Reservation
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#60A5FA' }} />
                  Traffic Corridor Signal Priority
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#60A5FA' }} />
                  Instant Emergency Incident Triaging
                </li>
              </ul>
            </div>

            {/* Column 4: 24/7 Emergency Helpline */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 800, marginBottom: '20px', letterSpacing: '0.3px', textTransform: 'uppercase', opacity: 0.9 }}>
                Emergency Support
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <a
                  href="tel:108"
                  style={{
                    backgroundColor: 'rgba(229, 9, 20, 0.12)',
                    border: '1px solid rgba(229, 9, 20, 0.35)',
                    color: '#F87171',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 4px 16px rgba(229, 9, 20, 0.15)',
                  }}
                  className="hover:border-red-500 hover:bg-red-600/20 hover:scale-[1.02]"
                >
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(229, 9, 20, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhoneCall style={{ width: '20px', height: '20px', color: '#E50914' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#FCA5A5', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Toll-Free Emergency
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                      Dial 108
                    </span>
                  </div>
                </a>

                <p style={{ color: '#94A3B8', fontSize: '12px', lineHeight: 1.55, margin: 0 }}>
                  Active 24/7 central dispatch supervision across regional medical networks.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Bar / Sub-footer */}
          <div
            style={{
              paddingTop: '32px',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              fontSize: '12px',
              color: '#64748B',
            }}
          >
            <div>
              © 2026 ResQGrid Emergency & Trauma Coordination Network. All rights reserved.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <span style={{ cursor: 'pointer' }} className="hover:text-white transition-colors" onClick={() => navigate('/citizen')}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }} className="hover:text-white transition-colors" onClick={() => navigate('/citizen')}>Terms of Service</span>
              <span style={{ cursor: 'pointer' }} className="hover:text-white transition-colors" onClick={() => navigate('/citizen')}>Security Protocol</span>
              <span style={{ cursor: 'pointer' }} className="hover:text-white transition-colors" onClick={() => navigate('/dispatcher')}>System Health</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Red Help / SOS Button */}
      <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 50 }}>
        <button
          onClick={() => setIsHelpModalOpen(true)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#E50914',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(229, 9, 20, 0.5)',
          }}
          className="btn-pulse-glow hover:scale-110"
        >
          <HelpCircle style={{ width: '24px', height: '24px' }} />
        </button>
      </div>

      {/* Floating Scroll to Top */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 40 }} className="hidden sm:block">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#E50914',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(229, 9, 20, 0.4)',
          }}
          className="hover:scale-110"
        >
          <ChevronUp style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* Modal Help / SOS */}
      {isHelpModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', position: 'relative', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <button
              onClick={() => setIsHelpModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#E50914', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <HelpCircle style={{ width: '32px', height: '32px' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0' }}>Emergency Assistance & Help</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Instant assistance for citizens and response crews. Launch automated 1-Tap GPS dispatch or dial 108.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsHelpModalOpen(false);
                  navigate('/citizen/report');
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#E50914', color: '#FFFFFF', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer' }}
              >
                Launch Automated 1-Tap SOS
              </button>
              <a
                href="tel:108"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#F1F5F9', color: '#0F172A', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <PhoneCall style={{ width: '16px', height: '16px', color: '#16A34A' }} />
                <span>Call Emergency 108</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Feature Modal */}
      {activeModalFeature && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', maxWidth: '460px', width: '100%', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <button
              onClick={() => setActiveModalFeature(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0' }}>{activeModalFeature.title}</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              {activeModalFeature.desc}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setActiveModalFeature(null)}
                style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const route = activeModalFeature.route;
                  setActiveModalFeature(null);
                  navigate(route);
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#E50914', color: '#FFFFFF', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer' }}
              >
                Launch Module Portal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
