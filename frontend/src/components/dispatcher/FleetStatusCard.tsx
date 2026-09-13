// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Ambulance Fleet Status Donut & Breakdown Card
// ============================================================

import React from 'react';
import { Truck } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { AmbulanceData } from '../../services/ambulance.service';

interface FleetStatusCardProps {
  fleet: AmbulanceData[];
}

export const FleetStatusCard: React.FC<FleetStatusCardProps> = ({ fleet }) => {
  const availableCount = fleet.filter((a) => a.status === 'available' || a.status === 'idle').length;
  const enRouteCount = fleet.filter((a) => a.status === 'dispatched' || a.status === 'en_route').length;
  const onSceneCount = fleet.filter((a) => a.status === 'arrived' || a.status === 'on_scene').length;
  const transportingCount = fleet.filter((a) => a.status === 'transporting' || a.status === 'busy').length;
  const maintenanceCount = fleet.filter((a) => a.status === 'offline' || a.status === 'maintenance').length;
  const total = fleet.length;

  const donutData = total > 0 ? [
    { name: 'Available', value: availableCount, color: '#10B981' },
    { name: 'En Route', value: enRouteCount, color: '#2563EB' },
    { name: 'On Scene', value: onSceneCount, color: '#F59E0B' },
    { name: 'Transporting', value: transportingCount, color: '#06B6D4' },
    { name: 'Maintenance', value: maintenanceCount, color: '#64748B' },
  ].filter((d) => d.value > 0) : [
    { name: 'Empty', value: 1, color: '#1E293B' },
  ];

  const breakdown = [
    { label: 'Available', count: availableCount, color: '#10B981' },
    { label: 'En Route', count: enRouteCount, color: '#2563EB' },
    { label: 'On Scene', count: onSceneCount, color: '#F59E0B' },
    { label: 'Transporting', count: transportingCount, color: '#06B6D4' },
    { label: 'Maintenance', count: maintenanceCount, color: '#64748B' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all select-none ops-white-card-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight font-display">
              Fleet Status
            </h4>
            <p className="text-[11px] text-slate-500">
              Ambulance availability
            </p>
          </div>
        </div>

        <a
          href="/dispatcher/fleet"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View Fleet →
        </a>
      </div>

      {/* Donut Chart + Vertical Legend */}
      <div className="flex items-center justify-between h-36">
        {/* Left: Donut with Total in Center */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius={38}
                outerRadius={52}
                paddingAngle={total > 0 ? 3 : 0}
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`donut-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900 leading-none font-display">
              {total}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-tight">
              Total
            </span>
          </div>
        </div>

        {/* Right: Legend Breakdown */}
        <div className="flex-1 pl-4 space-y-1.5">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 font-medium text-xs">
                  {item.label}
                </span>
              </div>
              <span className="font-bold text-slate-900 font-mono text-xs">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom telemetry metrics */}
      <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-slate-100 text-center">
        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Fleet Ready</p>
          <p className="text-xs font-bold text-emerald-600 mt-0.5">
            {total > 0 ? Math.round((availableCount / total) * 100) : 100}%
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Maintenance</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">{maintenanceCount} Units</p>
        </div>
      </div>
    </div>
  );
};
