import { useState, useRef } from 'react';

/**
 * Tooltip — CarbonTrack Design System
 *
 * Hover-triggered tooltip. Placement: top | bottom | left | right
 * Pure CSS-positioned, no JS measurements needed for common cases.
 */

const PLACEMENTS = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const ARROW_PLACEMENTS = {
  top:    'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent',
  left:   'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent',
  right:  'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent',
};

export default function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  if (!content || disabled) return children;

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 ${PLACEMENTS[placement]} fade-in`}
        >
          <span className="relative block px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium whitespace-nowrap shadow-lg">
            {content}
            {/* Arrow */}
            <span
              className={`absolute border-4 border-solid ${ARROW_PLACEMENTS[placement]}`}
              aria-hidden="true"
            />
          </span>
        </span>
      )}
    </span>
  );
}
