// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Security & Dispatch Forensic Audit Logs
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const navigate = useNavigate();

  const logs = [
    {
      id: 'LOG-9921',
      action: 'AMBULANCE_ASSIGNED',
      actor: 'AUTO_DISPATCH_ENGINE',
      incident: 'ER-2048',
      details: 'Assigned AMB-104 (ALS) based on 98.4% spatial proximity score',
      timestamp: '12:35:10 UTC',
    },
    {
      id: 'LOG-9920',
      action: 'INCIDENT_REPORTED',
      actor: 'CITIZEN_PORTAL (Pooja N)',
      incident: 'ER-2048',
      details: 'SOS signal submitted from lat: 12.9716, lon: 77.5946',
      timestamp: '12:35:08 UTC',
    },
    {
      id: 'LOG-9919',
      action: 'GREEN_CORRIDOR_PREEMPTION',
      actor: 'TRAFFIC_ROUTING_SERVICE',
      incident: 'ER-2048',
      details: 'Traffic signals 4A and 4B set to green hold for 45 seconds',
      timestamp: '12:35:14 UTC',
    },
    {
      id: 'LOG-9918',
      action: 'HOSPITAL_BED_RESERVED',
      actor: 'HOSPITAL_INTEGRATION_HUB',
      incident: 'ER-2048',
      details: 'Cath-Lab Bed #4 held at Metro Medical Center',
      timestamp: '12:35:22 UTC',
    },
  ];

  return (
    <AppShell sidebarVariant="top">
      <PageHeader
        title="Security & System Audit Forensics"
        subtitle="Cryptographically sealed timestamped event logs for regulatory and compliance oversight"

        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/dispatcher')}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Command Center
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Incident</th>
                <th className="py-3 px-4">Forensic Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">

                    <span>{log.id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{log.action}</td>
                  <td className="py-3.5 px-4 text-slate-700">{log.actor}</td>
                  <td className="py-3.5 px-4 font-bold text-red-600">{log.incident}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm leading-relaxed">{log.details}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};
