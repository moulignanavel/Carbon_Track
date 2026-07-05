import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dropdown — CarbonTrack Design System
 *
 * Headless-style dropdown menu. Handles:
 *  - Click-outside to close
 *  - Keyboard navigation (ArrowUp/Down, Enter, Escape)
 *  - Item icons, dividers, destructive items, disabled items
 *  - Placement: bottom-left | bottom-right | top-left | top-right
 *
 * @param {{ trigger, items, placement, width, onSelect }} props
 *
 * items shape:
 *   { id, label, icon?, badge?, destructive?, disabled?, dividerAfter?, checked? }
 */

const PLACEMENT = {
  'bottom-left':  'top-full left-0 mt-1.5',
  'bottom-right': 'top-full right-0 mt-1.5',
  'top-left':     'bottom-full left-0 mb-1.5',
  'top-right':    'bottom-full right-0 mb-1.5',
};

export default function Dropdown({
  trigger,
  items = [],
  placement = 'bottom-left',
  width = 'w-52',
  onSelect,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const containerRef = useRef(null);
  const activeItems = items.filter((i) => !i.dividerAfter || true);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocused(-1);
  }, []);

  // Click-outside
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  // Keyboard nav
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault(); setIsOpen(true);
      }
      return;
    }
    const navigable = items.filter((i) => !i.disabled);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocused((f) => Math.min(f + 1, navigable.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocused((f) => Math.max(f - 1, 0));
    } else if (e.key === 'Enter' && focused >= 0) {
      e.preventDefault();
      onSelect?.(navigable[focused]);
      close();
    } else if (e.key === 'Escape') {
      close();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Options
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          role="menu"
          className={`absolute z-50 ${PLACEMENT[placement]} ${width} scale-in`}
        >
          <div className="card-glass overflow-hidden rounded-2xl py-1 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
            {items.map((item, idx) => {
              if (item.type === 'divider') {
                return <div key={idx} className="my-1 h-px bg-slate-100 dark:bg-slate-800" />;
              }
              if (item.type === 'label') {
                return (
                  <p key={idx} className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {item.label}
                  </p>
                );
              }
              return (
                <div key={item.id ?? idx}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      onSelect?.(item);
                      close();
                    }}
                    className={[
                      'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100',
                      item.destructive
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-800',
                      item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                      focused === idx ? 'bg-green-50 dark:bg-slate-800' : '',
                    ].join(' ')}
                  >
                    {item.icon && (
                      <item.icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    )}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        {item.badge}
                      </span>
                    )}
                    {item.checked && (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                    )}
                  </button>
                  {item.dividerAfter && (
                    <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
