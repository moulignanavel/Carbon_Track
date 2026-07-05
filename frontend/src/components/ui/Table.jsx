import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';
import { FileX2 } from 'lucide-react';

/**
 * Table — CarbonTrack Design System
 *
 * Features:
 *  - Sortable columns (click header)
 *  - Sticky header
 *  - Row hover highlight
 *  - Loading overlay
 *  - Empty state
 *  - Responsive horizontal scroll wrapper
 *  - Zebra stripes (optional)
 *  - Row click handler
 *
 * columns: Array<{
 *   key: string,
 *   header: string,
 *   sortable?: boolean,
 *   align?: 'left'|'center'|'right',
 *   width?: string,
 *   render?: (value, row) => ReactNode
 * }>
 */

function SortIcon({ direction }) {
  if (!direction)   return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />;
  if (direction === 'asc')  return <ChevronUp   className="h-3.5 w-3.5 text-green-600 dark:text-green-400" aria-hidden="true" />;
  return <ChevronDown className="h-3.5 w-3.5 text-green-600 dark:text-green-400" aria-hidden="true" />;
}

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No data yet',
  emptyDescription = 'Records will appear here once added.',
  onRowClick,
  zebra = false,
  stickyHeader = false,
  className = '',
}) {
  const [sort, setSort] = useState({ key: null, dir: null });

  const handleSort = (col) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc')   return { key: col.key, dir: 'desc' };
      return { key: null, dir: null };
    });
  };

  const sorted = [...data].sort((a, b) => {
    if (!sort.key) return 0;
    const av = a[sort.key], bv = b[sort.key];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="table-root" aria-busy={isLoading}>
          <thead className={`table-head ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`table-th ${alignClass[col.align ?? 'left']} ${col.sortable ? 'cursor-pointer select-none hover:text-green-600 dark:hover:text-green-400 transition-colors' : ''}`}
                  style={col.width ? { width: col.width } : {}}
                  onClick={() => handleSort(col)}
                  aria-sort={
                    sort.key === col.key
                      ? sort.dir === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <SortIcon direction={sort.key === col.key ? sort.dir : null} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <div className="flex justify-center">
                    <Spinner size="md" />
                  </div>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={FileX2}
                    title={emptyTitle}
                    description={emptyDescription}
                    size="sm"
                  />
                </td>
              </tr>
            ) : (
              sorted.map((row, rIdx) => (
                <tr
                  key={row.id ?? rIdx}
                  className={[
                    'table-row',
                    zebra && rIdx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/20' : '',
                    onRowClick ? 'cursor-pointer' : '',
                  ].join(' ')}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`table-td ${alignClass[col.align ?? 'left']}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
