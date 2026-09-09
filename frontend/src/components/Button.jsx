import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 shadow-md min-h-[48px]',
    xl: 'px-7 py-4 text-base sm:text-lg gap-3 shadow-lg min-h-[54px]'
  };

  const variantStyles = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-md shadow-brand-600/25',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-700 shadow-sm',
    harvest: 'bg-gradient-to-r from-harvest-500 to-harvest-600 hover:from-harvest-600 hover:to-harvest-700 text-slate-950 font-extrabold focus:ring-harvest-400 shadow-md shadow-harvest-500/25',
    outline: 'bg-white border border-slate-300/90 hover:bg-slate-50 text-slate-700 focus:ring-brand-500 shadow-xs',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm'
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
