import React from 'react';
import { HelpCircle, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Card, { CardHeader } from './Card';

export const WhyEvidenceSection = ({
  evidence = [],
  quality = 'good',
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <Card className={className}>
      <CardHeader
        icon={HelpCircle}
        title={t('evidence.title', 'Why? Scientific Evidence & Analysis')}
        subtitle={t('evidence.subtitle', 'Agronomic reasoning and probe evidence driving this quality classification.')}
      />

      <div className="space-y-3">
        {evidence.length > 0 ? (
          evidence.map((point, index) => {
            const isWarning = quality === 'poor' || (typeof point === 'object' && point.type === 'warning');
            const title = typeof point === 'object' ? point.title : `Agronomic Factor #${index + 1}`;
            const detail = typeof point === 'object' ? point.detail : point;

            return (
              <div
                key={index}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                  !isWarning
                    ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950'
                    : 'bg-amber-50/40 border-amber-200/80 text-amber-950'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  !isWarning ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {!isWarning ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-0.5">
                    {title}
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {detail}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500">
            {t('evidence.no_evidence', 'No evidence details available.')}
          </p>
        )}
      </div>
    </Card>
  );
};

export default WhyEvidenceSection;
