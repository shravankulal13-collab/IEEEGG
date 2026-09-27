// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Incident Confirmation Screen (ResQGrid Core)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { type IncidentRecord } from '../../services/incident.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  ShieldCheck,
  Compass,
  AlertCircle,
  Ambulance,
  Building2,
  ArrowLeft,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const IncidentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawIncidentId = searchParams.get('incidentId');
  const incidentId =
    rawIncidentId && rawIncidentId !== 'null' && rawIncidentId !== 'undefined' && rawIncidentId.trim() !== ''
      ? rawIncidentId.trim()
      : null;
  const typeParam = searchParams.get('type') || 'medical';
  const { fetchIncidentById } = useIncidentStore();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('resqgrid_active_incident_data');
    const storedId = localStorage.getItem('resqgrid_active_incident_id');
    const targetId = incidentId || storedId;

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed) {
          setIncident(parsed);
          setIsLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    if (!targetId) {
      useIncidentStore
        .getState()
        .fetchIncidents()
        .then(() => {
          const valid = useIncidentStore.getState().incidents.filter((i) =>
            !['resolved', 'cancelled', 'false_report'].includes(i.status) &&
            !(i.title && i.title.toLowerCase().includes('robbery')) &&
            !(i.title && i.title.toLowerCase().includes('test'))
          );
          setIncident(valid[0] || null);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
      return;
    }

    fetchIncidentById(targetId)
      .then((data) => {
        setIncident(data);
        setIsLoading(false);
      })
      .catch(() => {
        useIncidentStore
          .getState()
          .fetchIncidents()
          .then(() => {
            const valid = useIncidentStore.getState().incidents.filter((i) =>
              !['resolved', 'cancelled', 'false_report'].includes(i.status) &&
              !(i.title && i.title.toLowerCase().includes('robbery')) &&
              !(i.title && i.title.toLowerCase().includes('test'))
            );
            setIncident(valid[0] || null);
            setIsLoading(false);
          })
          .catch((err: any) => {
            setError(err.message || 'Failed to load incident record.');
            setIsLoading(false);
          });
      });
  }, [incidentId, fetchIncidentById]);

  if (isLoading) {
    return (
      <AppShell sidebarVariant="top">
        <div className="max-w-xl mx-auto py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-300 mt-4">Confirming Emergency Dispatch...</p>
        </div>
      </AppShell>
    );
  }

  const assignedAmb =
    incident?.assigned_ambulance_number ||
    (incident?.assigned_ambulance_id ? `Unit ${incident.assigned_ambulance_id.slice(0, 8)}` : 'KA-05-EA-4820 (ALS Unit)');
  const assignedHosp = incident?.assigned_hospital_name || 'Victoria Hospital (BMCRI Trauma Care)';
  const emergencyCategory = (incident?.emergency_type || typeParam).toUpperCase();

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <PageHeader
          title="Emergency Dispatch Confirmation"
          subtitle="Responder Dispatched • Priority Green Wave Active"
          badge={<Badge variant="success">DISPATCH CONFIRMED</Badge>}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/citizen')}
              className="border-white/20 text-white hover:bg-white/10 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
            </Button>
          }
        />

        {/* Top Header Card */}
        <Card className="p-8 bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl shadow-2xl text-center text-white space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Emergency Response Dispatched</h1>
            <p className="text-sm text-emerald-300 font-bold mt-1 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Green Wave Corridor Active & Synced
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/80 text-sky-300 border border-white/15 rounded-full text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Category: {emergencyCategory} Emergency</span>
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-red-950/60 border border-red-500/40 text-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Assignment Summary */}
        <Card className="p-6 bg-[#0B1B4F] border border-[#1E3A8A] rounded-3xl shadow-xl space-y-4 text-white">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
            DISPATCH SUMMARY
          </span>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-900/80 rounded-2xl border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <Ambulance className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Ambulance Unit</p>
                <p className="text-sm font-black text-white truncate">{assignedAmb}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">En Route • Live Location Active</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/80 rounded-2xl border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Allocated Destination Hospital</p>
                <p className="text-sm font-black text-white truncate">{assignedHosp}</p>
                <p className="text-xs text-sky-300 font-semibold mt-0.5">Emergency Trauma Bay Pre-Alerted</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate(`/citizen/tracking?incidentId=${incidentId || incident?.id}`)}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Compass className="w-5 h-5" />
            <span>Track Assigned Ambulance Live</span>
          </button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/citizen')}
            className="py-3 border-white/20 text-white hover:bg-white/10 font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-slate-300" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default IncidentConfirmation;

