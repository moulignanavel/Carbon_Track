/**
 * Badge — CarbonTrack Design System
 *
 * Compact status / label pills.
 *
 * Variants : green | teal | yellow | red | slate | purple | blue | orange
 * Sizes    : xs | sm | md
 * Shapes   : rounded-full (pill) or rounded-lg (soft)
 * Options  : dot indicator, removable (onRemove), icon
 */

const VARIANTS = {
  green:  'bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300',
  teal:   'bg-teal-100   text-teal-800   dark:bg-teal-900/40   dark:text-teal-300',
  yellow: 'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  red:    'bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300',
  slate:  'bg-slate-100  text-slate-700  dark:bg-slate-800     dark:text-slate-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  blue:   'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

const DOT_COLORS = {
  green:  'bg-green-500',
  teal:   'bg-teal-500',
  yellow: 'bg-amber-500',
  red:    'bg-red-500',
  slate:  'bg-slate-500',
  purple: 'bg-purple-500',
  blue:   'bg-blue-500',
  orange: 'bg-orange-500',
};

const SIZES = {
  xs: 'px-1.5 py-0 text-[10px] gap-1',
  sm: 'px-2   py-0.5 text-xs  gap-1',
  md: 'px-2.5 py-1   text-xs  gap-1.5',
};

export default function Badge({
  children,
  variant = 'green',
  size = 'sm',
  dot = false,
  pill = true,
  icon: Icon,
  onRemove,
  className = '',
}) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium',
        VARIANTS[variant],
        SIZES[size],
        pill ? 'rounded-full' : 'rounded-lg',
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT_COLORS[variant]}`}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </span>
  );
}
