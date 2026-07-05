/**
 * EmptyState — CarbonTrack Design System
 *
 * Zero-data placeholder with icon, title, description, and optional CTA.
 * Variants: default | ghost | card
 * Sizes:    sm | md | lg
 */

const SIZES = {
  sm: { wrap: 'py-10 px-4', iconBox: 'h-10 w-10', icon: 'h-5 w-5', title: 'text-sm', desc: 'text-xs' },
  md: { wrap: 'py-16 px-6', iconBox: 'h-14 w-14', icon: 'h-7 w-7', title: 'text-base', desc: 'text-sm' },
  lg: { wrap: 'py-24 px-8', iconBox: 'h-20 w-20', icon: 'h-10 w-10', title: 'text-lg', desc: 'text-base' },
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  variant = 'default',
  className = '',
}) {
  const s = SIZES[size];

  const wrapperClass = {
    default: '',
    ghost:   'rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700',
    card:    'card',
  }[variant];

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        s.wrap,
        wrapperClass,
        className,
      ].join(' ')}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div
          className={`mb-4 flex ${s.iconBox} items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30`}
          aria-hidden="true"
        >
          <Icon className={`${s.icon} text-green-600 dark:text-green-400`} />
        </div>
      )}

      {title && (
        <h3 className={`font-semibold text-slate-900 dark:text-slate-100 ${s.title}`}>
          {title}
        </h3>
      )}

      {description && (
        <p className={`mt-1.5 max-w-sm text-slate-500 dark:text-slate-400 ${s.desc}`}>
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
