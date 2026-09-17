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
    'Emergency Medical Response',
    'Ambulance Dispatch',
    'Medical Coordination',
    'Green Signal Corridors',
    'Hospital Bed Allocation',
  ];
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('Emergency Medical Response');
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
      title: 'Fracture & Medical Stabilization',
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
      subtitle: 'Sub-second digital telemetry with direct medical team pre-arrival alert.',
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
  ];

  return (
    <div className="landing-page" style={{ backgroundColor: '#F4F7FB', color: '#0F172A', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
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
        <div className="landing-hero-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Topbar Header */}
          <div className="landing-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#38BDF8', display: 'inline-block' }} />
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#E50914', display: 'inline-block' }} />
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'inline-block' }} />
              </div>
              <div style={{ fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#FFFFFF' }}>ResQ</span>
                <span style={{ color: '#E50914' }}>Grid</span>
              </div>
            </div>

            {/* Nav Menu */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', fontWeight: 600, color: '#CBD5E1' }} className="hidden md:flex">
              <button onClick={() => handleEnterPortal('citizen')} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>Citizen SOS</button>
              <button onClick={() => handleEnterPortal('ambulance_driver')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }}>Driver Fleet</button>
              <button onClick={() => handleEnterPortal('dispatcher')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }}>Command Hub</button>
              <button onClick={() => handleEnterPortal('hospital_admin')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }}>Medical Network</button>
              <button onClick={() => handleEnterPortal('system_admin')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }}>Diagnostics</button>
            </nav>

            {/* Right CTAs */}
            <div className="landing-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                className="landing-header-cta hover:scale-105"
              >
                <span>Launch SOS Portal</span>
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          </div>

            {/* Hero Center Headline */}
            <div className="landing-hero-copy" style={{ textAlign: 'center', paddingTop: '60px', paddingBottom: '20px', maxWidth: '960px', margin: '0 auto' }}>
              <div className="landing-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: 700, color: '#38BDF8', marginBottom: '20px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E50914', display: 'inline-block' }} />
                <span>Emergency medical response grid</span>
              </div>

              <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 24px 0', color: '#FFFFFF' }}>
                Create your<br />
                <span style={{ color: '#E50914', display: 'inline-block' }}>
                  {displayedText}
                </span>
                <span className="typewriter-cursor" />
                <br />
                network with ResQGrid
              </h1>

              <p style={{ fontSize: '18px', color: '#CBD5E1', margin: '0 auto 36px auto', fontWeight: 500, maxWidth: '720px', lineHeight: 1.6 }}>
                Sub-second incident triaging, PostGIS ambulance telemetry, dynamic traffic clearance corridors, and automated hospital ICU bed matching.
              </p>

              <div className="landing-hero-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                  Medical Hospital Network
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
        <section id="features" className="landing-section" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="landing-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            
            {/* Left Text Block */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', fontSize: '12px', fontWeight: 700, color: '#1E40AF', marginBottom: '20px' }}>
                <span>Operational Emergency Medical Response Grid</span>
              </div>

              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, margin: '0 0 16px 0', letterSpacing: '-1px' }}>
                The Operational Core for<br />Emergency & Urgent Care
              </h2>

              <p style={{ fontSize: '15px', color: '#475569', fontWeight: 600, margin: '0 0 28px 0' }}>
                Real-time situational coordination across dispatch, fleet, and medical facilities.
              </p>
            </div>

          {/* Right Operational Capabilities & Red Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { title: 'Automated Dispatch Matrix', desc: 'Multi-criteria spatial proximity scoring', icon: <Radio style={{ width: '16px', height: '16px', color: '#E50914' }} /> },
                { title: 'PostGIS Geofenced Fleet Tracking', desc: 'Real-time vehicle telemetry and status', icon: <Ambulance style={{ width: '16px', height: '16px', color: '#2563EB' }} /> },
                { title: 'Hospital Medical Unit Synchronization', desc: 'ICU and Cath Lab bed reservation', icon: <Building2 style={{ width: '16px', height: '16px', color: '#059669' }} /> },
                { title: 'Emergency Traffic Corridors', desc: 'Active green wave signal preemption', icon: <Zap style={{ width: '16px', height: '16px', color: '#D97706' }} /> },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>{item.desc}</div>
                  </div>
                </div>
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

          {/* Cards Track */}
          <div
            ref={carouselRef}
            className="no-scrollbar"
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              paddingBottom: '16px',
              scrollBehavior: 'smooth',
            }}
          >
            {servicesData.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/citizen/report')}
                style={{
                  minWidth: '260px',
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
                className="hover:-translate-y-1 hover:shadow-xl"
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
      {/* SECTION 5: CORE SYSTEM CAPABILITIES (IMAGE 4)            */}
      {/* ======================================================== */}
      <section id="advantages" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', fontSize: '12px', fontWeight: 700, color: '#1E40AF', marginBottom: '16px' }}>
            <span>System Architecture & Telemetry</span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-1px', margin: 0 }}>
            System capabilities that power ResQGrid
          </h2>
        </div>

        {/* 3 Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Dark Slate Spatial Dispatch Card */}
          <div
            style={{
              backgroundColor: '#060D1E',
              borderRadius: '24px',
              padding: '32px',
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(6, 13, 30, 0.35)',
              border: '1px solid #1E3A8A',
              color: '#FFFFFF',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Spatial Dispatch
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: '8px 0 12px 0' }}>
                PostGIS Fleet Telematics
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                Sub-second geospatial indexing of active ambulances, incident geocoding, and shortest road-network paths.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: '#94A3B8' }}>Active Nodes</span>
                <span style={{ color: '#34D399', fontWeight: 700 }}>18 Fleet Units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94A3B8' }}>Traffic Signals Preempted</span>
                <span style={{ color: '#FACC15', fontWeight: 700 }}>3 Junctions</span>
              </div>
            </div>
          </div>

          {/* Card 2: Metric Benchmarks */}
          <div
            style={{
              background: 'linear-gradient(135deg, #CBD5E1 0%, #E2E8F0 50%, #C7D2FE 100%)',
              borderRadius: '24px',
              padding: '32px',
              minHeight: '340px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Platform Telemetry
              </span>
              <h3 style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', margin: '8px 0 4px 0' }}>99.98%</h3>
              <p style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>System Uptime & PostGIS Availability</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 600 }}>Avg Arrival ETA</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#16A34A' }}>7.4 min</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 600 }}>Dispatch Latency</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#2563EB' }}>&lt; 380 ms</span>
              </div>
            </div>
          </div>

          {/* Card 3: Stacked 2 Right Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                backgroundColor: '#FFF1F2',
                borderRadius: '24px',
                padding: '24px 28px',
                border: '1px solid #FFE4E6',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall style={{ width: '20px', height: '20px', color: '#BE123C' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Emergency Control Center
                  </h3>
                  <span style={{ fontSize: '12px', color: '#E11D48', fontWeight: 700 }}>24/7 Incident Dispatch</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Instant verification pipeline connecting citizen reports to active responders.
              </p>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
                borderRadius: '24px',
                padding: '24px 28px',
                border: '1px solid #DCFCE7',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 style={{ width: '20px', height: '20px', color: '#15803D' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Medical Hospital Network
                  </h3>
                  <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>42 ICU Beds Available</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Real-time bed availability and on-call medical specialist matching.
              </p>
            </div>
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
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Roster of on-call medical specialists and hospital staff shifts.</p>
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
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>Real-time congestion heatmaps from TomTom and traffic feeds.</p>
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
      {/* SECTION 7: OPERATIONAL PORTALS DIRECTORY                 */}
      {/* ======================================================== */}
      <section
        style={{
          backgroundColor: '#0B1B4F',
          color: '#FFFFFF',
          padding: '80px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Access ResQGrid Operational Portals
          </h2>

          <p style={{ fontSize: '15px', color: '#CBD5E1', margin: '0 auto 36px auto', maxWidth: '650px', fontWeight: 500 }}>
            Unified coordination across citizens, paramedics, dispatchers, and medical centers.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleEnterPortal('citizen')}
              style={{ backgroundColor: '#E50914', color: '#FFFFFF', padding: '12px 24px', borderRadius: '9999px', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(229, 9, 20, 0.4)' }}
            >
              Citizen SOS Portal
            </button>
            <button
              onClick={() => handleEnterPortal('ambulance_driver')}
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', padding: '12px 24px', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}
            >
              Ambulance Driver Cockpit
            </button>
            <button
              onClick={() => handleEnterPortal('dispatcher')}
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', padding: '12px 24px', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}
            >
              Command Center
            </button>
            <button
              onClick={() => handleEnterPortal('hospital_admin')}
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', padding: '12px 24px', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}
            >
              Hospital Medical Unit
            </button>
            <button
              onClick={() => handleEnterPortal('system_admin')}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px 24px', borderRadius: '9999px', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer' }}
            >
              Platform Administration
            </button>
          </div>
        </div>
      </section>

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
