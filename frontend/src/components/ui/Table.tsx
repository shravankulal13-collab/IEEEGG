// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - Table
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-300 font-medium">
        <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs">Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-medium border border-dashed border-white/15 rounded-2xl bg-[#0B1B4F]/50">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[#1E3A8A] rounded-2xl shadow-xl bg-[#0B1B4F]">
      <table className="w-full text-left text-xs text-slate-200">
        <thead className="bg-slate-900/80 text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-white/10">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {data.map((row, rowIndex) => (
            <tr key={keyExtractor(row, rowIndex)} className="hover:bg-white/5 transition-colors">
              {columns.map((col, colIndex) => {
                let cellContent: React.ReactNode = null;
                if (typeof col.accessor === 'function') {
                  cellContent = col.accessor(row);
                } else if (col.accessor) {
                  cellContent = String(row[col.accessor] ?? '');
                }
                return (
                  <td key={colIndex} className={`px-4 py-3.5 ${col.className || ''}`}>
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
