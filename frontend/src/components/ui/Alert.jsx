import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Alert — CarbonTrack Design System
 *
 * Variants: success | warning | error | info
 * Options:  dismissible, icon, title, action slot
 */

const CONFIG = {
  success: {
    icon:    CheckCircle2,
    wrapper: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    icon_cl: 'text-green-600 dark:text-green-400',
    title_cl:'text-green-800 dark:text-green-300',
    text_cl: 'text-green-700 dark:text-green-400',
    close_cl:'text-green-500 hover:text-green-700 dark:hover:text-green-300',
  },
  warning: {
    icon:    AlertTriangle,
    wrapper: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    icon_cl: 'text-amber-500 dark:text-amber-400',
    title_cl:'text-amber-800 dark:text-amber-300',
    text_cl: 'text-amber-700 dark:text-amber-400',
    close_cl:'text-amber-500 hover:text-amber-700 dark:hover:text-amber-300',
  },
  error: {
    icon:    XCircle,
    wrapper: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon_cl: 'text-red-500 dark:text-red-400',
    title_cl:'text-red-800 dark:text-red-300',
    text_cl: 'text-red-700 dark:text-red-400',
    close_cl:'text-red-400 hover:text-red-600 dark:hover:text-red-300',
  },
  info: {
    icon:    Info,
    wrapper: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon_cl: 'text-blue-500 dark:text-blue-400',
    title_cl:'text-blue-800 dark:text-blue-300',
    text_cl: 'text-blue-700 dark:text-blue-400',
    close_cl:'text-blue-400 hover:text-blue-600 dark:hover:text-blue-300',
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  action,
  className = '',
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const c = CONFIG[variant];
  const Icon = c.icon;

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-xl border p-4 ${c.wrapper} ${className}`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${c.icon_cl}`} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold ${c.title_cl}`}>{title}</p>
        )}
        {children && (
          <p className={`text-sm mt-0.5 ${c.text_cl}`}>{children}</p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className={`shrink-0 rounded-md p-0.5 transition-colors ${c.close_cl}`}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
