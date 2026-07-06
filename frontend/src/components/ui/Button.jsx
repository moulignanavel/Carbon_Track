import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button — CarbonTrack Design System
 * ─────────────────────────────────────────────────────────────
 * 
 * Fully accessible, production-ready button component with:
 *  - Multiple variants (primary, secondary, ghost, outline, danger, success, glass)
 *  - Multiple sizes (xs, sm, md, lg, xl)
 *  - Loading state with spinner
 *  - Disabled state handling
 *  - Full keyboard support (focus-visible)
 *  - ARIA support (aria-label, aria-busy, aria-disabled)
 *  - Icon support (left/right icons)
 *  - Responsive padding
 * 
 * Props:
 *   variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'glass'
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   loading?: boolean
 *   disabled?: boolean
 *   fullWidth?: boolean
 *   rounded?: boolean (pill shape)
 *   leftIcon?: React.ReactNode
 *   rightIcon?: React.ReactNode
 *   aria-label?: string (required for icon-only buttons)
 *   ...htmlButtonProps
 * 
 * Usage:
 *   <Button variant="primary" size="md" onClick={handleClick}>
 *     Submit Form
 *   </Button>
 *   
 *   <Button variant="danger" loading={isDeleting} disabled={isDeleting}>
 *     Delete Item
 *   </Button>
 *   
 *   <Button variant="ghost" aria-label="Close modal" size="sm">
 *     <X className="w-4 h-4" />
 *   </Button>
 */

const BASE = [
  'relative inline-flex items-center justify-center gap-2',
  'font-semibold rounded-xl leading-none',
  'transition-all duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  'select-none whitespace-nowrap cursor-pointer',
  'active:scale-[0.98]',
].join(' ');

const VARIANTS = {
  primary: [
    'bg-green-600 text-white',
    'hover:bg-green-700 active:bg-green-800',
    'shadow-sm hover:shadow-[0_0_16px_rgb(34_197_94_/_0.4)]',
    'focus-visible:ring-green-500',
  ].join(' '),

  secondary: [
    'bg-green-100 text-green-800',
    'hover:bg-green-200 active:bg-green-300',
    'focus-visible:ring-green-400',
    'dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50',
  ].join(' '),

  ghost: [
    'bg-transparent text-slate-600',
    'hover:bg-slate-100 active:bg-slate-200',
    'focus-visible:ring-slate-400',
    'dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' '),

  outline: [
    'border-2 border-green-600 text-green-700 bg-transparent',
    'hover:bg-green-50 active:bg-green-100',
    'focus-visible:ring-green-500',
    'dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950/30',
  ].join(' '),

  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700 active:bg-red-800',
    'shadow-sm focus-visible:ring-red-500',
  ].join(' '),

  success: [
    'bg-teal-600 text-white',
    'hover:bg-teal-700 active:bg-teal-800',
    'shadow-sm focus-visible:ring-teal-500',
  ].join(' '),

  glass: [
    'bg-white/10 text-white backdrop-blur-md border border-white/20',
    'hover:bg-white/20 active:bg-white/30',
    'focus-visible:ring-white/50',
  ].join(' '),
};

const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-base',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  leftIcon,
  rightIcon,
  children,
  'aria-label': ariaLabel,
  className = '',
  ...props
}, ref) => {
  const isBtnLoading = loading || isLoading;

  // Validate icon-only buttons have aria-label
  const isIconOnly = !children && (leftIcon || rightIcon);
  if (isIconOnly && !ariaLabel) {
    console.warn(
      '[Button] Icon-only buttons must have an aria-label prop for accessibility. ' +
      'Example: <Button aria-label="Close modal"><X /></Button>'
    );
  }

  const pillClass = rounded ? 'rounded-full' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      disabled={disabled || isBtnLoading}
      className={`
        ${BASE}
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${pillClass}
        ${widthClass}
        ${className}
      `}
      aria-label={ariaLabel}
      aria-busy={isBtnLoading}
      aria-disabled={disabled || isBtnLoading}
      {...props}
    >
      {isBtnLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {!isBtnLoading && leftIcon}
      {children}
      {!isBtnLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
