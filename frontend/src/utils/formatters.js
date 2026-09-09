/**
 * Utility Formatters for FeedCheck AI
 */

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Just now';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatConfidence = (conf) => {
  if (conf === undefined || conf === null) return '90%';
  const num = typeof conf === 'string' ? parseFloat(conf) : conf;
  if (num <= 1) {
    return `${Math.round(num * 100)}%`;
  }
  return `${Math.round(num)}%`;
};

export const getQualityVariant = (quality = 'good') => {
  const q = quality?.toLowerCase() || 'good';
  if (q.includes('good') || q.includes('a') || q.includes('optimal')) return 'emerald';
  if (q.includes('mod') || q.includes('b') || q.includes('med') || q.includes('accept')) return 'amber';
  if (q.includes('poor') || q.includes('c') || q.includes('high') || q.includes('risk')) return 'rose';
  return 'slate';
};

export const getQualityLabel = (quality = 'good', t = null) => {
  const q = quality?.toLowerCase() || 'good';
  if (t) {
    if (q === 'good' || q.includes('optimal') || q === 'a') return t('quality.grade_a', 'Grade A (Optimal)');
    if (q === 'moderate' || q.includes('accept') || q === 'b') return t('quality.grade_b', 'Grade B (Acceptable)');
    if (q === 'poor' || q.includes('risk') || q.includes('c')) return t('quality.grade_c', 'Grade C (Caution)');
  }
  if (q === 'good' || q.includes('optimal') || q === 'a') return 'Grade A (Good / Optimal)';
  if (q === 'moderate' || q.includes('accept') || q === 'b') return 'Grade B (Moderate)';
  if (q === 'poor' || q.includes('risk') || q.includes('c')) return 'Grade C (Poor / High Risk)';
  return quality;
};

export const formatRiskLevel = (risk = 'low', t = null) => {
  const r = risk?.toLowerCase() || 'low';
  if (t) {
    if (r === 'low') return t('quality.risk_low', 'Low Risk');
    if (r === 'medium' || r === 'moderate') return t('quality.risk_medium', 'Medium Risk');
    if (r === 'high') return t('quality.risk_high', 'High Risk');
  }
  if (r === 'low') return 'Low Spoilage Risk';
  if (r === 'medium' || r === 'moderate') return 'Medium Spoilage Risk';
  if (r === 'high') return 'High Spoilage Risk';
  return risk;
};

export const getStatusVariant = (status = 'optimal') => {
  const s = status?.toLowerCase() || 'optimal';
  if (s === 'optimal' || s === 'good' || s === 'low') return 'emerald';
  if (s === 'warning' || s === 'moderate' || s === 'medium') return 'amber';
  if (s === 'danger' || s === 'poor' || s === 'high') return 'rose';
  return 'slate';
};
