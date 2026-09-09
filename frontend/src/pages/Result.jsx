import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFeedTest } from '../hooks/useFeedTest';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ResultCard from '../components/ResultCard';
import VisualIndicators from '../components/VisualIndicators';
import WhyEvidenceSection from '../components/WhyEvidenceSection';
import AdvisoryCard from '../components/AdvisoryCard';
import MetricCard from '../components/MetricCard';
import QRCodeView from '../components/QRCodeView';
import { formatDate, getQualityVariant, getQualityLabel } from '../utils/formatters';
import {
  Save,
  RotateCcw,
  Printer,
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Check
} from 'lucide-react';

export const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentResult, getTestById, saveResult, isSaving, history } = useFeedTest();
  
  const [testData, setTestData] = useState(() => {
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
  const [loading, setLoading] = useState(!testData);
  const [isSaved, setIsSaved] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      // 1. If testData is already loaded and matches current id, stop loading
      if (testData && (!id || testData.id === id)) {
        setLoading(false);
        return;
      }

      // 2. If currentResult in context matches id
      if (currentResult && (!id || currentResult.id === id)) {
        if (isMounted) {
          setTestData(currentResult);
          setLoading(false);
        }
        return;
      }

      // 3. Otherwise fetch via getTestById
      if (id) {
        setLoading(true);
        try {
          const item = await getTestById(id);
          if (isMounted) {
            setTestData(item || currentResult || null);
          }
        } catch (e) {
          console.error('[ResultPage] Error loading test:', e);
          if (isMounted && currentResult) {
            setTestData(currentResult);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      } else if (currentResult) {
        if (isMounted) {
          setTestData(currentResult);
          setLoading(false);
        }
      } else {
        navigate('/');
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, currentResult, getTestById, navigate]);

  useEffect(() => {
    if (testData?.id && history?.some(item => item.id === testData.id)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [testData, history]);

  const handleSave = async () => {
    if (testData) {
      await saveResult(testData);
      setIsSaved(true);
      setSaveSuccessMessage(t('result.saved_toast', 'Test record saved to history successfully!'));
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fadeIn">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <h3 className="font-bold text-slate-800 text-lg">
          {t('result.fetching_result', 'Fetching Screening Result...')}
        </h3>
        <p className="text-xs text-slate-500">
          {t('result.evaluating_metrics', 'Evaluating visual indicators and available field measurements')}
        </p>
      </div>
    );
  }

  if (!testData) {
    return (
      <Card className="text-center py-12 max-w-md mx-auto animate-fadeIn">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-900 text-lg">{t('result.no_results_title', 'No Screening Results Found')}</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {t('result.no_results_sub', 'Please run a new test or select an existing record from history.')}
        </p>
        <Link to="/new-test">
          <Button>{t('home.start_new_test', 'Start New Test')}</Button>
        </Link>
      </Card>
    );
  }

  const quality = testData.quality || 'good';
  const score = testData.score || (quality === 'good' ? 92 : quality === 'moderate' ? 76 : 52);
  const confidence = testData.confidence ?? 0.87;
  const risk_level = testData.risk_level || (quality === 'good' ? 'low' : quality === 'moderate' ? 'medium' : 'high');
  const rawFeedType = testData.feed_type || testData.feedTypeName || 'Silage Sample';
  const feedTypeName = testData.feed_type_id ? t(`feed_types.${testData.feed_type_id}`, rawFeedType) : rawFeedType;
  const farmLocation = testData.farm_location || testData.farmLocation || 'Main Bunker Lot';
  const batchId = testData.batch_id || testData.batchId || 'BATCH-2026';
  const imageUrl = testData.image_url || testData.imageUrl;
  const formattedDate = formatDate(testData.timestamp);
  const gradeLabel = getQualityLabel(quality, t);
  const badgeVariant = getQualityVariant(quality);

  const metrics = testData.metrics || {};
  const visualIndicators = testData.visual_indicators || [];
  const evidence = testData.evidence || [];
  const advisory = testData.advisory || '';
  const flags = testData.flags || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <Header
        title={`${feedTypeName} ${t('result.title_suffix', 'Screening Result')}`}
        subtitle={`${t('result.subtitle_prefix', 'AI Visual Screening completed on')} ${formattedDate}`}
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
              className="hidden sm:inline-flex text-xs"
            >
              {t('result.print', 'Print')}
            </Button>
            <Button
              size="sm"
              variant={isSaved ? 'outline' : 'primary'}
              icon={isSaved ? Check : Save}
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isSaved}
              className="text-xs"
            >
              {isSaved ? t('result.saved_to_history', 'Saved to History') : t('result.save_test', 'Save Test')}
            </Button>
          </div>
        }
      />

      {/* Save Success Toast Banner */}
      {saveSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between gap-3 animate-fadeIn text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{saveSuccessMessage}</span>
          </div>
          <Link to="/history" className="underline hover:text-emerald-100">
            {t('result.view_in_history', 'View in History →')}
          </Link>
        </div>
      )}

      {/* Meta Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="font-bold text-slate-800">{farmLocation}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-mono text-slate-700 font-bold">{batchId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 1. Overall Result Card with Score, AI Confidence & Risk Assessment */}
      <ResultCard
        quality={quality}
        score={score}
        confidence={confidence}
        risk_level={risk_level}
        advisorySummary={typeof advisory === 'string' ? advisory : advisory.summary}
        flags={flags}
      />

      {/* 2. Key Sensor & Field Measurements Grid */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-3">
          {t('result.field_measurements_title', 'Field Measurements (Screening Inputs)')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* 3. Visual Indicators Card */}
      <VisualIndicators
        imageUrl={imageUrl}
        visualIndicators={visualIndicators}
      />

      {/* 4. Why? / Evidence Section */}
      <WhyEvidenceSection
        evidence={evidence}
        quality={quality}
      />

      {/* 5. Farmer Advisory & Feeding Guidelines */}
      <AdvisoryCard
        advisory={advisory}
      />

      {/* 6. QR-Based Batch Traceability & Verification Section */}
      <QRCodeView
        testId={testData.id}
        batchId={batchId}
        feedType={feedTypeName}
        timestamp={testData.timestamp}
      />

      {/* Bottom Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <Link to="/new-test" className="w-full sm:w-auto">
          <Button variant="outline" icon={RotateCcw} className="w-full sm:w-auto">
            {t('result.test_another', 'Test Another Sample')}
          </Button>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant={isSaved ? 'outline' : 'primary'}
            icon={isSaved ? Check : Save}
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaved}
            className="w-full sm:w-auto"
          >
            {isSaved ? t('result.saved_in_history', 'Saved in History') : t('result.save_to_history', 'Save Test to History')}
          </Button>
          <Link to="/history" className="w-full sm:w-auto">
            <Button variant="secondary" icon={ArrowRight} className="w-full sm:w-auto">
              {t('result.go_to_history', 'Go to History')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
