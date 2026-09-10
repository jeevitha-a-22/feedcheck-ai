import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { FEED_TYPES } from '../utils/constants';

export const TestContext = createContext(null);
export const FeedTestContext = TestContext;

const DEFAULT_DRAFT = {
  feed_type_id: '',
  batch_id: '',
  farm_location: '',
  moisture: '',
  pH: '',
  temperature: '',
  cutLength: '',
  odor: '',
  color: '',
  storage: '',
  imageFile: null,
  imagePreviewUrl: ''
};

export const TestProvider = ({ children }) => {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [currentResult, setCurrentResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('feedcheck_current_result');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFeedType, setSelectedFeedType] = useState(null);

  // Load history & summary from service on startup
  useEffect(() => {
    refreshHistory();
  }, []);

  // Update selected feed type metadata whenever draft.feed_type_id changes
  useEffect(() => {
    const found = FEED_TYPES.find(f => f.id === draft.feed_type_id);
    setSelectedFeedType(found || null);
  }, [draft.feed_type_id]);

  const refreshHistory = async () => {
    try {
      const items = await api.getHistory();
      setHistory(items);
      const stats = await api.getSummary();
      setSummary(stats);
    } catch (e) {
      console.error('[Context] Failed to load history:', e);
    }
  };

  const updateDraft = (field, value) => {
    setDraft(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
    setCurrentResult(null);
  };

  /**
   * Dispatches the collected user inputs to the API service.
   * No prediction logic is performed in React.
   */
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const payload = {
        image: draft.imageFile || draft.imagePreviewUrl,
        imagePreviewUrl: draft.imagePreviewUrl,
        moisture: draft.moisture,
        pH: draft.pH,
        temperature: draft.temperature,
        feed_type_id: draft.feed_type_id,
        farm_location: draft.farm_location,
        batch_id: draft.batch_id,
        cutLength: draft.cutLength,
        odor: draft.odor,
        color: draft.color,
        storage: draft.storage
      };

      const result = await api.analyzeFeedSample(payload);
      setCurrentResult(result);
      try {
        sessionStorage.setItem('feedcheck_current_result', JSON.stringify(result));
      } catch (e) {}
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Persists test result via API service.
   */
  const saveResult = async (resultToSave = currentResult) => {
    if (!resultToSave) return null;
    setIsSaving(true);
    try {
      const saved = await api.saveTest(resultToSave);
      await refreshHistory();
      return saved;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTest = async (testId) => {
    await api.deleteTest(testId);
    await refreshHistory();
  };

  const getTestById = async (testId) => {
    if (!testId && currentResult) return currentResult;
    if (currentResult && currentResult.id === testId) {
      return currentResult;
    }
    const cached = history.find(item => item.id === testId);
    if (cached) return cached;
    try {
      const sessionItem = sessionStorage.getItem('feedcheck_current_result');
      if (sessionItem) {
        const parsed = JSON.parse(sessionItem);
        if (parsed && (parsed.id === testId || !testId)) return parsed;
      }
    } catch (e) {}
    return await api.getTestById(testId);
  };

  const value = {
    draft,
    updateDraft,
    resetDraft,
    selectedFeedType,
    currentResult,
    setCurrentResult,
    isAnalyzing,
    isSaving,
    runAnalysis,
    saveResult,
    history,
    summary,
    refreshHistory,
    deleteTest,
    getTestById
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

export const FeedTestProvider = TestProvider;
