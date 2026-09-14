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
      <div className="p-8 text-center text-slate-500 font-medium">
        <div className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs">Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-medium border border-dashed border-slate-200 rounded-xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-200 rounded-xl shadow-sm bg-white">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-slate-900 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-4 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={keyExtractor(row, rowIndex)} className="hover:bg-slate-50/80 transition-colors">
              {columns.map((col, colIndex) => {
                let cellContent: React.ReactNode = null;
                if (typeof col.accessor === 'function') {
                  cellContent = col.accessor(row);
                } else if (col.accessor) {
                  cellContent = String(row[col.accessor] ?? '');
                }
                return (
                  <td key={colIndex} className={`px-4 py-3 ${col.className || ''}`}>
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
