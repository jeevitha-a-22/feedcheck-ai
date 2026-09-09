import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  helperText,
  error,
  icon: Icon,
  disabled = false,
  className = '',
  required = false,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center rounded-2xl bg-slate-50 border border-slate-200/90 transition-all focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20 shadow-xs min-h-[46px]">
        {Icon && (
          <div className="pl-3.5 pr-1 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full py-3 px-3.5 pr-10 text-sm bg-transparent text-slate-900 font-semibold focus:outline-none appearance-none cursor-pointer disabled:opacity-50 ${Icon ? 'pl-2' : ''}`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const labelText = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 font-medium">{helperText}</p>
      )}
      {error && (
        <p className="text-xs font-bold text-rose-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
