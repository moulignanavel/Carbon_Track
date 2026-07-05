import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Input — CarbonTrack Design System
 *
 * Features: label, error, hint, left/right icon, password toggle,
 *           character count, optional floating label variant.
 * Fully accessible, forwards ref for RHF.
 */

const Input = forwardRef(function Input(
  {
    label,
    id,
    error,
    hint,
    leftIcon,
    rightElement,
    type = 'text',
    className = '',
    wrapperClassName = '',
    showCharCount = false,
    maxLength,
    value,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`flex flex-col ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-slate-500">
            <span className="h-4 w-4">{leftIcon}</span>
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={
            [
              error   ? `${inputId}-error` : null,
              hint    ? `${inputId}-hint`  : null,
            ].filter(Boolean).join(' ') || undefined
          }
          className={[
            'form-input',
            leftIcon           ? 'pl-10'  : '',
            isPassword || rightElement ? 'pr-10' : '',
            error ? '!border-red-400 !focus:ring-red-400' : '',
            className,
          ].join(' ')}
          {...props}
        />

        {/* Right — password toggle or custom element */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword
              ? <EyeOff className="h-4 w-4" aria-hidden="true" />
              : <Eye    className="h-4 w-4" aria-hidden="true" />}
          </button>
        ) : rightElement ? (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {rightElement}
          </span>
        ) : null}
      </div>

      {/* Error or hint row */}
      <div className="flex items-start justify-between mt-1.5 gap-2">
        {error ? (
          <p id={`${inputId}-error`} role="alert" className="form-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="form-hint">{hint}</p>
        ) : (
          <span />
        )}

        {showCharCount && maxLength && (
          <p className={`text-xs shrink-0 ${charCount >= maxLength ? 'text-red-500' : 'text-slate-400'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

export default Input;
