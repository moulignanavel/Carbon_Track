import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Select — CarbonTrack Design System
 *
 * Styled native <select> with label, error, hint, and grouped options support.
 * Forwards ref for RHF register() compatibility.
 *
 * @param {{ label, id, error, hint, placeholder, options, groups }} props
 * @param {Array<{ value, label }>}                                  props.options  — flat list
 * @param {Array<{ label, options: Array<{ value, label }> }>}       props.groups   — grouped
 */

const Select = forwardRef(function Select(
  {
    label,
    id,
    error,
    hint,
    placeholder,
    options = [],
    groups = [],
    className = '',
    wrapperClassName = '',
    ...props
  },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasGroups = groups.length > 0;

  return (
    <div className={`flex flex-col ${wrapperClassName}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {props.required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={[
            'form-input appearance-none pr-10',
            error ? '!border-red-400' : '',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {hasGroups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <p role="alert" className="form-error">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="form-hint">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;
