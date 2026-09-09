import React from 'react';
import { HeartHandshake, CheckCircle2, Wrench } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Card, { CardHeader } from './Card';

export const AdvisoryCard = ({
  advisory,
  className = ''
}) => {
  const { t } = useLanguage();
  const isString = typeof advisory === 'string';
  const summaryText = isString ? advisory : advisory?.summary;
  const herdText = !isString && advisory?.herd_inclusion
    ? advisory.herd_inclusion
    : t('advisory.default_herd', 'Review feeding inclusion with your herd nutritionist based on moisture and fermentation quality.');
  const bunkerText = !isString && advisory?.bunker_action
    ? advisory.bunker_action
    : t('advisory.default_bunker', 'Inspect silo / bunker face for warming, ensure plastic covering integrity, and feed out at a steady rate.');

  return (
    <Card className={`bg-gradient-to-br from-white via-white to-brand-50/30 border-brand-200/80 ${className}`}>
      <CardHeader
        icon={HeartHandshake}
        title={t('result.advisory_title', 'Farmer Feeding & Management Advisory')}
        subtitle={t('result.advisory_sub', "Actionable guidance tailored to this feed batch's preservation state.")}
      />

      <div className="space-y-4">
        {/* Main Recommendation Highlight */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
            {t('advisory.quality_overview', 'Quality Assessment Overview')}
          </span>
          <p className="text-sm font-bold text-slate-900 leading-relaxed">
            {summaryText || t('advisory.default_summary', 'Silage is suitable for farm ration formulation.')}
          </p>
        </div>

        {/* 2-Column Actionable Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Livestock / Herd Feeding Advice */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-brand-800">
                {t('advisory.herd_guidance', 'Herd Ration Guidance')}
              </h5>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {herdText}
            </p>
          </div>

          {/* Bunker Management Advice */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-harvest-50 text-harvest-700 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-harvest-800">
                {t('advisory.bunker_action', 'Bunker Management Action')}
              </h5>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {bunkerText}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdvisoryCard;
