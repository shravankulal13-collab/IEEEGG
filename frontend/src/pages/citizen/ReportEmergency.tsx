// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Citizen Emergency Reporting Interface (Stitch Reference 2)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import { X, MapPin, AlertCircle, Stethoscope, Car, Activity } from 'lucide-react';

export interface ReportEmergencyModalProps {
  onClose: () => void;
}

export const ReportEmergencyModal: React.FC<ReportEmergencyModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const geo = useGeolocation(true);
  const [selectedCategory, setSelectedCategory] = useState<'medical' | 'accident' | 'trauma' | 'other'>('medical');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Trigger API or store dispatch call
      const mockIncidentId = `ER-${Math.floor(1000 + Math.random() * 9000)}`;
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        navigate(`/citizen/confirm?incidentId=${mockIncidentId}&type=${selectedCategory}`);
      }, 600);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const categories = [
    {
      id: 'medical',
      title: 'Medical',
      subtitle: 'Illness, injury, breathing issues',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'accident',
      title: 'Accident',
      subtitle: 'Vehicle collision, structural',
      icon: <Car className="w-5 h-5 text-slate-700" />,
    },
    {
      id: 'trauma',
      title: 'Trauma',
      subtitle: 'Severe physical injury, bleeding',
      icon: <Activity className="w-5 h-5 text-slate-700" />,
    },
    {
      id: 'other',
      title: 'Other',
      subtitle: 'Unspecified immediate danger',
      icon: <AlertCircle className="w-5 h-5 text-slate-700" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Report Emergency</h2>
            <p className="text-xs text-slate-500">Initiate immediate assistance.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Emergency Type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">Emergency Type</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="mb-2">{cat.icon}</div>
                      <p className="text-xs font-bold text-slate-900">{cat.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{cat.subtitle}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
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
              <h3 className="text-sm font-bold text-slate-900">Location</h3>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="h-28 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                  alt="Location map"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
                </div>
              </div>
              <div className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="font-bold block">Current Location</span>
                    <span className="text-slate-500">{geo.address || '123 Emergency Ave, Unit 4B'}</span>
                  </div>
                </div>
                <button type="button" className="text-blue-600 font-semibold hover:underline">
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">Details <span className="text-slate-400 font-normal">(Optional)</span></h3>
            </div>

            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g., number of people, specific hazards..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
            >
              <span className="text-[10px] bg-red-700 px-1 rounded font-mono">SOS</span>
              {isSubmitting ? 'SENDING SOS...' : 'SEND SOS NOW'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ReportEmergency: React.FC = () => {
  const navigate = useNavigate();
  return <ReportEmergencyModal onClose={() => navigate('/citizen')} />;
};
