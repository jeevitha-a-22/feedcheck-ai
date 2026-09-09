import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getStatusVariant } from '../utils/formatters';

export const MetricCard = ({
  title,
  value,
  unit = '',
  targetRange,
  status = 'optimal',
  subtext,
  icon: Icon,
  className = ''
}) => {
  const { t } = useLanguage();

  const statusConfig = {
    within_range: {
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: 'text-emerald-800 bg-emerald-100 border border-emerald-200',
      badgeText: t('metrics.in_range', 'In Range'),
      icon: CheckCircle2
    },
    optimal: {
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: 'text-emerald-800 bg-emerald-100 border border-emerald-200',
      badgeText: t('metrics.optimal', 'Optimal'),
      icon: CheckCircle2
    },
    warning: {
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      badge: 'text-amber-800 bg-amber-100 border border-amber-200',
      badgeText: t('metrics.caution', 'Caution'),
      icon: AlertTriangle
    },
    danger: {
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      badge: 'text-rose-800 bg-rose-100 border border-rose-200',
      badgeText: t('metrics.high_risk', 'High Risk'),
      icon: XCircle
    },
    info: {
      color: 'text-slate-700 bg-slate-50 border-slate-200',
      badge: 'text-slate-800 bg-slate-100 border border-slate-200',
      badgeText: t('metrics.standard', 'Standard'),
      icon: Info
    }
  };

  const normalizedStatus = statusConfig[status] ? status : 'info';
  const current = statusConfig[normalizedStatus];
  const StatusIcon = current.icon;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
              {title}
            </span>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${current.badge}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{current.badgeText}</span>
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-bold text-slate-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{t('metrics.target', 'Target')}: <strong className="text-slate-800 font-bold">{targetRange || 'N/A'}</strong></span>
        {subtext && <span className="text-slate-400 truncate max-w-[130px]">{subtext}</span>}
      </div>
    </div>
  );
};

export default MetricCard;
