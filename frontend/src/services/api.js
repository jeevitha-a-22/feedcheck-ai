import axios from 'axios';
import { INITIAL_MOCK_HISTORY, FEED_TYPES } from '../utils/constants';

const RAW_API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = (RAW_API_URL && RAW_API_URL.trim() !== '')
  ? RAW_API_URL.trim().replace(/\/+$/, '')
  : 'http://localhost:8000';

const STORAGE_KEY = 'feedcheck_records_v1';

/**
 * Axios client for FastAPI backend communication
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json'
  }
});

/**
 * Helper to retrieve stored test history from localStorage
 */
const getStoredHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('[API Service] Failed to read from localStorage:', err);
  }
  return INITIAL_MOCK_HISTORY;
};

/**
 * Helper to persist test history to localStorage
 */
const saveStoredHistory = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('[API Service] Failed to save to localStorage:', err);
  }
};

/**
 * Helper to simulate network latency for loading state verification
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * FeedCheck API Service
 * Encapsulates network communication with temporary contract-compliant mock fallback.
 */
export const api = {
  /**
   * POST /analyze
   * Send feed/silage image and sensor inputs to AI backend.
   *
   * @param {Object} payload
   * @param {File|Blob|string} payload.image - Sample image file or URL
   * @param {number|string} payload.moisture - Moisture content (%)
   * @param {number|string} payload.pH - Silage pH level
   * @param {number|string} payload.temperature - Internal core temperature (°C)
   * 
   * @returns {Promise<Object>} Formatted API response
   */
  async analyzeFeedSample(payload) {
    try {
      const formData = new FormData();
      let imageBlob = payload.image;

      // If image is a data URL or remote URL, convert to Blob for multipart upload
      if (typeof imageBlob === 'string') {
        try {
          const fetched = await fetch(imageBlob);
          imageBlob = await fetched.blob();
        } catch (fetchErr) {
          console.warn('[API Service] Could not fetch remote image as blob:', fetchErr);
        }
      }

      if (imageBlob instanceof File || imageBlob instanceof Blob) {
        formData.append('image', imageBlob, imageBlob.name || 'sample_feed.jpg');
      } else {
        throw new Error('Please select or upload a valid sample image file.');
      }

      formData.append('moisture', payload.moisture);
      formData.append('pH', payload.pH);
      formData.append('temperature', payload.temperature);
      if (payload.feed_type_id) formData.append('feed_type_id', payload.feed_type_id);
      if (payload.farm_location) formData.append('farm_location', payload.farm_location);
      if (payload.batch_id) formData.append('batch_id', payload.batch_id);
      if (payload.cutLength) formData.append('cut_length', payload.cutLength);
      if (payload.odor) formData.append('odor', payload.odor);
      if (payload.color) formData.append('color', payload.color);
      if (payload.storage) formData.append('storage', payload.storage);

      const response = await client.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      console.error('[API Service] Error communicating with FastAPI backend:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'AI Analysis failed. Please check your backend connection.';
      throw new Error(errorMsg);
    }
  },

  /**
   * GET /history
   * Retrieve list of past feed quality assessments.
   */
  async getHistory() {
    try {
      const response = await client.get('/history');
      return response.data;
    } catch (error) {
      return getStoredHistory();
    }
  },

  /**
   * GET /test/:id
   * Retrieve single test result record.
   */
  async getTestById(id) {
    try {
      const response = await client.get(`/test/${id}`);
      return response.data;
    } catch (error) {
      try {
        const sessionItem = sessionStorage.getItem('feedcheck_current_result');
        if (sessionItem) {
          const parsed = JSON.parse(sessionItem);
          if (parsed && parsed.id === id) return parsed;
        }
      } catch (e) {}
      const all = getStoredHistory();
      return all.find(item => item.id === id) || null;
    }
  },

  /**
   * POST /save
   * Persist a completed test result to the database.
   */
  async saveTest(testRecord) {
    try {
      const response = await client.post('/save', testRecord);
      return response.data;
    } catch (error) {
      await sleep(400); // Simulate fast save delay
      const all = getStoredHistory();
      const existingIdx = all.findIndex(t => t.id === testRecord.id);
      let updated;
      if (existingIdx >= 0) {
        updated = [...all];
        updated[existingIdx] = testRecord;
      } else {
        updated = [testRecord, ...all];
      }
      saveStoredHistory(updated);
      return testRecord;
    }
  },

  /**
   * DELETE /test/:id
   * Remove a test record.
   */
  async deleteTest(id) {
    try {
      await client.delete(`/test/${id}`);
      return true;
    } catch (error) {
      const all = getStoredHistory();
      const updated = all.filter(t => t.id !== id);
      saveStoredHistory(updated);
      return true;
    }
  },

  /**
   * GET /summary
   * Retrieve farm aggregate metrics and quality breakdown.
   */
  async getSummary() {
    try {
      const response = await client.get('/summary');
      return response.data;
    } catch (error) {
      const history = getStoredHistory();
      const totalTests = history.length;
      const goodCount = history.filter(t => (t.quality || '').toLowerCase().includes('good')).length;
      const moderateCount = history.filter(t => (t.quality || '').toLowerCase().includes('mod')).length;
      const poorCount = history.filter(t => (t.quality || '').toLowerCase().includes('poor')).length;

      const avgScore = totalTests > 0
        ? Math.round(history.reduce((acc, t) => acc + (t.score || (t.quality === 'good' ? 92 : t.quality === 'moderate' ? 76 : 52)), 0) / totalTests)
        : 85;

      const avgMoisture = totalTests > 0
        ? (history.reduce((acc, t) => acc + (parseFloat(t.metrics?.moisture?.value) || 64.5), 0) / totalTests).toFixed(1)
        : '64.5';

      const avgPh = totalTests > 0
        ? (history.reduce((acc, t) => acc + (parseFloat(t.metrics?.pH?.value || t.metrics?.ph?.value) || 3.9), 0) / totalTests).toFixed(2)
        : '4.10';

      return {
        total_tests: totalTests,
        avg_score: avgScore,
        avg_moisture: avgMoisture,
        avg_ph: avgPh,
        distribution: {
          good: goodCount,
          moderate: moderateCount,
          poor: poorCount
        },
        recent: history.slice(0, 5)
      };
    }
  },

  /**
   * Temporary mock analysis generator matching the exact API contract:
   * {
   *   quality: "good | moderate | poor",
   *   confidence: 0.87,
   *   risk_level: "low | medium | high",
   *   visual_indicators: [ "Visible discoloration", "Uneven texture" ],
   *   advisory: "Review storage conditions and inspect the sample before use."
   * }
   */
  _mockAnalyzeResponse(payload) {
    const moisture = parseFloat(payload.moisture) || 64.5;
    const ph = parseFloat(payload.pH) || 3.9;
    const temp = parseFloat(payload.temperature) || 22;
    const feedTypeObj = FEED_TYPES.find(f => f.id === payload.feed_type_id) || FEED_TYPES[0];

    let quality = 'good';
    let confidence = 0.94;
    let risk_level = 'low';
    let score = 92;
    let visual_indicators = [
      'FBSI Score 0: Bare/slick bunk with approximately 0% feed remaining (Model Confidence: 94.0%)',
      'Bunk surface appears to have minimal visible feed residue.',
      'Visual pattern is consistent with a low residual feed level.'
    ];
    let advisory = 'Prototype screening indicates measurements within configured baseline ranges. Continue routine bunk management and monitor storage conditions.';
    let evidence = [
      `Field pH reading (${ph}) is within the configured screening range (3.8 - 4.3).`,
      `Moisture reading (${moisture}%) is within the configured screening range (60 - 70%).`,
      `Core temperature (${temp}°C) is within the configured baseline (< 28°C).`
    ];

    if (ph > 4.7 || moisture > 73 || temp > 36 || payload.odor === 'rancid_butter') {
      quality = 'poor';
      confidence = 0.91;
      risk_level = 'high';
      score = 52;
      visual_indicators = [
        'FBSI Score 4: Feed appears largely untouched (Model Confidence: 91.0%)',
        'A large amount of feed appears to remain in the bunk.',
        'Visual pattern is consistent with a high residual feed level.'
      ];
      advisory = 'Prototype screening flags one or more measurements outside configured target ranges. Further physical inspection or laboratory assessment is recommended.';
      evidence = [
        `Field pH reading (${ph}) is outside the configured screening range. Further physical or laboratory assessment may be appropriate.`,
        `Moisture reading (${moisture}%) is outside the configured screening range. This is a potential storage-condition risk indicator.`,
        `Core temperature (${temp}°C) is elevated relative to the configured baseline. Further assessment may be appropriate.`
      ];
    } else if (ph > 4.3 || moisture < 60 || moisture > 70 || temp > 28) {
      quality = 'moderate';
      confidence = 0.87;
      risk_level = 'medium';
      score = 76;
      visual_indicators = [
        'FBSI Score 2: Approximately 25% to 50% feed remaining with visible crowns/piles (Model Confidence: 87.0%)',
        'Moderate residual feed volume is visible across the bunk.',
        'Uneven feed accumulation is visible in parts of the bunk.'
      ];
      advisory = 'Prototype screening indicates mild measurement variability or elevated bunk residuals. Inspect bunker face for localized warming and monitor herd intake patterns.';
      evidence = [
        `Field pH reading (${ph}) is above the configured screening range (3.8 - 4.3).`,
        `Moisture reading (${moisture}%) is slightly outside the configured screening range (60 - 70%).`,
        `Core temperature (${temp}°C) is above the configured baseline (< 28°C). Continued monitoring is recommended.`
      ];
    }

    const testId = `test-${Date.now()}`;
    const timestamp = new Date().toISOString();

    return {
      id: testId,
      fbsi_score: quality === 'good' ? 'score_0' : quality === 'moderate' ? 'score_2' : 'score_4',
      confidence,
      class_probabilities: {
        score_0: quality === 'good' ? 0.94 : 0.02,
        score_1_2: quality === 'good' ? 0.03 : 0.03,
        score_1: 0.01,
        score_2: quality === 'moderate' ? 0.87 : 0.02,
        score_3: 0.01,
        score_4: quality === 'poor' ? 0.91 : 0.01
      },
      quality,
      screening_result: quality.toUpperCase(),
      score,
      risk_level,
      assessment_basis: [
        'AI visual screening using the FBSI classifier',
        'Field pH measurement',
        'Field moisture measurement',
        'Field temperature measurement'
      ],
      visual_indicators,
      advisory,
      evidence,
      feed_type: feedTypeObj.name,
      feed_type_id: feedTypeObj.id,
      batch_id: payload.batch_id || `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      farm_location: payload.farm_location || 'North Bunker Lot 1',
      image_url: payload.imagePreviewUrl || (payload.image && typeof payload.image === 'string' ? payload.image : (feedTypeObj?.image || '/assets/corn_silage.jpg')),
      timestamp,
      metrics: {
        moisture: {
          value: moisture,
          unit: '%',
          status: (moisture >= 60 && moisture <= 70) ? 'within_range' : (moisture >= 52 && moisture <= 73) ? 'warning' : 'danger',
          range: '60 - 70%',
          source: 'field_input'
        },
        pH: {
          value: ph,
          unit: 'pH',
          status: (ph >= 3.8 && ph <= 4.3) ? 'within_range' : (ph <= 4.7) ? 'warning' : 'danger',
          range: '3.8 - 4.3',
          source: 'field_input'
        },
        temperature: {
          value: temp,
          unit: '°C',
          status: temp < 28 ? 'within_range' : temp <= 36 ? 'warning' : 'danger',
          range: '< 28°C',
          source: 'field_input'
        }
      },
      limitations: [
        'Prototype screening only; not a laboratory analysis.',
        'Visual screening does not confirm toxins, mycotoxins, mold contamination, or nutritional composition.',
        'Does not confirm laboratory feed quality or safety guarantees.',
        'Configured ranges should be validated against field and laboratory measurements before production deployment.'
      ]
    };
  }
};

export default api;
