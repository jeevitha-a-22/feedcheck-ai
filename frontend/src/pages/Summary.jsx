import React from 'react';
import { Link } from 'react-router-dom';
import { useFeedTest } from '../hooks/useFeedTest';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Card, { CardHeader } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { getQualityVariant, getQualityLabel } from '../utils/formatters';
import {
  Warehouse,
  PieChart,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export const SummaryPage = () => {
  const { history, summary } = useFeedTest();
  const { t } = useLanguage();

  const total = summary?.total_tests || history.length || 1;
  const goodCount = summary?.distribution?.good ?? history.filter(t => t.quality === 'good').length;
  const moderateCount = summary?.distribution?.moderate ?? history.filter(t => t.quality === 'moderate').length;
  const poorCount = summary?.distribution?.poor ?? history.filter(t => t.quality === 'poor').length;

  const pctGood = Math.round((goodCount / total) * 100);
  const pctModerate = Math.round((moderateCount / total) * 100);
  const pctPoor = Math.round((poorCount / total) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <Header
        title={t('summary.title', 'Silage Quality Analytics & Summary')}
        subtitle={t('summary.subtitle', 'Farm-wide quality trends, moisture distribution, and bunker health overview.')}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={FileSpreadsheet}
              onClick={() => alert(t('summary.export_alert', 'Exporting Farm Silage Analytics Report (.CSV)...'))}
              className="text-xs"
            >
              {t('summary.export_csv', 'Export CSV')}
            </Button>
            <Link to="/new-test">
              <Button size="sm" icon={PlusCircle} className="text-xs">
                {t('nav.new_test', 'New Test')}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm" className="bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('summary.total_tests', 'Total Tests')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 font-sans">{total}</span>
            <span className="text-xs text-slate-400">{t('summary.batches', 'batches')}</span>
          </div>
        </Card>

        <Card padding="sm" className="bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('summary.avg_quality_index', 'Avg Quality Index')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-brand-700 font-sans">{summary?.avg_score || 85}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </Card>

        <Card padding="sm" className="bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('summary.avg_moisture', 'Avg Moisture')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-sky-600 font-sans">{summary?.avg_moisture || '64.5'}</span>
            <span className="text-xs text-slate-400">%</span>
          </div>
        </Card>

        <Card padding="sm" className="bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('summary.avg_ph', 'Avg Silage pH')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-600 font-sans">{summary?.avg_ph || '4.10'}</span>
            <span className="text-xs text-slate-400">pH</span>
          </div>
        </Card>
      </div>

      {/* Quality Grade Distribution Card */}
      <Card>
        <CardHeader
          icon={PieChart}
          title={t('summary.grade_distribution', 'Quality Grade Distribution')}
          subtitle={t('summary.distribution_sub', 'Proportion of tested silage meeting optimal, acceptable, or high-risk preservation benchmarks.')}
        />

        {/* Stacked Progress Bar */}
        <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200">
          <div
            style={{ width: `${pctGood}%` }}
            className="bg-emerald-500 rounded-l-full h-full transition-all duration-500"
            title={`Grade A: ${pctGood}%`}
          />
          <div
            style={{ width: `${pctModerate}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Grade B: ${pctModerate}%`}
          />
          <div
            style={{ width: `${pctPoor}%` }}
            className="bg-rose-500 rounded-r-full h-full transition-all duration-500"
            title={`Grade C: ${pctPoor}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">{t('quality.grade_a', 'Grade A (Optimal)')}</span>
              <Badge size="sm" variant="emerald">{goodCount} {t('summary.batches', 'Batches')}</Badge>
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700 font-sans">{pctGood}%</div>
            <p className="text-[11px] text-emerald-800/80 mt-1">{t('summary.grade_a_desc', 'Excellent lactic fermentation, ready for lactating herd.')}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">{t('quality.grade_b', 'Grade B (Acceptable)')}</span>
              <Badge size="sm" variant="amber">{moderateCount} {t('summary.batches', 'Batches')}</Badge>
            </div>
            <div className="mt-2 text-2xl font-black text-amber-700 font-sans">{pctModerate}%</div>
            <p className="text-[11px] text-amber-800/80 mt-1">{t('summary.grade_b_desc', 'Mild aerobic warming or moisture variation. Monitor face.')}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900">{t('quality.grade_c', 'Grade C (Caution)')}</span>
              <Badge size="sm" variant="rose">{poorCount} {t('summary.batches', 'Batches')}</Badge>
            </div>
            <div className="mt-2 text-2xl font-black text-rose-700 font-sans">{pctPoor}%</div>
            <p className="text-[11px] text-rose-800/80 mt-1">{t('summary.grade_c_desc', 'Elevated spoilage risk. Restrict feeding to high-risk cows.')}</p>
          </div>
        </div>
      </Card>

      {/* Silo Storage Inventory Breakdown */}
      <Card>
        <CardHeader
          icon={Warehouse}
          title={t('summary.storage_status', 'Bunker & Lot Health Status')}
          subtitle={t('summary.storage_sub', 'Summary of storage units evaluated during this testing cycle.')}
        />

        <div className="divide-y divide-slate-100">
          {history.map((test) => {
            const q = test.quality || 'good';
            const gradeText = getQualityLabel(q, t);
            const badgeColor = getQualityVariant(q);
            const rawFeed = test.feed_type || test.feedTypeName || 'Silage Sample';
            const feedName = test.feed_type_id ? t(`feed_types.${test.feed_type_id}`, rawFeed) : rawFeed;
            const storageName = test.storage ? t(`sensor_inputs.storage_types.${test.storage.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, test.storage) : t('sensor_inputs.storage_types.bunker_silo', 'Bunker Silo');

            return (
              <div key={test.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {(test.batch_id || test.batchId || '01').slice(-3)}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{test.farm_location || test.farmLocation || 'Main Bunker'}</h5>
                    <p className="text-xs text-slate-500">{feedName} • {storageName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-700 hidden sm:inline">
                    {t('summary.score', 'Score')}: {test.score || 90}/100
                  </span>
                  <Badge size="sm" variant={badgeColor}>
                    {gradeText}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default SummaryPage;
