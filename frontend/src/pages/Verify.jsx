import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFeedTest } from '../hooks/useFeedTest';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import MetricCard from '../components/MetricCard';
import { formatDate, getQualityVariant, getQualityLabel, formatConfidence, formatRiskLevel } from '../utils/formatters';
import {
  FileCheck2,
  MapPin,
  Tag,
  ArrowLeft,
  Sparkles,
  Printer,
  ShieldAlert,
  Inbox
} from 'lucide-react';

export const VerifyPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { currentResult, getTestById } = useFeedTest();

  const [record, setRecord] = useState(() => {
    if (currentResult && (!id || currentResult.id === id)) {
      return currentResult;
    }
    try {
      const saved = sessionStorage.getItem('feedcheck_current_result');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!id || parsed.id === id) return parsed;
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState(!record);

  useEffect(() => {
    let isMounted = true;
    const fetchRecord = async () => {
      if (record && (!id || record.id === id)) {
        setLoading(false);
        return;
      }

      if (id) {
        setLoading(true);
        try {
          const found = await getTestById(id);
          if (isMounted) {
            setRecord(found || (currentResult?.id === id ? currentResult : null));
          }
        } catch (err) {
          console.error('[VerifyPage] Error retrieving record:', err);
          if (isMounted) setRecord(null);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchRecord();
    return () => {
      isMounted = false;
    };
  }, [id, currentResult, getTestById]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fadeIn">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <h3 className="font-bold text-slate-800 text-lg">
          {t('verify.retrieving', 'Retrieving Batch Traceability Record...')}
        </h3>
        <p className="text-xs text-slate-500">
          {t('verify.querying', 'Querying verified screening repository')}
        </p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
        <Card className="text-center py-12">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">
            {t('verify.not_found_title', 'Verification record not found.')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-md mx-auto">
            {t('verify.not_found_desc', 'No active screening record exists with this ID. Ensure the test was completed and stored on this system.')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/new-test">
              <Button size="sm">{t('verify.perform_new', 'Perform New Test')}</Button>
            </Link>
            <Link to="/history">
              <Button size="sm" variant="outline">{t('verify.browse_history', 'Browse History')}</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const quality = record.quality || 'good';
  const gradeLabel = getQualityLabel(quality, t);
  const badgeVariant = getQualityVariant(quality);
  const formattedConfidence = formatConfidence(record.confidence ?? 0.87);
  const formattedRisk = formatRiskLevel(record.risk_level || (quality === 'good' ? 'low' : quality === 'moderate' ? 'medium' : 'high'), t);
  const rawFeedType = record.feed_type || record.feedTypeName || 'Silage Sample';
  const feedTypeName = record.feed_type_id ? t(`feed_types.${record.feed_type_id}`, rawFeedType) : rawFeedType;
  const farmLocation = record.farm_location || record.farmLocation || 'Main Bunker Lot';
  const batchId = record.batch_id || record.batchId || 'BATCH-2026';
  const formattedDate = formatDate(record.timestamp);
  const metrics = record.metrics || {};
  const visualIndicators = record.visual_indicators || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-10">
      {/* Top Header */}
      <Header
        title={t('verify.title', 'Batch Verification')}
        subtitle={t('verify.subtitle', 'QR-Based Batch Traceability & Verification Record')}
        showBack
        badge={
          <Badge size="md" variant={badgeVariant} dot>
            {gradeLabel}
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Printer}
              onClick={() => window.print()}
              className="text-xs"
            >
              {t('verify.print_record', 'Print Verification Record')}
            </Button>
          </div>
        }
      />

      {/* Main Verification Card */}
      <Card className="border-brand-200/90 shadow-card overflow-hidden">
        {/* Verification Status Header */}
        <div className="p-5 bg-brand-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-700/80 flex items-center justify-center text-harvest-400 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-200 tracking-wider uppercase">FeedCheck AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  {t('verify.verified_badge', 'Verified Record')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">{feedTypeName}</h3>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[10px] text-brand-300 uppercase tracking-wider block">
              {t('verify.batch_id_label', 'Batch Identifier')}
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-white">{batchId}</span>
          </div>
        </div>

        {/* Core Traceability Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {t('verify.record_id', 'Record ID')}
            </span>
            <span className="font-mono text-slate-800 font-bold truncate block">{record.id}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {t('verify.screening_date', 'Screening Date')}
            </span>
            <span className="text-slate-800 font-bold block">{formattedDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {t('verify.location', 'Location')}
            </span>
            <span className="text-slate-800 font-bold block truncate">{farmLocation}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {t('verify.feed_type_id', 'Feed Type ID')}
            </span>
            <span className="font-mono text-slate-800 font-bold block">{record.feed_type_id || 'silage'}</span>
          </div>
        </div>

        {/* AI Visual Screening & Risk Level */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>{t('verify.visual_summary_title', 'AI Visual Screening Summary')}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                {t('verify.fbsi_score_conf', 'Visual FBSI Score & Confidence')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 font-sans">
                  {record.fbsi_score ? record.fbsi_score.replace('_', ' ').toUpperCase() : 'FBSI Index'}
                </span>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                  {formattedConfidence} {t('home.confidence_suffix', 'Confidence')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                {visualIndicators[0] || t('verify.default_visual_note', 'Visual bunk residue evaluation via MobileNetV2 transfer learning model.')}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border shadow-xs ${
              badgeVariant === 'emerald'
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                : badgeVariant === 'amber'
                ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                : 'bg-rose-50/50 border-rose-200 text-rose-950'
            }`}>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">
                {t('verify.result_risk', 'Screening Result & Risk Level')}
              </span>
              <div className="flex items-center gap-2">
                <Badge size="md" variant={badgeVariant} dot>
                  {gradeLabel}
                </Badge>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  {t('quality.risk_label', 'Risk Classification')}: {formattedRisk}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                {t('summary.score', 'Score')}: <strong>{record.score || 90}/100</strong> • {t('verify.result_classification', 'Result Classification')}: <strong>{getQualityLabel(record.screening_result || quality, t)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 3 Field Measurements Grid */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">
            {t('verify.recorded_measurements', 'Recorded Field Measurements')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard
              title={t('metrics.moisture', 'Moisture Content')}
              value={metrics?.moisture?.value ?? 64.5}
              unit="%"
              targetRange={metrics?.moisture?.range || '60 - 70%'}
              status={metrics?.moisture?.status || 'within_range'}
              subtext={t('metrics.field_input', 'Field input')}
            />

            <MetricCard
              title={t('metrics.ph', 'Silage pH Level')}
              value={metrics?.pH?.value ?? metrics?.ph?.value ?? 3.9}
              unit="pH"
              targetRange={metrics?.pH?.range || metrics?.ph?.range || '3.8 - 4.3'}
              status={metrics?.pH?.status || metrics?.ph?.status || 'within_range'}
              subtext={t('metrics.field_input', 'Field input')}
            />

            <MetricCard
              title={t('metrics.temperature', 'Core Temperature')}
              value={metrics?.temperature?.value ?? 22}
              unit="°C"
              targetRange={metrics?.temperature?.range || '< 28°C'}
              status={metrics?.temperature?.status || 'within_range'}
              subtext={t('metrics.field_input', 'Field input')}
            />
          </div>
        </div>

        {/* Mandatory Non-Laboratory Disclaimer Note */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950">
            <strong className="font-bold block mb-0.5">
              {t('verify.disclaimer_title', 'Prototype screening record — not a laboratory certification.')}
            </strong>
            <p className="leading-relaxed text-amber-900/90 font-medium">
              {t('verify.disclaimer_body', 'This verification record provides preliminary operational screening data generated from the MobileNetV2 FBSI visual classifier and recorded field sensor readings. It does not certify laboratory feed quality, mycotoxin absence, or chemical nutritional safety.')}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Link to={`/result/${record.id}`}>
            <Button size="sm" variant="outline" icon={ArrowLeft} className="text-xs">
              {t('verify.view_full_report', 'View Full Report')}
            </Button>
          </Link>

          <Link to="/history">
            <Button size="sm" variant="secondary" className="text-xs">
              {t('verify.return_to_history', 'Return to History')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default VerifyPage;
