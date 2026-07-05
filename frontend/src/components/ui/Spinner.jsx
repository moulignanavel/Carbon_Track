import { Loader2 } from 'lucide-react';

/**
 * Spinner — CarbonTrack Design System
 *
 * Variants: default | dots | bars | ring
 * Sizes:    xs | sm | md | lg | xl
 * Modes:    inline | fullPage | overlay
 */

const SIZES = {
  xs: { icon: 'h-3.5 w-3.5', dot: 'h-1.5 w-1.5', bar: 'h-3 w-0.5' },
  sm: { icon: 'h-4 w-4',     dot: 'h-2 w-2',     bar: 'h-4 w-0.5' },
  md: { icon: 'h-6 w-6',     dot: 'h-2.5 w-2.5', bar: 'h-5 w-1'   },
  lg: { icon: 'h-8 w-8',     dot: 'h-3 w-3',     bar: 'h-6 w-1'   },
  xl: { icon: 'h-12 w-12',   dot: 'h-4 w-4',     bar: 'h-8 w-1.5' },
};

function DotsSpinner({ size }) {
  const { dot } = SIZES[size];
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${dot} rounded-full bg-green-500 animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function BarsSpinner({ size }) {
  const { bar } = SIZES[size];
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`${bar} rounded-full bg-green-500 animate-pulse`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </span>
  );
}

function DefaultSpinner({ size }) {
  return (
    <Loader2
      className={`${SIZES[size].icon} animate-spin text-green-600 dark:text-green-400`}
      aria-hidden="true"
    />
  );
}

export default function Spinner({
  size     = 'md',
  variant  = 'default',
  label    = 'Loading…',
  fullPage = false,
  overlay  = false,
  className = '',
}) {
  const inner = (
    <span
      role="status"
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
    >
      {variant === 'dots'    && <DotsSpinner size={size} />}
      {variant === 'bars'    && <BarsSpinner size={size} />}
      {(variant === 'default' || variant === 'ring') && <DefaultSpinner size={size} />}
      <span className="sr-only">{label}</span>
    </span>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl">
        {inner}
      </div>
    );
  }

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <DefaultSpinner size="xl" />
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{label}</p>
      </div>
    );
  }

  return inner;
}
