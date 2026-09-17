// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Central Ambulance Fleet Telemetry Management
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { ambulanceService, type AmbulanceData } from '../../services/ambulance.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Ambulance, Radio, RefreshCw, Search } from 'lucide-react';

export const AmbulanceFleet: React.FC = () => {
  const [fleet, setFleet] = useState<AmbulanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadFleet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ambulanceService.getAllAmbulances();
      setFleet(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load ambulance fleet from database');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFleet();
    const interval = setInterval(loadFleet, 10000);
    return () => clearInterval(interval);
  }, [loadFleet]);

  const availableCount = fleet.filter((a) => a.status.toLowerCase() === 'available').length;
  const inMissionCount = fleet.filter((a) => a.status.toLowerCase() !== 'available' && a.status.toLowerCase() !== 'maintenance').length;

  const filteredFleet = fleet.filter(
    (item) =>
      item.ambulance_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.driver_name && item.driver_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ambulance_type && item.ambulance_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppShell>
      <PageHeader
        pillTag="PostGIS Vehicle Coordinates & Onboard Vitals"
        title="Ambulance Fleet Telemetry & GPS"
        subtitle="Real-time PostGIS vehicle coordinates, onboard vitals, and mission state"
        badge={
          error ? (
            <Badge variant="danger">Database Offline</Badge>
          ) : (
            <Badge variant="info">{fleet.length} Units Monitored</Badge>
          )
        }
        actions={
          <Button variant="outline" size="sm" onClick={loadFleet}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <span className="text-xs font-bold text-slate-500 block uppercase">Fleet Available</span>
          <span className="text-2xl font-black text-emerald-600">{availableCount} Units</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 block uppercase">In Active Mission</span>
          <span className="text-2xl font-black text-red-600">{inMissionCount} Units</span>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 block uppercase">Total Monitored Fleet</span>
          <span className="text-2xl font-black text-blue-600">{fleet.length} Units</span>
        </Card>
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-500 mt-3">Loading vehicle coordinates from PostgreSQL database...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-6">
          <ErrorState message={`Database Error: ${error}`} onRetry={loadFleet} />
        </div>
      )}

      {!isLoading && !error && fleet.length === 0 && (
        <EmptyState
          title="No Ambulances Registered"
          description="The database is connected but no ambulance units exist in the 'ambulances' table."
          action={{
            label: 'Refresh Fleet Data',
            onClick: loadFleet,
          }}
        />
      )}

      {!isLoading && !error && fleet.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vehicle ID, driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vehicle Unit</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Coordinates / Location</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4">Mission Incident</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFleet.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Ambulance className="w-4 h-4 text-blue-600" />
                      <span>{v.ambulance_number}</span>
                    </td>
                    <td className="py-3.5 px-4">{v.ambulance_type || 'ALS'}</td>
                    <td className="py-3.5 px-4 font-bold">{v.driver_name || 'Paramedic Unit'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status.toLowerCase() === 'available'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {v.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {v.current_latitude && v.current_longitude
                        ? `${v.current_latitude.toFixed(4)}°, ${v.current_longitude.toFixed(4)}°`
                        : 'GPS Standby'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{v.current_speed_kmh ?? 0} km/h</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600 flex items-center gap-1">
                      {v.current_incident_id ? (
                        <>
                          <Radio className="w-3 h-3 animate-pulse text-red-500" />
                          <span>{v.current_incident_id}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal">None (Standby)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
};
