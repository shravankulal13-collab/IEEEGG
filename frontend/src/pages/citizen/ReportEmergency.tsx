// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Emergency Reporting Interface (ResQGrid Core)
// ============================================================

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthStore } from '../../store/authStore';
import { useIncidentStore } from '../../store/incidentStore';
import {
  allocateOptimalEmergencyResources,
  type EmergencyCategory,
} from '../../services/hospitalAllocation.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, AlertCircle, Stethoscope, Car, Activity, Flame, Brain } from 'lucide-react';

export const ReportEmergency: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const geo = useGeolocation(true);
  const { user } = useAuthStore();
  const { createIncident } = useIncidentStore();

  const initialCat = (location.state as any)?.category || 'medical';
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>(
    ['cardiac', 'stroke', 'trauma', 'accident', 'respiratory', 'fire'].includes(initialCat)
      ? initialCat
      : 'cardiac'
  );
  const [reporterName, setReporterName] = useState(user?.fullName || '');
  const [reporterPhone, setReporterPhone] = useState('+91 98765 43210');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const lat = geo.latitude || 12.9716;
      const lng = geo.longitude || 77.5946;

      // 1. Run K* Multi-Criteria Algorithm to select optimal hospital and ambulance
      const allocation = await allocateOptimalEmergencyResources(
        { latitude: lat, longitude: lng },
        selectedCategory
      );

      const finalReporter = reporterName.trim() || user?.fullName || 'Citizen Reporter';

      const titles: Record<string, string> = {
        cardiac: 'Cardiac & Chest Pain Emergency',
        stroke: 'Stroke & Acute Neuro Emergency',
        trauma: 'Severe Trauma Injury Emergency',
        accident: 'Road Collision / Crash Emergency',
        respiratory: 'Severe Respiratory Distress Emergency',
        fire: 'Burns & Toxic Inhalation Emergency',
      };
      const title = titles[selectedCategory] || `Emergency Incident (${selectedCategory.toUpperCase()})`;

      // 2. Persist to Backend PostgreSQL Database
      const incident = await createIncident({
        emergencyType: selectedCategory as any,
        title: title,
        description: details.trim() || `Incident reported for ${title}. ${allocation.rationale}`,
        latitude: lat,
        longitude: lng,
        address: geo.address || 'Bengaluru Central Metro Area',
        reporter_name: finalReporter,
        reporter_phone: reporterPhone,
        assigned_hospital_id: allocation.hospital?.id,
        assigned_hospital_name: allocation.hospital?.name,
        assigned_ambulance_id: allocation.ambulance?.id,
        assigned_ambulance_number: allocation.ambulance?.ambulance_number,
        severity:
          selectedCategory === 'accident' ||
          selectedCategory === 'trauma' ||
          selectedCategory === 'cardiac'
            ? 'critical'
            : 'high',
      });

      // Synchronize active incident across localStorage and state stores
      localStorage.setItem('resqgrid_active_incident_id', incident.id);
      localStorage.setItem('resqgrid_active_incident_data', JSON.stringify(incident));
      localStorage.setItem('resqgrid_active_incident_timestamp', String(Date.now()));
      useIncidentStore.getState().setActiveIncident(incident);

      setIsSubmitting(false);
      navigate(`/citizen/confirm?incidentId=${incident.id}&type=${selectedCategory}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit emergency report. Please try again.');
    }
  };

  const categories = [
    {
      id: 'cardiac',
      title: 'Cardiac & Chest Pain',
      subtitle: 'Severe chest pressure, cardiac arrest',
      icon: <Stethoscope className="w-5 h-5 text-red-500" />,
    },
    {
      id: 'stroke',
      title: 'Stroke & Acute Neuro',
      subtitle: 'Facial drooping, acute numbness',
      icon: <Brain className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'accident',
      title: 'Road Collision / Crash',
      subtitle: 'Road crash, vehicular entrapment',
      icon: <Car className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'trauma',
      title: 'Severe Physical Injury',
      subtitle: 'Heavy bleeding, fall from height',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'respiratory',
      title: 'Severe Respiratory',
      subtitle: 'Acute choking, asthma failure',
      icon: <AlertCircle className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'fire',
      title: 'Burns & Toxic Inhalation',
      subtitle: 'Burn injury, chemical smoke',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
    },
  ];

  return (
    <AppShell sidebarVariant="top">
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        <PageHeader
          title="Report Emergency Incident"
          subtitle="Provide emergency details for instant ambulance dispatch, closest hospital matching, and route clearance."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/citizen')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back to Dashboard
            </Button>
          }
        />

        {errorMessage && (
          <div className="p-4 bg-red-950/80 border border-red-500 text-red-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl shadow-2xl text-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Emergency Type */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-white">Select Emergency Type</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-500 bg-red-600/25 ring-2 ring-red-500/50 text-white shadow-xl'
                          : 'border-white/15 hover:border-white/30 bg-slate-900/80 text-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {cat.icon}
                          <p className="text-xs font-extrabold text-white">{cat.title}</p>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight font-medium">{cat.subtitle}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-red-500 bg-red-600' : 'border-slate-500'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Location */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                  2
                </span>
                <h3 className="text-sm font-extrabold text-white">Pickup GPS Location</h3>
              </div>

              <div className="border border-white/15 rounded-2xl overflow-hidden bg-slate-900/90 shadow-md">
                <div className="p-4 flex items-center justify-between text-xs bg-slate-900/90 border-b border-white/10">
                  <div className="flex items-center gap-2.5 text-white">
                    <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-white block">Detected Incident Coordinates</span>
                      <span className="text-slate-200 font-medium">
                        {geo.address ||
                          (geo.latitude
                            ? `${geo.latitude.toFixed(4)}° N, ${geo.longitude?.toFixed(4)}° E`
                            : 'Current Pinpoint Location')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Reporter Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                  3
                </span>
                <h3 className="text-sm font-extrabold text-white">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Enter caller name"
                    className="w-full p-3 text-xs border border-white/20 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none bg-slate-900/90 text-white placeholder-slate-400 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">Contact Phone</label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 Phone number"
                    className="w-full p-3 text-xs border border-white/20 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none bg-slate-900/90 text-white placeholder-slate-400 font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                  4
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Additional Information <span className="text-slate-400 font-normal">(Optional)</span>
                </h3>
              </div>

              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g., number of injured persons, visible symptoms, landmark near location..."
                className="w-full p-3.5 text-xs border border-white/20 rounded-2xl focus:ring-2 focus:ring-sky-400 focus:outline-none bg-slate-900/90 text-white placeholder-slate-400 font-medium"
              />
            </div>

            {/* Submit SOS Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/citizen')}
                className="w-full sm:w-auto border-white/20 text-slate-200 hover:bg-white/10"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-[#B80710] hover:from-red-500 hover:to-red-600 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-red-600/40 transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'DISPATCHING AMBULANCE...' : 'DISPATCH EMERGENCY AMBULANCE NOW'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default ReportEmergency;
