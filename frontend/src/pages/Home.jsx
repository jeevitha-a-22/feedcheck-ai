import React from 'react';
import { Link } from 'react-router-dom';
import { useFeedTest } from '../hooks/useFeedTest';
import { useLanguage } from '../context/LanguageContext';
import {
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  Activity,
  Cpu,
  Scan,
  Wheat,
  Droplets,
  Thermometer
} from 'lucide-react';
import Card, { CardHeader } from '../components/Card';
import Button from '../components/Button';
import TestHistoryCard from '../components/TestHistoryCard';
import { FARMER_TIPS } from '../utils/constants';

export const HomePage = () => {
  const { history, summary } = useFeedTest();
  const { t } = useLanguage();
  const recentTests = history.slice(0, 3);

  const total = summary?.total_tests || history.length;
  const avgScore = summary?.avg_score || 85;
  const goodBatches = summary?.distribution?.good || history.filter(t => t.quality === 'good').length;
  const goodPct = total > 0 ? Math.round((goodBatches / total) * 100) : 75;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Premium Agriculture + AI Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#043d2e] to-[#022119] text-white p-6 sm:p-8 lg:p-10 shadow-2xl shadow-brand-950/30 border border-brand-700/50">
        {/* Subtle Agricultural Topographic / Grid Contour Background */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="agri-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 0 24 Q 12 12 24 24 T 48 24" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
                <circle cx="24" cy="24" r="1.5" fill="#34d399" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#agri-pattern)" />
          </svg>
        </div>

        {/* Ambient Glowing Aura Blobs */}
        <div className="absolute top-0 right-1/4 -mt-12 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 w-80 h-80 rounded-full bg-harvest-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Core Message & CTA */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-800/80 border border-brand-500/40 text-brand-200 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-harvest-400" />
              <span>{t('home.hero_badge', 'AI Silage Quality Screening System')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t('home.hero_title', 'FeedCheck AI')}
            </h1>

            <p className="text-sm sm:text-base text-brand-100/90 leading-relaxed max-w-xl font-medium">
              {t('home.hero_text', 'Screen feed and silage quality in seconds. Upload a sample image and enter available field measurements to identify visible quality and spoilage indicators early.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/new-test">
                <Button
                  size="lg"
                  variant="harvest"
                  icon={PlusCircle}
                  className="font-bold shadow-lg shadow-harvest-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('home.start_new_test', 'Start New Test')}
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button
                  size="lg"
                  variant="ghost"
                  icon={HelpCircle}
                  className="bg-brand-800/70 hover:bg-brand-700/80 text-white border border-brand-500/40 backdrop-blur-md shadow-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('home.how_it_works_btn', 'How It Works')}
                </Button>
              </Link>
            </div>

            {/* Smart Farming Trust Highlights */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-[11px] text-brand-200/80 font-medium">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('home.mobilenet_vision', 'MobileNetV2 FBSI Vision')}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-brand-400/40" />
              <div className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-harvest-400" />
                <span>{t('home.on_farm_screening', 'On-Farm Quality Screening')}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-brand-400/40" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
                <span>{t('home.instant_advisory', 'Instant Advisory')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Smart Farm AI Scanner Graphic */}
          <div className="lg:col-span-5 hidden sm:flex flex-col items-center justify-center relative">
            {/* Top Floating Precision Tag */}
            <div className="absolute -top-3 right-4 z-20 animate-float-slow hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-xl text-emerald-200 text-xs font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-harvest-300" />
              <span>{t('home.smart_silage_ai', 'Smart Silage AI')}</span>
            </div>

            {/* AI Scanner Visual Panel */}
            <div className="w-full max-w-sm rounded-3xl bg-brand-950/70 border border-brand-400/30 p-4.5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Card Header Info */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-brand-100 uppercase tracking-wider text-[10px]">{t('home.ai_vision_scanner', 'AI Vision Scanner')}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-brand-800/80 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  {t('home.fbsi_active', 'FBSI Active')}
                </span>
              </div>

              {/* Sample Photo with Animated AI Scanning Beam */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-slate-900 border border-brand-500/30 shadow-inner group">
                <img
                  src="/assets/corn_silage_hero.jpg"
                  alt={t('home.corn_silage_batch', 'Whole-Crop Corn Silage Screening')}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-transparent to-black/40" />

                {/* Animated Horizontal Laser Scan Beam */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-ai-scan pointer-events-none" />

                {/* Scanning HUD Target Overlay */}
                <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400/80 pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400/80 pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400/80 pointer-events-none" />
                <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400/80 pointer-events-none" />

                {/* Subtitle tag on image */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Wheat className="w-3.5 h-3.5" /> {t('home.corn_silage_batch', 'Corn Silage Batch')}
                  </span>
                  <span className="text-harvest-400 font-mono">94% {t('home.confidence_suffix', 'Confidence')}</span>
                </div>
              </div>

              {/* Sensor & Fermentation Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-2 rounded-xl bg-brand-900/60 border border-brand-700/60">
                  <div className="flex items-center justify-center gap-1 text-sky-300 mb-0.5">
                    <Droplets className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{t('home.moisture', 'Moisture')}</span>
                  </div>
                  <span className="text-xs font-black text-white">65%</span>
                </div>

                <div className="p-2 rounded-xl bg-brand-900/60 border border-brand-700/60">
                  <div className="flex items-center justify-center gap-1 text-emerald-300 mb-0.5">
                    <Activity className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{t('home.acidity', 'Acidity')}</span>
                  </div>
                  <span className="text-xs font-black text-white">pH 3.9</span>
                </div>

                <div className="p-2 rounded-xl bg-brand-900/60 border border-brand-700/60">
                  <div className="flex items-center justify-center gap-1 text-amber-300 mb-0.5">
                    <Thermometer className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{t('home.core_temp', 'Core Temp')}</span>
                  </div>
                  <span className="text-xs font-black text-white">22°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="sm" className="bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('home.total_tests', 'Total Tests Screened')}</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-sans">
              {total}
            </span>
            <span className="text-xs font-semibold text-emerald-600">{t('home.batches_evaluated', 'Batches Evaluated')}</span>
          </div>
        </Card>

        <Card padding="sm" className="bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('home.avg_quality', 'Average Quality Index')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-sans">
              {avgScore}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 100 FQI</span>
          </div>
        </Card>

        <Card padding="sm" className="bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('home.optimal_fermentation', 'Optimal Fermentation')}</span>
            <div className="w-8 h-8 rounded-lg bg-harvest-50 text-harvest-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-sans">
              {goodPct}%
            </span>
            <span className="text-xs font-semibold text-brand-600">{t('home.grade_a_silage', 'Grade A Silage')}</span>
          </div>
        </Card>
      </div>

      {/* Recent Tests Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('home.recent_records', 'Recent Screening Records')}</h2>
            <p className="text-xs text-slate-500">{t('home.recent_subtitle', 'Latest feed tests from your bunker and bag lots')}</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>{t('home.view_all', 'View All')} ({history.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTests.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {recentTests.map((test) => (
              <TestHistoryCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="text-sm text-slate-500">{t('home.no_tests', 'No tests performed yet.')}</p>
            <Link to="/new-test" className="mt-3 inline-block">
              <Button size="sm">{t('home.start_first_test', 'Start First Test')}</Button>
            </Link>
          </Card>
        )}
      </div>

      {/* How It Works Banner Card */}
      <Link to="/how-it-works" className="block group">
        <Card className="bg-gradient-to-r from-brand-50 via-white to-harvest-50/50 border-brand-200/70 hover:border-brand-400 hover:shadow-card transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">
                  {t('home.learn_banner_title', 'New to FeedCheck AI? Learn How It Works')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('home.learn_banner_sub', 'See how image scans and field measurements generate screening results and practical farmer advisory.')}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:border-brand-300 transition-colors shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </Link>

      {/* Farmer Advice & Silage Tips */}
      <Card className="bg-gradient-to-r from-harvest-50/50 via-white to-brand-50/30 border-harvest-200/60">
        <CardHeader
          icon={Lightbulb}
          title={t('home.guidelines_title', 'On-Farm Silage Management Guidelines')}
          subtitle={t('home.guidelines_sub', 'Essential practices to preserve nutritional density and prevent aerobic spoilage.')}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {FARMER_TIPS.map((tip) => {
            const tipTitle = t(`home.tips.tip_${tip.id}_title`, tip.title);
            const tipCat = t(`home.tips.tip_${tip.id}_cat`, tip.category);
            const tipDesc = t(`home.tips.tip_${tip.id}_desc`, tip.tip);

            return (
              <div key={tip.id} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-harvest-700 bg-harvest-100 px-2 py-0.5 rounded-md">
                  {tipCat}
                </span>
                <h4 className="font-bold text-slate-800 text-sm mt-2 mb-1">{tipTitle}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{tipDesc}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
