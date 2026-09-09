import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  unit,
  helperText,
  error,
  icon: Icon,
  disabled = false,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center rounded-2xl bg-slate-50 border border-slate-200/90 transition-all focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20 shadow-xs min-h-[46px]">
        {Icon && (
          <div className="pl-3.5 pr-1 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full py-3 px-3.5 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none disabled:opacity-50 ${Icon ? 'pl-2' : ''} ${unit ? 'pr-14' : ''}`}
          {...props}
        />
        {unit && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-200/80 text-slate-700 pointer-events-none select-none">
            {unit}
          </div>
        )}
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

export default Input;
