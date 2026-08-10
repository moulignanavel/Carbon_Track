import { useEffect, useCallback, useRef } from 'react';
import { createPortal }                   from 'react-dom';
import { X }                              from 'lucide-react';

/**
 * Modal / Dialog — CarbonTrack Design System
 *
 * Features:
 *  - Renders via React portal (avoids stacking-context issues)
 *  - Closes on Escape key and backdrop click
 *  - Locks body scroll while open
 *  - Focus trap (first focusable element auto-focused)
 *  - Smooth scale-in / fade animation
 *  - Sizes: sm | md | lg | xl | 2xl | full
 *  - Variants: default | glass
 */

const SIZES = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  '3xl':'max-w-3xl',
  '4xl':'max-w-4xl',
  '5xl':'max-w-5xl',
  full: 'max-w-full m-4',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  glass = false,
  hideCloseButton = false,
  preventBackdropClose = false,
}) {
  const panelRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    // Auto-focus first focusable element
    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const panelClasses = glass
    ? 'card-glass'
    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={preventBackdropClose ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full ${SIZES[size]} rounded-2xl scale-in ${panelClasses}`}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              {title && (
                <h2 id="modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-desc" className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
