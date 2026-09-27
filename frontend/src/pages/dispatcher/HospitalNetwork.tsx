// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Pan-India Hospital Medical Network Directory
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalStore } from '../../store/hospitalStore';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, Activity, RefreshCw, Search, Phone, MapPin, Radio } from 'lucide-react';

export const HospitalNetwork: React.FC = () => {
  const navigate = useNavigate();
  const { hospitals, isLoading, error, fetchHospitals, setSelectedHospital } = useHospitalStore();
  const [selectedCity, setSelectedCity] = useState<string>('All India');
  const [searchQuery, setSearchQuery] = useState('');

  const cityList = ['All India', 'Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const filteredHospitals = hospitals.filter((hosp) => {
    const matchesCity =
      selectedCity === 'All India' ||
      hosp.city === selectedCity ||
      (!hosp.city && selectedCity === 'Bengaluru');
    const matchesSearch =
      searchQuery.trim() === '' ||
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hosp.address && hosp.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (hosp.city && hosp.city.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matchesSearch;
  });

  const totalIcuBeds = filteredHospitals.reduce((sum, h) => sum + (h.available_icu_beds ?? h.availableICUBeds ?? 0), 0);
  const totalEmergencyBeds = filteredHospitals.reduce((sum, h) => sum + (h.available_beds ?? h.availableEmergencyBeds ?? 0), 0);
  const totalVentilators = filteredHospitals.reduce((sum, h) => sum + (h.available_ventilators ?? 0), 0);

  const handleOpenHospital = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
    navigate('/hospital');
  };

  return (
    <AppShell sidebarVariant="top">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <PageHeader
          pillTag="Pan-India Trauma Care & ICU Grid"
          title="National Medical & Trauma Center Network"
          subtitle="Real-time multi-city ICU bed allocations, emergency resuscitation bays, and on-call specialist rosters."
          actions={
            <Button variant="outline" size="sm" onClick={() => fetchHospitals()}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh Network
            </Button>
          }
        />

        {/* City Filter Tabs */}
        <div className="bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl p-2.5 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {cityList.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCity === city
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {city === 'All India' ? <Radio className="w-3.5 h-3.5 text-white animate-pulse" /> : null}
              <span>{city}</span>
              {city !== 'All India' && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${selectedCity === city ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-300'}`}>
                  {hospitals.filter((h) => h.city === city || (!h.city && city === 'Bengaluru')).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 3 Capacity KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
            <span className="text-xs font-bold text-slate-300 block uppercase">AVAILABLE ICU BEDS ({selectedCity})</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{totalIcuBeds} Free</span>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Direct emergency intake ready</p>
          </Card>
          <Card className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
            <span className="text-xs font-bold text-slate-300 block uppercase">EMERGENCY BAYS FREE</span>
            <span className="text-2xl font-black text-sky-400 mt-1 block">{totalEmergencyBeds} Ready</span>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Immediate resuscitation capacity</p>
          </Card>
          <Card className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
            <span className="text-xs font-bold text-slate-300 block uppercase">VENTILATORS READY</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">{totalVentilators} Units</span>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Calibrated critical life support</p>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name, area, or city..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#0B1B4F] border border-[#1E3A8A] rounded-xl text-xs font-medium text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm transition"
          />
        </div>

        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="text-xs font-bold text-slate-300 mt-3">Loading national trauma network capacity...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="my-6">
            <ErrorState message={error} onRetry={() => fetchHospitals()} />
          </div>
        )}

        {!isLoading && !error && filteredHospitals.length === 0 && (
          <EmptyState
            title="No Hospitals Found"
            description="No medical centers match your selected city or search filters."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSelectedCity('All India');
                setSearchQuery('');
              },
            }}
          />
        )}

        {!isLoading && !error && filteredHospitals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hosp) => (
              <div key={hosp.id} className="bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] p-5 shadow-xl hover-lift flex flex-col justify-between text-white">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-white leading-snug truncate">{hosp.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-sky-400">{hosp.trauma_level?.replace('_', ' ') || 'Level 1 Trauma'}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[10px] font-semibold text-slate-300">{hosp.city || 'Bengaluru'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20 shrink-0">
                      {hosp.operational_status || 'OPEN'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 line-clamp-2">{hosp.address || 'Medical City Center'}</p>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs py-2.5 bg-slate-900/60 rounded-xl border border-white/10 mb-3">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">ICU BEDS</span>
                      <span className="font-black text-emerald-400 text-xs">{hosp.available_icu_beds ?? hosp.availableICUBeds ?? 0} Free</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">EMERGENCY</span>
                      <span className="font-black text-sky-400 text-xs">{hosp.available_beds ?? hosp.availableEmergencyBeds ?? 0} Ready</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">VENTILATORS</span>
                      <span className="font-black text-purple-400 text-xs">{hosp.available_ventilators ?? 0} Units</span>
                    </div>
                  </div>

                  {hosp.phone && (
                    <div className="text-[11px] text-slate-300 mb-3 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{hosp.emergency_phone || hosp.phone}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleOpenHospital(hosp.id)}
                  className="mt-2 text-xs border-white/20 text-white hover:bg-white/10"
                >
                  <Activity className="w-3.5 h-3.5 mr-1 text-sky-400" />
                  Manage Bed Allocation
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default HospitalNetwork;
