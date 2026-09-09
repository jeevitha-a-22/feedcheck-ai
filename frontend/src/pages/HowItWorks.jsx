import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { Camera, Activity, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage = () => {
  const { t } = useLanguage();

  const steps = [
    {
      step: '01',
      icon: Camera,
      title: t('how_it_works.step1_title', '1. Snap or Upload Feed Sample'),
      description: t('how_it_works.step1_desc', 'FeedCheck AI analyzes visible texture, color variation, and potential spoilage indicators from the silage surface photo using our MobileNetV2 FBSI model.'),
      color: 'bg-brand-50 text-brand-700 border-brand-200'
    },
    {
      step: '02',
      icon: Activity,
      title: t('how_it_works.step2_title', '2. Enter Available Sensor Readings'),
      description: t('how_it_works.step2_desc', 'Enter real-time field measurements including Moisture (%), pH level, and core temperature (°C) to evaluate fermentation stability.'),
      color: 'bg-harvest-50 text-harvest-700 border-harvest-200'
    },
    {
      step: '03',
      icon: ShieldCheck,
      title: t('how_it_works.step3_title', '3. Instant Quality Grade & Advisory'),
      description: t('how_it_works.step3_desc', 'Receive an immediate screening result with quality grade, AI confidence, visual indicators, risk assessment, and practical farmer advisory.'),
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <Header
        title={t('how_it_works.title', 'How FeedCheck AI Works')}
        subtitle={t('how_it_works.subtitle', '3 simple steps to screen feed quality, identify spoilage risks early, and support herd management.')}
        showBack
      />

      {/* Main Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 font-sans">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-brand-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('how_it_works.designed_for_field', 'Designed for Field Screening')}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Benefits Card */}
      <Card className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-700/60 border border-brand-500/30 text-xs font-semibold text-brand-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-harvest-400" />
            <span>{t('how_it_works.field_screening_value', 'Field Screening Value')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            {t('how_it_works.why_title', 'Why Screen Silage Regularly?')}
          </h2>
          <p className="text-sm text-brand-100/90 leading-relaxed mb-6">
            {t('how_it_works.why_desc', 'Early identification of visible spoilage indicators can support better storage management and help farmers decide when further testing may be needed.')}
          </p>

          <Link to="/new-test">
            <Button size="lg" variant="harvest" icon={ArrowRight}>
              {t('how_it_works.try_now', 'Try Feed Screening Now')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default HowItWorksPage;
