import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedTest } from '../hooks/useFeedTest';
import { useLanguage } from '../context/LanguageContext';
import { FEED_TYPES } from '../utils/constants';
import Header from '../components/Header';
import Card, { CardHeader } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import SampleUpload from '../components/SampleUpload';
import SensorInputs from '../components/SensorInputs';
import { Sparkles, Check, Wheat, RotateCcw, MapPin, Tag, AlertCircle, Loader2 } from 'lucide-react';

export const NewTestPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    draft,
    updateDraft,
    resetDraft,
    selectedFeedType,
    runAnalysis,
    isAnalyzing
  } = useFeedTest();

  const [formError, setFormError] = useState('');

  const handleImageSelected = (file, previewUrl, presetType) => {
    updateDraft('imageFile', file);
    updateDraft('imagePreviewUrl', previewUrl);
    if (presetType) {
      updateDraft('feed_type_id', presetType);
    }
    setFormError('');
  };

  const handleImageRemoved = () => {
    updateDraft('imageFile', null);
    updateDraft('imagePreviewUrl', '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!draft.feed_type_id) {
      setFormError(t('new_test.error_feed_type', 'Please select a feed or silage type.'));
      return;
    }

    if (!draft.imagePreviewUrl && !draft.imageFile) {
      setFormError(t('new_test.error_image', 'Please upload a sample image.'));
      return;
    }

    if (!draft.moisture || draft.moisture.toString().trim() === '' || isNaN(parseFloat(draft.moisture)) || parseFloat(draft.moisture) <= 0) {
      setFormError(t('new_test.error_moisture', 'Please enter moisture content.'));
      return;
    }

    if (!draft.pH || draft.pH.toString().trim() === '' || isNaN(parseFloat(draft.pH)) || parseFloat(draft.pH) <= 0) {
      setFormError(t('new_test.error_ph', 'Please enter silage pH.'));
      return;
    }

    if (!draft.temperature || draft.temperature.toString().trim() === '' || isNaN(parseFloat(draft.temperature)) || parseFloat(draft.temperature) <= 0) {
      setFormError(t('new_test.error_temp', 'Please enter core temperature.'));
      return;
    }

    try {
      const result = await runAnalysis();
      if (result && result.id) {
        navigate(`/result/${result.id}`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to analyze sample. Please check your backend connection and inputs.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <Header
        title={t('new_test.title', 'New Silage Screening Test')}
        subtitle={t('new_test.subtitle', 'Follow the step-by-step screening flow to evaluate fermentation and feed quality.')}
        showBack
        action={
          <Button
            size="sm"
            variant="ghost"
            icon={RotateCcw}
            onClick={resetDraft}
            className="text-xs"
            disabled={isAnalyzing}
          >
            {t('new_test.reset_form', 'Reset Form')}
          </Button>
        }
      />

      {/* Error state banner */}
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Analysis Loading State Banner */}
      {isAnalyzing && (
        <div className="p-6 rounded-3xl bg-brand-900 text-white shadow-xl shadow-brand-950/20 border border-brand-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 flex items-center justify-center shrink-0">
              <Loader2 className="w-6 h-6 animate-spin text-harvest-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-base sm:text-lg">{t('new_test.processing_title', 'Analyzing Feed & Sensor Metrics...')}</h4>
              <p className="text-xs text-brand-200 mt-0.5">
                {t('new_test.processing_sub', 'Evaluating image traits, moisture equilibrium & pH fermentation index.')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-800 text-brand-200 border border-brand-600">
            Processing
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Feed Type */}
        <Card>
          <CardHeader
            icon={Wheat}
            title={t('new_test.step1_title', '1. Select Feed / Silage Sample Type')}
            subtitle={t('new_test.step1_sub', 'Choose the specific crop forage or mixed ration you are testing.')}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEED_TYPES.map((type) => {
              const isSelected = draft.feed_type_id === type.id;
              const typeName = t(`feed_types.${type.id}`, type.name);
              return (
                <div
                  key={type.id}
                  onClick={() => {
                    updateDraft('feed_type_id', type.id);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/60 shadow-sm ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{typeName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{t(`feed_types.${type.category.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, type.category)}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-semibold">
                      <span>{t('metrics.target', 'Target')}: {type.idealMoisture}</span>
                      <span>pH {type.idealPH}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step 2: Upload Feed/Silage Image */}
        <Card>
          <SampleUpload
            imagePreviewUrl={draft.imagePreviewUrl}
            onImageSelected={handleImageSelected}
            onImageRemoved={handleImageRemoved}
          />
        </Card>

        {/* Step 3: Sensor & Physical Sample Information */}
        <Card>
          <SensorInputs
            draft={draft}
            updateDraft={updateDraft}
            selectedFeedType={selectedFeedType}
          />
        </Card>

        {/* Step 4: Batch & Farm Identification */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('new_test.farm_location_label', 'Farm / Bunker Location')}
              id="farm_location"
              value={draft.farm_location}
              onChange={(e) => updateDraft('farm_location', e.target.value)}
              placeholder={t('new_test.farm_location_placeholder', 'e.g. North Bunker Lot 1')}
              icon={MapPin}
              helperText={t('new_test.farm_location_helper', 'Specific silo, bag, or pit identifier')}
            />
            <Input
              label={t('new_test.batch_id_label', 'Batch / Lot ID (Optional)')}
              id="batch_id"
              value={draft.batch_id}
              onChange={(e) => updateDraft('batch_id', e.target.value)}
              placeholder={t('new_test.batch_id_placeholder', 'e.g. BATCH-2026-08')}
              icon={Tag}
              helperText={t('new_test.batch_id_helper', 'Auto-generated if left blank')}
            />
          </div>
        </Card>

        {/* Final CTA: Analyze with AI */}
        <div className="pt-2 pb-6">
          <Button
            type="submit"
            size="xl"
            variant="primary"
            icon={Sparkles}
            isLoading={isAnalyzing}
            disabled={isAnalyzing}
            className="w-full text-base sm:text-lg font-bold shadow-lg shadow-brand-600/30"
          >
            {isAnalyzing ? t('new_test.analyzing_button', 'Analyzing Sample with AI...') : t('new_test.analyze_button', 'Analyze with AI')}
          </Button>
          <p className="text-center text-xs text-slate-400 mt-2 font-medium">
            {t('new_test.analyze_helper', 'AI evaluates moisture equilibrium, fermentation traits, and spoilage indicators.')}
          </p>
        </div>
      </form>
    </div>
  );
};

export default NewTestPage;

