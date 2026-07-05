import { useState } from 'react';

/**
 * Tabs — CarbonTrack Design System
 *
 * Variants: line | pills | boxed
 * Supports icons, badges, and disabled tabs.
 *
 * tabs: Array<{ id, label, icon?, badge?, disabled? }>
 */

const CONTAINER_VARIANTS = {
  line:  'border-b border-slate-200 dark:border-slate-800',
  pills: 'bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl',
  boxed: 'border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-900',
};

const TAB_BASE = 'inline-flex items-center gap-2 text-sm font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed';

const TAB_VARIANTS = {
  line: {
    base:   `${TAB_BASE} px-1 py-3 border-b-2 -mb-px`,
    active: 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-400',
    idle:   'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
  },
  pills: {
    base:   `${TAB_BASE} px-3 py-1.5 rounded-lg`,
    active: 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-300 shadow-sm',
    idle:   'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
  },
  boxed: {
    base:   `${TAB_BASE} px-3 py-1.5 rounded-lg`,
    active: 'bg-green-600 text-white shadow-sm',
    idle:   'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
  },
};

export default function Tabs({
  tabs = [],
  defaultTab,
  activeTab: controlledActive,
  onChange,
  variant = 'line',
  className = '',
  children,
}) {
  const [internal, setInternal] = useState(defaultTab ?? tabs[0]?.id);
  const active = controlledActive ?? internal;

  const handleChange = (id) => {
    setInternal(id);
    onChange?.(id);
  };

  const styles = TAB_VARIANTS[variant];

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        className={`flex items-center gap-1 ${CONTAINER_VARIANTS[variant]}`}
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleChange(tab.id)}
            className={`${styles.base} ${active === tab.id ? styles.active : styles.idle}`}
          >
            {tab.icon && <tab.icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
            {tab.label}
            {tab.badge != null && (
              <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full leading-none ${
                active === tab.id
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel */}
      {children && (
        <div className="mt-4">
          {typeof children === 'function'
            ? children(active)
            : children}
        </div>
      )}
    </div>
  );
}
