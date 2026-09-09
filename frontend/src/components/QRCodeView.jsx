import React, { useMemo } from 'react';
import { generateQRCodeMatrix } from '../utils/qrcode';
import { useLanguage } from '../context/LanguageContext';
import { QrCode, ExternalLink, Download, CheckCircle2, ShieldAlert } from 'lucide-react';
import Button from './Button';
import Card, { CardHeader } from './Card';

export const QRCodeView = ({
  testId,
  batchId,
  url,
  feedType = 'Silage Sample',
  timestamp,
  className = ''
}) => {
  const { t } = useLanguage();
  const verifyUrl = url || `${window.location.origin}/verify/${testId}`;

  const matrix = useMemo(() => {
    try {
      return generateQRCodeMatrix(verifyUrl);
    } catch (e) {
      console.error('[QRCodeView] Failed to generate matrix:', e);
      return null;
    }
  }, [verifyUrl]);

  // Generate crisp, self-contained QR PNG data URL directly from matrix
  const qrDataUrl = useMemo(() => {
    if (!matrix || matrix.length === 0) return '';
    try {
      const size = matrix.length;
      const scale = 8;
      const margin = 3 * scale; // 3 modules quiet zone
      const canvas = document.createElement('canvas');
      canvas.width = size * scale + margin * 2;
      canvas.height = size * scale + margin * 2;
      const ctx = canvas.getContext('2d');

      // 1. Fill crisp white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render sharp dark modules
      ctx.fillStyle = '#0F172A';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c] === 1) {
            ctx.fillRect(c * scale + margin, r * scale + margin, scale, scale);
          }
        }
      }

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('[QRCodeView] Failed to generate QR data URL:', e);
      return '';
    }
  }, [matrix]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.download = `FeedCheck-QR-${batchId || testId}.png`;
    a.href = qrDataUrl;
    a.click();
  };

  if (!matrix) {
    return null;
  }

  return (
    <Card className={`overflow-hidden border-brand-200/90 bg-gradient-to-br from-white via-white to-brand-50/20 ${className}`}>
      <CardHeader
        icon={QrCode}
        title={t('qr.title', 'QR-Based Batch Traceability & Verification')}
        subtitle={t('qr.subtitle', "Scannable link to this specific sample's screening record.")}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
        {/* Left: Interactive QR Code Card */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for Batch ${batchId || testId}`}
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg shadow-2xs"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-slate-400 text-xs font-medium">
                {t('qr.generating_qr', 'Generating QR...')}
              </div>
            )}
          </div>

          <span className="font-mono text-[11px] font-bold text-slate-500 mt-3 truncate max-w-[200px]">
            {batchId || testId}
          </span>
        </div>

        {/* Right: Metadata & Actions */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('qr.traceability_badge', 'Traceability ID Generated')}</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {t('qr.batch_qr_title', 'Batch Verification QR Code')}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t('qr.description', 'Anyone scanning this QR code will access the on-demand batch traceability summary, including FBSI visual screening index, model confidence, and recorded field inputs.')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t('qr.feed_sample_label', 'Feed Sample:')}</span>
              <strong className="text-slate-800 font-bold">{feedType}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t('qr.record_id_label', 'Record ID:')}</span>
              <span className="font-mono text-slate-700 font-bold">{testId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t('qr.verify_url_label', 'Verification URL:')}</span>
              <span className="font-mono text-brand-700 text-[11px] truncate max-w-[220px]">{verifyUrl}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={`/verify/${testId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="sm" variant="primary" icon={ExternalLink} className="text-xs">
                {t('qr.open_page', 'Open Verification Page')}
              </Button>
            </a>

            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={handleDownload}
              className="text-xs"
            >
              {t('qr.download_qr', 'Download QR Image')}
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{t('qr.prototype_note', 'Prototype screening record — not a certified laboratory analysis.')}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default QRCodeView;
