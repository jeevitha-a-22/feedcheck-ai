import React from 'react';
import { Eye, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Card, { CardHeader } from './Card';

export const VisualIndicators = ({
  imageUrl,
  visualIndicators = [],
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <Card className={className}>
      <CardHeader
        icon={Eye}
        title={t('visual_indicators.title', 'Visual & Physical Indicators')}
        subtitle={t('visual_indicators.subtitle', 'Computer vision analysis of color tones, particle size, and mold presence.')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
        {/* Sample Photo with AI bounding indicators */}
        <div className="sm:col-span-5">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video sm:aspect-square group shadow-sm">
            <img
              src={imageUrl || '/assets/corn_silage.jpg'}
              alt="Silage sample visual"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            
            {/* AI Visual Scan Tag */}
            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>{t('visual_indicators.scan_verified', 'Vision Scan Verified')}</span>
            </div>

            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <span className="text-[11px] font-bold block">
                {typeof visualIndicators[0] === 'string'
                  ? visualIndicators[0]
                  : visualIndicators[0]?.value || 'Silage Surface Scan'}
              </span>
              <span className="text-[10px] text-slate-300">
                {t('visual_indicators.surface_scan', 'Surface Scan Analysis')}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Traits List */}
        <div className="sm:col-span-7 space-y-3">
          {visualIndicators.length > 0 ? (
            visualIndicators.map((indicator, idx) => {
              const isString = typeof indicator === 'string';
              const label = isString ? `${t('visual_indicators.observation_prefix', 'Visual Observation')} #${idx + 1}` : indicator.label || `${t('visual_indicators.trait_prefix', 'Trait')} #${idx + 1}`;
              const value = isString ? indicator : indicator.value;
              const status = isString
                ? indicator.toLowerCase().includes('discolor') || indicator.toLowerCase().includes('mold') || indicator.toLowerCase().includes('uneven')
                  ? 'warning'
                  : 'optimal'
                : indicator.status || 'optimal';

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      status === 'optimal'
                        ? 'bg-emerald-100 text-emerald-700'
                        : status === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {status === 'optimal' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{label}</h5>
                      <p className="text-[11px] text-slate-500">{t('visual_indicators.cv_metric', 'Computer Vision Metric')}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    status === 'optimal'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : status === 'warning'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {value}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500">
              {t('visual_indicators.no_indicators', 'No visual indicators recorded.')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VisualIndicators;
