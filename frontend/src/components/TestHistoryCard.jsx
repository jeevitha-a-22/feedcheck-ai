import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, Droplets, TestTubes, Thermometer, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Badge from './Badge';
import { formatDate, getQualityVariant, getQualityLabel } from '../utils/formatters';

export const TestHistoryCard = ({ test, onDelete }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const quality = test.quality || 'good';
  const gradeLabel = getQualityLabel(quality, t);
  const badgeVariant = getQualityVariant(quality);
  const formattedDate = formatDate(test.timestamp);

  const rawFeedType = test.feed_type || test.feedTypeName || 'Silage Sample';
  const feedTypeName = test.feed_type_id ? t(`feed_types.${test.feed_type_id}`, rawFeedType) : rawFeedType;

  const moistureVal = test.metrics?.moisture?.value ?? 64.5;
  const phVal = test.metrics?.pH?.value ?? test.metrics?.ph?.value ?? 3.9;
  const tempVal = test.metrics?.temperature?.value ?? 22;

  return (
    <div
      onClick={() => navigate(`/result/${test.id}`)}
      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-400 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Main Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
            <img
              src={test.image_url || test.imageUrl || '/assets/corn_silage_hero.jpg'}
              alt={feedTypeName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {test.score || 90}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">
                {feedTypeName}
              </h4>
              <Badge size="sm" variant={badgeVariant} dot>
                {gradeLabel}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {test.farm_location || test.farmLocation || 'Main Bunker'}
              </span>
              <span className="font-mono text-slate-400">
                {test.batch_id || test.batchId}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Key Metric Badges & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>{moistureVal}%</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
              <TestTubes className="w-3.5 h-3.5 text-brand-600" />
              <span>pH {phVal}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span>{tempVal}°C</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/verify/${test.id}`);
              }}
              title="View Batch Verification QR"
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryCard;
