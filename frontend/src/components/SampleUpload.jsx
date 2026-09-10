import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, X, Sparkles, ImageOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SampleUpload = ({
  imagePreviewUrl,
  onImageSelected,
  onImageRemoved,
  className = ''
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);

  const samplePresets = [
    {
      label: `${t('feed_types.corn_silage', 'Corn Silage')} (${t('metrics.optimal', 'Optimal')})`,
      url: '/assets/corn_silage.jpg',
      type: 'corn_silage'
    },
    {
      label: `${t('feed_types.grass_silage', 'Grass Silage')} (${t('metrics.caution', 'Caution')})`,
      url: '/assets/grass_silage.jpg',
      type: 'grass_silage'
    },
    {
      label: t('feed_types.alfalfa_haylage', 'Alfalfa Haylage'),
      url: '/assets/alfalfa_haylage.jpg',
      type: 'alfalfa_haylage'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgLoadError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImgLoadError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-brand-600" />
          <span>{t('sample_upload.title', 'Feed / Silage Sample Image')}</span>
        </label>
        {imagePreviewUrl && (
          <button
            type="button"
            onClick={() => {
              setImgLoadError(false);
              onImageRemoved();
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> {t('sample_upload.remove_photo', 'Remove Image')}
          </button>
        )}
      </div>

      {imagePreviewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-brand-500 bg-slate-900 group shadow-md aspect-video max-h-64 sm:max-h-72">
          {!imgLoadError ? (
            <img
              src={imagePreviewUrl}
              alt="Sample preview"
              onError={() => setImgLoadError(true)}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300">
              <ImageOff className="w-10 h-10 text-slate-500 mb-2" />
              <p className="text-xs font-semibold">{t('sample_upload.preview_unavailable', 'Feed sample preview unavailable')}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">
                {t('sample_upload.photo_ready', 'Sample Photo Ready for AI Scan')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-semibold transition-colors"
            >
              {t('sample_upload.change_photo', 'Change Photo')}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-brand-400 bg-slate-50 hover:bg-slate-100/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-1">
            {t('sample_upload.upload_title', 'Upload Feed Photo or Capture with Camera')}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
            {t('sample_upload.upload_desc', 'Capture a representative core or freshly faced silage sample in natural light.')}
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <Camera className="w-3.5 h-3.5 text-brand-600" />
            <span>{t('sample_upload.select_file', 'Select Image File')}</span>
          </div>
        </div>
      )}

      {/* Quick sample photo presets for demo convenience */}
      <div className="pt-1">
        <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-harvest-500" />
          <span>{t('sample_upload.or_demo', 'Or choose a demo sample:')}</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setImgLoadError(false);
                onImageSelected(null, preset.url, preset.type);
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 text-left transition-all group"
            >
              <img
                src={preset.url}
                alt={preset.label}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-brand-700">
                  {preset.label}
                </p>
                <p className="text-[10px] text-slate-400">{t('sample_upload.click_to_use', 'Click to use')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SampleUpload;
