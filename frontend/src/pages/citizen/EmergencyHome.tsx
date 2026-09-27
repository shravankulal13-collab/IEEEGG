// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Emergency Home Screen (ResQGrid Core)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthStore } from '../../store/authStore';
import { useIncidentStore } from '../../store/incidentStore';
import {
  allocateOptimalEmergencyResources,
  type EmergencyCategory,
} from '../../services/hospitalAllocation.service';
import { AppShell } from '../../components/layout/AppShell';
import { HeroSection } from '../../components/layout/HeroSection';
import {
  MapPin,
  HeartPulse,
  Activity,
  Flame,
  Car,
  AlertCircle,
  History,
  Radio,
  ArrowRight,
  Brain,
  Stethoscope,
} from 'lucide-react';

export const EmergencyHome: React.FC = () => {
  const navigate = useNavigate();
  const geo = useGeolocation(true);
  const { user } = useAuthStore();
  const { createIncident } = useIncidentStore();
  const [isTriggeringSos, setIsTriggeringSos] = useState(false);

  const emergencyCategories: {
    id: EmergencyCategory;
    label: string;
    icon: React.ReactNode;
    desc: string;
    severity: 'critical' | 'high';
  }[] = [
    {
      id: 'cardiac',
      label: 'Cardiac & Chest Pain',
      icon: <HeartPulse className="w-5 h-5 text-red-500" />,
      desc: 'Severe chest pressure, cardiac arrest, arrhythmia',
      severity: 'critical',
    },
    {
      id: 'stroke',
      label: 'Stroke & Acute Neuro',
      icon: <Brain className="w-5 h-5 text-indigo-400" />,
      desc: 'Facial drooping, speech loss, sudden paralysis',
      severity: 'critical',
    },
    {
      id: 'trauma',
      label: 'Severe Trauma Injury',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      desc: 'Uncontrolled hemorrhage, compound fractures, falls',
      severity: 'high',
    },
    {
      id: 'accident',
      label: 'Road Collision / Crash',
      icon: <Car className="w-5 h-5 text-purple-400" />,
      desc: 'High-speed vehicular crash, multi-victim entrapment',
      severity: 'critical',
    },
    {
      id: 'respiratory',
      label: 'Severe Respiratory Distress',
      icon: <AlertCircle className="w-5 h-5 text-sky-400" />,
      desc: 'Acute choking, severe hypoxia, asthma failure',
      severity: 'high',
    },
    {
      id: 'fire',
      label: 'Burns & Toxic Inhalation',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      desc: 'Severe burn trauma, smoke and chemical inhalation',
      severity: 'critical',
    },
  ];

  const handleInstantSos = async (categoryId?: EmergencyCategory) => {
    setIsTriggeringSos(true);
    try {
      const lat = geo.latitude || 12.9716;
      const lng = geo.longitude || 77.5946;
      const category = categoryId || 'medical';

      // 1. Run K* Multi-Criteria Algorithm to select optimal hospital and ambulance
      const allocation = await allocateOptimalEmergencyResources(
        { latitude: lat, longitude: lng },
        category
      );

      // 2. Persist Real Incident to Backend Database
      const categoryTitles: Record<string, string> = {
        cardiac: 'Cardiac & Chest Pain Emergency',
        stroke: 'Stroke & Acute Neuro Emergency',
        trauma: 'Severe Trauma Injury Emergency',
        accident: 'Road Collision / Crash Emergency',
        respiratory: 'Severe Respiratory Distress Emergency',
        fire: 'Burns & Toxic Inhalation Emergency',
        medical: 'Emergency SOS: Critical Medical Assistance',
      };
      const title = categoryTitles[category] || `Emergency SOS: ${category.toUpperCase()} Medical Response`;
      const reporterName = user?.fullName || 'Citizen Emergency Caller';
      const reporterPhone = '+91 98765 43210';

      const incident = await createIncident({
        emergencyType: category as any,
        title: title,
        description: `Rapid 1-Tap dispatch initiated for ${title}. ${allocation.rationale}`,
        latitude: lat,
        longitude: lng,
        address: geo.address || 'Bengaluru Metro Area (GPS Pinpoint)',
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        assigned_hospital_id: allocation.hospital?.id,
        assigned_hospital_name: allocation.hospital?.name,
        assigned_ambulance_id: allocation.ambulance?.id,
        assigned_ambulance_number: allocation.ambulance?.ambulance_number,
        severity: 'critical',
      });

      // Synchronize active incident across localStorage and state stores
      localStorage.setItem('resqgrid_active_incident_id', incident.id);
      localStorage.setItem('resqgrid_active_incident_data', JSON.stringify(incident));
      localStorage.setItem('resqgrid_active_incident_timestamp', String(Date.now()));
      useIncidentStore.getState().setActiveIncident(incident);

      setIsTriggeringSos(false);
      navigate(`/citizen/confirm?incidentId=${incident.id}&type=${category}`);
    } catch {
      setIsTriggeringSos(false);
      // Fallback navigate to report form if immediate dispatch creation encountered error
      navigate('/citizen/report', { state: { category: categoryId || 'medical' } });
    }
  };

  return (
    <AppShell sidebarVariant="top">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Animated Royal Blue Flagship Hero Section */}
        <HeroSection
          headingPrefix="Instant Medical &"
          typewriterPhrases={[
            'Emergency Ambulance Dispatch',
            'Live GPS Paramedic Tracking',
            'Hospital Bed Pre-Alerts',
            'Critical Emergency Care',
          ]}
          headingSuffix="with ResQGrid"
          subtitle="Get immediate paramedical assistance with one tap. Nearest ambulance is dispatched immediately with live route tracking."
          primaryCta={{
            label: isTriggeringSos ? 'Dispatching Nearest Unit...' : 'Launch Instant 1-Tap SOS',
            onClick: () => handleInstantSos('cardiac'),
            variant: 'red',
          }}
          secondaryCta={{
            label: 'Track Active Ambulance',
            onClick: () => navigate('/citizen/tracking'),
          }}
        />

        {/* Central 1-Tap SOS Circle Trigger */}
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <button
            onClick={() => handleInstantSos()}
            disabled={isTriggeringSos}
            style={{
              width: '210px',
              height: '210px',
              borderRadius: '50%',
              backgroundColor: '#E50914',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '6px solid rgba(255, 255, 255, 0.9)',
              cursor: isTriggeringSos ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="btn-pulse-glow hover:scale-105 active:scale-95 group shadow-2xl disabled:opacity-75 cursor-pointer"
          >
            <Radio className="w-10 h-10 mb-2 animate-bounce" />
            <span className="text-xl font-black tracking-wider leading-tight">
              {isTriggeringSos ? 'DISPATCHING...' : 'SEND\nEMERGENCY\nSOS'}
            </span>
          </button>
          <p className="text-xs text-slate-200 mt-4 font-bold">
            {user ? `Reporting as ${user.fullName}` : 'Tap to dispatch closest Advanced Life Support ambulance immediately'}
          </p>
        </div>

        {/* Categorized Rapid Incident Trigger Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-white">Select Emergency Type</h2>
              <p className="text-xs text-slate-300">Tap below to trigger instant response tailored to medical urgency</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                ⚡ Auto-Allocates Nearest Hospital
              </span>
              <button
                onClick={() => navigate('/citizen/report')}
                className="text-xs font-bold text-sky-300 hover:text-white underline cursor-pointer"
              >
                Detailed Report Form &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleInstantSos(cat.id)}
                className="p-5 bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] shadow-xl hover:border-red-500 hover:shadow-2xl transition-all cursor-pointer group hover-lift flex flex-col justify-between text-white"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 shrink-0">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-red-400 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">{cat.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs font-bold text-slate-300 group-hover:text-red-400">
                  <span>⚡ Instant 1-Tap SOS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Citizen Navigation Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/citizen/history')}
            className="cursor-pointer hover-lift flex items-center gap-3.5 p-4 bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] text-white shadow-xl"
          >
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 text-sky-400 rounded-xl shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Emergency History</p>
              <p className="text-xs text-slate-300 font-medium">View past ambulance dispatches and recorded logs</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/citizen/tracking')}
            className="cursor-pointer hover-lift flex items-center gap-3.5 p-4 bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] text-white shadow-xl"
          >
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Live Ambulance Tracking</p>
              <p className="text-xs text-slate-300 font-medium">Track dispatched ambulance and arrival time</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EmergencyHome;
