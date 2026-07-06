import React from 'react';

/**
 * CircularProgress — CarbonTrack Design System
 * ─────────────────────────────────────────────────────────────
 * Props:
 *   value: number
 *   size?: number
 *   strokeWidth?: number
 *   color?: 'green' | 'yellow' | 'red' | 'slate'
 *   children?: React.ReactNode
 */
export default function CircularProgress({
  value = 0,
  size = 72,
  strokeWidth = 6,
  color = 'green',
  children,
}) {
  const pct = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const colorClass = {
    green: 'text-green-500 dark:text-green-600',
    yellow: 'text-amber-500 dark:text-amber-600',
    red: 'text-red-500 dark:text-red-600',
  }[color] || 'text-slate-500 dark:text-slate-600';

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        {/* Background track circle */}
        <circle
          className="text-slate-100 dark:text-slate-800"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress indicator circle */}
        <circle
          className={`${colorClass} transition-all duration-500 ease-out`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {children && (
        <div className="absolute flex items-center justify-center inset-0">
          {children}
        </div>
      )}
    </div>
  );
}
