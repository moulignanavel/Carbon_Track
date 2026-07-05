/**
 * TableSkeleton — shimmer placeholder for data tables
 */
export default function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800" aria-busy="true" aria-label="Loading table data">
      {/* Header */}
      <div className="grid gap-4 bg-slate-50 dark:bg-slate-800/50 px-5 py-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 border-t border-slate-100 dark:border-slate-800 px-5 py-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton h-4" style={{ width: `${60 + ((c * 23) % 40)}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
