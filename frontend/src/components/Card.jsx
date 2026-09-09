import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  highlight = false,
  padding = 'default',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const highlightBorder = highlight ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200/80';
  const hoverClasses = hoverable ? 'transition-all duration-200 hover:shadow-card hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border ${highlightBorder} shadow-soft ${paddingStyles[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, badge, action, icon: Icon, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 mb-4 ${className}`}>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default Card;
