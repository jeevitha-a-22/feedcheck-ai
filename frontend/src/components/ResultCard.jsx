import React from 'react';
import Badge from './Badge';
import QualityGauge from './QualityGauge';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { getQualityVariant, getQualityLabel, formatConfidence, formatRiskLevel } from '../utils/formatters';

export const ResultCard = ({
  quality = 'good',
  score = 92,
  confidence = 0.87,
  risk_level = 'medium',
  advisorySummary = '',
  flags = [],
  className = ''
}) => {
  const { t } = useLanguage();
  const badgeVariant = getQualityVariant(quality);
  const gradeLabel = getQualityLabel(quality, t);
  const formattedConfidence = formatConfidence(confidence);
  const formattedRisk = formatRiskLevel(risk_level, t);

  const getRiskIcon = () => {
    if (badgeVariant === 'emerald') return ShieldCheck;
    if (badgeVariant === 'amber') return AlertTriangle;
    return XCircle;
  };

  const RiskIcon = getRiskIcon();

  return (
    <div className={`p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Gauge */}
        <div className="md:col-span-5 flex justify-center">
          <QualityGauge score={score} grade={gradeLabel} />
        </div>

        {/* Right: Confidence, Risk Level & Summary */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="md" variant={badgeVariant} dot>
              {gradeLabel}
            </Badge>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>{formattedConfidence} {t('quality.ai_confidence', 'AI Confidence')}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {badgeVariant === 'emerald'
                ? t('quality.prime_quality', 'Prime Quality Silage')
                : badgeVariant === 'amber'
                ? t('quality.moderate_risk_title', 'Moderate Risk (Inspect Sample)')
                : t('quality.high_spoilage_title', 'High Spoilage / Risk Detected')}
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed font-medium">
              {advisorySummary || t('quality.eval_default', 'Evaluated based on moisture equilibrium, pH acidity, and thermal stability.')}
            </p>
          </div>

          {/* Risk Level Badge Box */}
          <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            badgeVariant === 'emerald'
              ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
              : badgeVariant === 'amber'
              ? 'border-amber-200 bg-amber-50/50 text-amber-800'
              : 'border-rose-200 bg-rose-50/50 text-rose-800'
          }`}>
            <RiskIcon className="w-5 h-5 text-current shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t('quality.risk_label', 'Risk Classification')}: {formattedRisk}
              </h5>
              <p className="text-xs text-slate-600 mt-0.5">
                {badgeVariant === 'emerald'
                  ? 'No secondary clostridial or yeast fermentation detected.'
                  : badgeVariant === 'amber'
                  ? 'Mild aerobic warming or moisture variation present.'
                  : 'Active mold sporulation or secondary butyric fermentation.'}
              </p>
            </div>
          </div>

          {/* Quality flags if any */}
          {flags && flags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('quality.flags_title', 'Detected Flags:')}
              </span>
              {flags.map((flag, idx) => (
                <p key={idx} className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 font-medium">
                  • {flag}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
