import React from 'react';
import Input from './Input';
import Select from './Select';
import { useLanguage } from '../context/LanguageContext';
import { STORAGE_TYPES, ODOR_PROFILES, COLOR_PROFILES } from '../utils/constants';
import { Activity, Thermometer, Droplets, TestTubes, Scissors, Wind, Palette, Warehouse } from 'lucide-react';

export const SensorInputs = ({
  draft,
  updateDraft,
  selectedFeedType
}) => {
  const { t } = useLanguage();

  const storageOptions = [
    { value: 'Bunker Silo', label: t('sensor_inputs.storage_types.bunker_silo', 'Bunker Silo') },
    { value: 'Drive-over Silage Pile', label: t('sensor_inputs.storage_types.drive_over_pile', 'Drive-over Silage Pile') },
    { value: 'Ag-Bag / Silo Tube', label: t('sensor_inputs.storage_types.ag_bag', 'Ag-Bag / Silo Tube') },
    { value: 'Wrapped Round Bales', label: t('sensor_inputs.storage_types.wrapped_bales', 'Wrapped Round Bales') },
    { value: 'Concrete Stave / Tower Silo', label: t('sensor_inputs.storage_types.tower_silo', 'Concrete Stave / Tower Silo') }
  ];

  const odorOptions = ODOR_PROFILES.map((prof) => ({
    value: prof.value,
    label: t(`sensor_inputs.odor_profiles.${prof.value}`, prof.label)
  }));

  const colorOptions = COLOR_PROFILES.map((prof) => ({
    value: prof.value,
    label: t(`sensor_inputs.color_profiles.${prof.value}`, prof.label)
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <span>{t('sensor_inputs.available_inputs_title', 'Available Sensor & Sample Inputs')}</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('sensor_inputs.available_inputs_desc', 'Input moisture, pH meter readings, and temperature from your silage probe.')}
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          {t('sensor_inputs.target_moisture', 'Target')}: {selectedFeedType?.idealMoisture} {t('sensor_inputs.moisture_unit', 'moisture')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Moisture Input */}
        <Input
          label={t('sensor_inputs.moisture_label', 'Moisture Content')}
          id="moisture"
          type="number"
          step="0.1"
          min="30"
          max="85"
          value={draft.moisture}
          onChange={(e) => updateDraft('moisture', e.target.value)}
          placeholder="65.0"
          unit="%"
          icon={Droplets}
          helperText={`${t('sensor_inputs.ideal', 'Ideal')}: ${selectedFeedType?.idealMoisture || '62-68%'}`}
          required
        />

        {/* pH Level Input */}
        <Input
          label={t('sensor_inputs.ph_label', 'Silage pH Level')}
          id="pH"
          type="number"
          step="0.05"
          min="3.0"
          max="8.0"
          value={draft.pH}
          onChange={(e) => updateDraft('pH', e.target.value)}
          placeholder="3.9"
          unit="pH"
          icon={TestTubes}
          helperText={`${t('sensor_inputs.ideal', 'Ideal')}: ${selectedFeedType?.idealPH || '3.8-4.2'}`}
          required
        />

        {/* Temperature Input */}
        <Input
          label={t('sensor_inputs.temp_label', 'Core Temperature')}
          id="temperature"
          type="number"
          step="0.5"
          min="5"
          max="70"
          value={draft.temperature}
          onChange={(e) => updateDraft('temperature', e.target.value)}
          placeholder="22"
          unit="°C"
          icon={Thermometer}
          helperText={t('sensor_inputs.temp_helper', 'Normal: < 28°C (>35°C heating)')}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Theoretical Cut Length */}
        <Input
          label={t('sensor_inputs.cut_length_label', 'Cut / Chop Length')}
          id="cutLength"
          type="number"
          value={draft.cutLength}
          onChange={(e) => updateDraft('cutLength', e.target.value)}
          placeholder="15"
          unit="mm"
          icon={Scissors}
          helperText={t('sensor_inputs.cut_length_helper', 'Theoretical length of cut (TLC)')}
        />

        {/* Storage Type */}
        <Select
          label={t('sensor_inputs.storage_label', 'Silo / Storage Structure')}
          id="storage"
          value={draft.storage}
          onChange={(e) => updateDraft('storage', e.target.value)}
          options={storageOptions}
          icon={Warehouse}
          helperText={t('sensor_inputs.storage_helper', 'Storage system used on farm')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Odor Observation */}
        <Select
          label={t('sensor_inputs.odor_label', 'Odor / Aroma Observation')}
          id="odor"
          value={draft.odor}
          onChange={(e) => updateDraft('odor', e.target.value)}
          options={odorOptions}
          icon={Wind}
          helperText={t('sensor_inputs.odor_helper', 'Fermentation odor characteristics')}
        />

        {/* Color Observation */}
        <Select
          label={t('sensor_inputs.color_label', 'Color Tone & Visual Traits')}
          id="color"
          value={draft.color}
          onChange={(e) => updateDraft('color', e.target.value)}
          options={colorOptions}
          icon={Palette}
          helperText={t('sensor_inputs.color_helper', 'Color tone & visible mold appearance')}
        />
      </div>
    </div>
  );
};

export default SensorInputs;
