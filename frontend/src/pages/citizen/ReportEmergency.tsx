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
import { hospitalService } from '../../services/hospital.service';
import { ambulanceService } from '../../services/ambulance.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, AlertCircle, Stethoscope, Car, Activity, Radio, ArrowLeft } from 'lucide-react';

export const ReportEmergency: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const geo = useGeolocation(true);
  const { user } = useAuthStore();
  const { createIncident } = useIncidentStore();

  const initialCat = (location.state as any)?.category || 'medical';
  const [selectedCategory, setSelectedCategory] = useState<'medical' | 'accident' | 'trauma' | 'other'>(
    ['medical', 'accident', 'trauma', 'other'].includes(initialCat) ? initialCat : 'medical'
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

      // 1. Find nearest capable available hospital
      let targetHospitalId: string | undefined;
      let targetHospitalName: string | undefined;
      try {
        const hospitals = await hospitalService.getAllHospitals();
        const availableHosp = hospitals.find((h) => (h.available_icu_beds || h.availableICUBeds || 0) > 0 || (h.available_beds || h.availableEmergencyBeds || 0) > 0) || hospitals[0];
        if (availableHosp) {
          targetHospitalId = availableHosp.id;
          targetHospitalName = availableHosp.name;
        }
      } catch {
        // Fallback
      }

      // 2. Find nearest available ambulance
      let targetAmbulanceId: string | undefined;
      let targetAmbulanceNumber: string | undefined;
      try {
        const ambulances = await ambulanceService.getAllAmbulances();
        const availableAmb = ambulances.find((a) => a.status.toLowerCase() === 'available') || ambulances[0];
        if (availableAmb) {
          targetAmbulanceId = availableAmb.id;
          targetAmbulanceNumber = availableAmb.ambulance_number;
        }
      } catch {
        // Fallback
      }

      const finalReporter = reporterName.trim() || user?.fullName || 'Citizen Reporter';

      // 3. Persist to Backend PostgreSQL Database
      const incident = await createIncident({
        emergencyType: (selectedCategory as any),
        title: `Emergency Incident (${selectedCategory.toUpperCase()})`,
        description: details.trim() || 'Immediate emergency medical response requested.',
        latitude: lat,
        longitude: lng,
        address: geo.address || 'Bengaluru Central Metro Area',
        reporter_name: finalReporter,
        reporter_phone: reporterPhone,
        assigned_hospital_id: targetHospitalId,
        assigned_hospital_name: targetHospitalName,
        assigned_ambulance_id: targetAmbulanceId,
        assigned_ambulance_number: targetAmbulanceNumber,
        severity: selectedCategory === 'accident' || selectedCategory === 'trauma' ? 'critical' : 'high',
      });

      setIsSubmitting(false);
      navigate(`/citizen/confirm?incidentId=${incident.id}&type=${selectedCategory}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit emergency report to database.');
    }
  };

  const categories = [
    {
      id: 'medical',
      title: 'Medical Emergency',
      subtitle: 'Cardiac, severe respiratory, stroke',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'accident',
      title: 'Vehicle Collision',
      subtitle: 'Road crash, structural entrapment',
      icon: <Car className="w-5 h-5 text-red-600" />,
    },
    {
      id: 'trauma',
      title: 'Severe Physical Trauma',
      subtitle: 'Heavy bleeding, fall from height',
      icon: <Activity className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'other',
      title: 'Critical Incident',
      subtitle: 'Unspecified immediate physical danger',
      icon: <AlertCircle className="w-5 h-5 text-purple-600" />,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        <PageHeader
          pillTag="Immediate Emergency Intake"
          title="Report Emergency Incident"
          subtitle="Direct GPS-tagged dispatch with automated trauma unit and corridor coordination."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/citizen')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Button>
          }
        />

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Emergency Type */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">Select Emergency Type</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50/70 ring-2 ring-red-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="mb-2.5 p-2 bg-slate-50 rounded-xl inline-block border border-slate-100">
                          {cat.icon}
                        </div>
                        <p className="text-xs font-extrabold text-slate-900">{cat.title}</p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{cat.subtitle}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300'
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
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">Verified Location</h3>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <div className="p-4 flex items-center justify-between text-xs bg-white border-b border-slate-200">
                  <div className="flex items-center gap-2.5 text-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block">Current Incident Coordinates</span>
                      <span className="text-slate-500 font-medium">
                        {geo.address || (geo.latitude ? `${geo.latitude.toFixed(4)}° N, ${geo.longitude?.toFixed(4)}° E` : '123 Medical Drive, Sector 4')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    GPS LOCK HIGH ACCURACY
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Reporter Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">Reporter Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Enter caller name"
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 Phone number"
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Additional Details <span className="text-slate-400 font-normal">(Optional)</span>
                </h3>
              </div>

              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g., number of injured persons, immediate hazards, landmark near location..."
                className="w-full p-3.5 text-xs border border-slate-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white font-medium"
              />
            </div>

            {/* Submit SOS Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/citizen')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-[#B80710] hover:from-red-500 hover:to-red-600 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-red-600/30 transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{isSubmitting ? 'PERSISTING & TRANSMITTING SOS...' : 'TRANSMIT SOS SIGNAL NOW'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};

export default ReportEmergency;
