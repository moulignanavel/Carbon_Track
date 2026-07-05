/**
 * Card — CarbonTrack Design System
 *
 * Variants: default | glass | gradient | flat | bordered
 *
 * Composable sub-components:
 *   Card.Header  — title, subtitle, action slot
 *   Card.Body    — scrollable content area
 *   Card.Footer  — actions row
 *   Card.Stat    — KPI stat block inside a card
 */

const VARIANTS = {
  default:  'card',
  glass:    'card-glass',
  gradient: 'card-gradient',
  flat:     'bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60',
  bordered: 'bg-white dark:bg-slate-900 rounded-xl border-2 border-green-200 dark:border-green-900',
};

function Card({
  children,
  variant = 'default',
  className = '',
  noPadding = false,
  hover = false,
  ...props
}) {
  return (
    <div
      className={[
        VARIANTS[variant],
        noPadding ? '' : 'p-5',
        hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  iconColor = 'text-green-600',
  className = '',
}) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className={`mt-0.5 shrink-0 ${iconColor}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          {title && (
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '', scrollable = false }) {
  return (
    <div className={`${scrollable ? 'overflow-y-auto' : ''} ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 ${className}`}
    >
      {children}
    </div>
  );
};

Card.Stat = function CardStat({ label, value, delta, deltaType = 'neutral' }) {
  const deltaColors = {
    up:      'text-red-500 dark:text-red-400',
    down:    'text-green-600 dark:text-green-400',
    neutral: 'text-slate-400',
  };
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {delta && (
        <p className={`mt-0.5 text-xs ${deltaColors[deltaType]}`}>{delta}</p>
      )}
    </div>
  );
};

export default Card;
