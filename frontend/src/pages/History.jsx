import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFeedTest } from '../hooks/useFeedTest';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import TestHistoryCard from '../components/TestHistoryCard';
import { Search, Filter, PlusCircle, Inbox } from 'lucide-react';

export const HistoryPage = () => {
  const { history, deleteTest } = useFeedTest();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('ALL');

  const filteredHistory = history.filter((item) => {
    // Search filter
    const searchTarget = `${item.feed_type || ''} ${item.batch_id || ''} ${item.farm_location || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());

    // Quality filter
    const itemQuality = (item.quality || 'good').toLowerCase();
    const matchesQuality =
      selectedQuality === 'ALL' || itemQuality === selectedQuality.toLowerCase();

    return matchesSearch && matchesQuality;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <Header
        title={t('history.title', 'Screening History')}
        subtitle={`${t('history.subtitle_prefix', 'Track and manage all')} ${history.length} ${t('history.subtitle_suffix', 'silage quality evaluations.')}`}
        action={
          <Link to="/new-test">
            <Button size="sm" icon={PlusCircle}>
              {t('nav.new_test', 'New Test')}
            </Button>
          </Link>
        }
      />

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('history.search_placeholder', 'Search by feed type, batch ID, or bunker location...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {t('history.grade_filter', 'Grade:')}
          </span>
          {[
            { id: 'ALL', label: t('history.all_grades', 'All Grades') },
            { id: 'good', label: t('quality.grade_a', 'Grade A (Optimal)') },
            { id: 'moderate', label: t('quality.grade_b', 'Grade B (Acceptable)') },
            { id: 'poor', label: t('quality.grade_c', 'Grade C (Caution)') }
          ].map((grade) => (
            <button
              key={grade.id}
              onClick={() => setSelectedQuality(grade.id)}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedQuality === grade.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {grade.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((test) => (
            <TestHistoryCard
              key={test.id}
              test={test}
              onDelete={deleteTest}
            />
          ))
        ) : (
          <Card className="text-center py-12">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">
              {t('history.no_match_title', 'No Tests Match Your Filter')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedQuality !== 'ALL'
                ? t('history.no_match_desc', 'Try resetting the search query or grade filter.')
                : t('history.no_tests_yet', 'You have not completed any silage tests yet.')}
            </p>
            {searchTerm || selectedQuality !== 'ALL' ? (
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedQuality('ALL');
                }}
              >
                {t('history.reset_filters', 'Reset Filters')}
              </Button>
            ) : (
              <Link to="/new-test" className="mt-4 inline-block">
                <Button size="sm">{t('home.start_first_test', 'Start First Test')}</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
