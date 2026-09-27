// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Historical Emergency Admissions Archive
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Activity, RefreshCw } from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();

  const history = [
    {
      id: 'ADM-9104',
      incidentId: 'ER-2047',
      patient: 'Siddharth M.',
      condition: 'Acute Severe Asthma & Respiratory Failure',
      admittedAt: '29 Aug 2026, 14:15',
      ward: 'ICU Bed #2',
      attendingDoctor: 'Dr. Vikram Sethi',
      outcome: 'STABILIZED_DISCHARGED',
    },
    {
      id: 'ADM-9088',
      incidentId: 'ER-2035',
      patient: 'Kavita R.',
      condition: 'Multiple Injuries & Rib Fractures',
      admittedAt: '15 Aug 2026, 09:40',
      ward: 'Emergency Ward Bed #12',
      attendingDoctor: 'Dr. Ananya Iyer',
      outcome: 'RECOVERED',
    },
  ];

  return (
    <AppShell sidebarVariant='top'>
      <PageHeader
        title="Hospital Emergency Admission Records"
        subtitle="Completed emergency triage admissions, treatment courses, and discharge outcomes"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/hospital')} className="border-white/20 text-slate-200 hover:bg-white/10">
            Hospital Intake
          </Button>
        }
      />

      <div className="bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] p-6 shadow-xl text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Admission ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Diagnosis & Condition</th>
                <th className="py-3 px-4">Admitted Ward</th>
                <th className="py-3 px-4">Attending Specialist</th>
                <th className="py-3 px-4">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-medium">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-300 flex items-center gap-1.5">
                    <span>{item.id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{item.patient}</td>
                  <td className="py-3.5 px-4 text-slate-300">{item.condition}</td>
                  <td className="py-3.5 px-4 font-bold text-sky-400">{item.ward}</td>
                  <td className="py-3.5 px-4 text-slate-300">{item.attendingDoctor}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.outcome.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};
