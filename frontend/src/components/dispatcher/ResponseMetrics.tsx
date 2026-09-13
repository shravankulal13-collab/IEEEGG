// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Operational Response Times & Intelligence Charts
// ============================================================

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { ResponseTimeMetrics } from '../../services/analytics.service';
import { Skeleton } from '../ui/Skeleton';

interface ResponseMetricsProps {
  responseTimes?: ResponseTimeMetrics | null;
  loading?: boolean;
}

export const ResponseMetrics: React.FC<ResponseMetricsProps> = ({
  loading = false,
}) => {
  // 24-hour operational overview timeline data
  const timelineData = [
    { time: '00:00', responses: 4 },
    { time: '04:00', responses: 2 },
    { time: '08:00', responses: 6 },
    { time: '12:00', responses: 4 },
    { time: '16:00', responses: 7 },
    { time: '20:00', responses: 3 },
  ];

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <Skeleton width="40%" height={20} />
        <Skeleton width="100%" height={160} />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all select-none ops-white-card-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight font-display">
              Response Metrics
            </h4>
            <p className="text-[11px] text-slate-500">
              24-hour operational overview
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium hover:text-slate-900 transition-colors"
        >
          <span>Last 24 Hours</span>
          <span className="text-[10px]">▾</span>
        </button>
      </div>

      {/* 24-hr Smooth Area Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={timelineData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 30]}
              ticks={[0, 10, 20, 30]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '0.75rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="responses"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#metricGrad)"
              dot={{ r: 3, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#1D4ED8', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats Summary */}
      <div className="grid grid-cols-3 gap-2 pt-3 mt-1 border-t border-slate-100 text-center">
        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Handled</p>
          <p className="text-xs font-bold text-slate-900 mt-0.5">18 Total</p>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Avg. Response</p>
          <p className="text-xs font-bold text-amber-600 mt-0.5">8.4 min</p>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase font-semibold text-slate-500">SLA Met</p>
          <p className="text-xs font-bold text-emerald-600 mt-0.5">96%</p>
        </div>
      </div>
    </div>
  );
};
