import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard — CarbonTrack Design System
 *
 * Dashboard KPI card with:
 *  - Icon badge (top-right)
 *  - Large metric value + unit
 *  - Trend indicator (up = bad for emissions, down = good)
 *  - Skeleton loading state
 *  - Variants: default | glass | gradient
 */

const TREND_CONFIG = {
  up:      { icon: TrendingUp,   color: 'text-[#b91c1c] dark:text-red-400',   bg: 'bg-red-50 dark:bg-red-900/20' },
  down:    { icon: TrendingDown, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  neutral: { icon: Minus,        color: 'text-slate-400',                    bg: 'bg-slate-50 dark:bg-slate-800' },
};

export default function StatCard({
  title,
  value,
  unit,
  trend,
  trendLabel,
  trendValue,
  icon: Icon,
  iconBg   = 'bg-green-100 dark:bg-green-900/30',
  iconColor = 'text-green-600 dark:text-green-400',
  variant  = 'default',
  isLoading = false,
  className = '',
}) {
  const trendCfg  = TREND_CONFIG[trend ?? 'neutral'];
  const TrendIcon = trendCfg.icon;

  const wrapperClass = {
    default:  'card p-5',
    glass:    'card-glass p-5',
    gradient: 'card-gradient p-5',
  }[variant] ?? 'card p-5';

  const isGradient = variant === 'gradient';

  if (isLoading) {
    return (
      <div className={`card p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton-shimmer h-4 w-28" />
          <div className="skeleton-shimmer h-9 w-9 rounded-xl" />
        </div>
        <div className="skeleton-shimmer h-8 w-24 mb-2" />
        <div className="skeleton-shimmer h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={`${wrapperClass} ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className={`text-sm font-medium ${isGradient ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
          {title}
        </p>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isGradient ? 'bg-white/20' : iconBg}`}>
            <Icon className={`h-4.5 w-4.5 ${isGradient ? 'text-white' : iconColor}`} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <p className={`text-2xl font-bold leading-none ${isGradient ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
          {value}
        </p>
        {unit && (
          <p className={`text-sm mb-0.5 ${isGradient ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
            {unit}
          </p>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg w-fit ${trendCfg.bg}`}>
          <TrendIcon className={`h-3.5 w-3.5 ${trendCfg.color}`} aria-hidden="true" />
          {trendValue && <span className={trendCfg.color}>{trendValue}</span>}
          {trendLabel && <span className="text-slate-500 dark:text-slate-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
