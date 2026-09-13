// ============================================================
// PRIMARY OWNER: SK / khushi.shettyyy
// ROLE: Core Platform + Dispatcher Command UI
// MODULE: UI Component - Data Table
// ============================================================

import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found',
  onRowClick,
  className = '',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="ops-shimmer h-12 w-full rounded-lg bg-blue-950/40 border border-blue-900/20" />
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-blue-900/30 bg-[#07133A]/90 backdrop-blur-sm ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-blue-900/40 bg-[#050B24]/90 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-900/20">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-xs text-slate-400 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-blue-900/20 active:bg-blue-900/40'
                    : 'hover:bg-blue-900/10'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3 px-4 text-slate-200 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(item, rowIdx)
                      : col.accessor
                      ? String(item[col.accessor] ?? '—')
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
