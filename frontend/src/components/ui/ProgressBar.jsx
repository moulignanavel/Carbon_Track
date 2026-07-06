import React from 'react';

/**
 * ProgressBar — CarbonTrack Design System
 * ─────────────────────────────────────────────────────────────
 * Props:
 *   value: number
 *   max: number
 *   size?: 'sm' | 'md' | 'lg'
 *   color?: 'green' | 'yellow' | 'red' | 'slate'
 *   variant?: 'solid' | 'gradient'
 *   showValue?: boolean
 *   label?: string
 *   className?: string
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  color = 'green',
  variant = 'solid',
  showValue = false,
  label,
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size] || 'h-2.5';

  const colorClass = {
    green: variant === 'gradient'
      ? 'bg-gradient-to-r from-green-500 to-emerald-400 dark:from-green-600 dark:to-emerald-500'
      : 'bg-green-600 dark:bg-green-500',
    yellow: variant === 'gradient'
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-amber-600 dark:to-yellow-500'
      : 'bg-amber-500 dark:bg-amber-400',
    red: variant === 'gradient'
      ? 'bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-700 dark:to-rose-600'
      : 'bg-red-600 dark:bg-red-500',
  }[color] || (
    variant === 'gradient'
      ? 'bg-gradient-to-r from-slate-500 to-slate-400 dark:from-slate-600 dark:to-slate-500'
      : 'bg-slate-600 dark:bg-slate-500'
  );

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-4 mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          {label && <span className="truncate">{label}</span>}
          {showValue && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
