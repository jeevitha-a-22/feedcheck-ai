import React from 'react';

export const Badge = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  icon: Icon,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold'
  };

  const variantStyles = {
    brand: 'bg-brand-50 text-brand-700 border border-brand-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    sky: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    harvest: 'bg-harvest-100 text-harvest-800 border border-harvest-200'
  };

  const dotColors = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    slate: 'bg-slate-400',
    harvest: 'bg-harvest-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.slate} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.slate}`} />}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
