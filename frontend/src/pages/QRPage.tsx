import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, History, XCircle, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

const QR_EXPIRY = 30;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 45;

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={2} /> },
];

export default function QRPage() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const vendorId = searchParams.get('vendor_id') || '';
  const offerId = searchParams.get('offer_id') || '';
  const [qrData, setQrData] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [status, setStatus] = useState<'loading' | 'active' | 'expired' | 'error'>('loading');
  const [error, setError] = useState('');

  const generateQR = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await apiFetch('/api/qr/generate', {
        method: 'POST',
        body: JSON.stringify({ vendor_id: vendorId, offer_id: offerId }),
        token: token || undefined,
      });
      setQrData(data.qr_data);
      setVendorName(data.vendor_name);
      setDiscount(data.discount);
      setSecondsLeft(QR_EXPIRY);
      setStatus('active');
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR');
      setStatus('error');
    }
  }, [vendorId, offerId, token]);

  useEffect(() => {
    if (vendorId && offerId) generateQR();
  }, [vendorId, offerId, generateQR]);

  useEffect(() => {
    if (status !== 'active' || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { setStatus('expired'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, secondsLeft]);

  const progress = secondsLeft / QR_EXPIRY;
  const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progress);
  const isWarning = secondsLeft <= 10;

  return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="max-w-md mx-auto" data-testid="qr-page">
        <button data-testid="qr-back-btn" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0F172A] mb-6 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> Back
        </button>

        <div className="bg-white border border-slate-200 p-8 text-center glow-card" style={{ borderRadius: '2px' }}>
          <p className="text-[10px] tracking-widest uppercase font-bold text-slate-300 mb-1">Your Discount QR</p>
          <h1 className="text-xl font-heading font-bold tracking-tighter text-[#0F172A]">{vendorName || 'Loading...'}</h1>
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-brand-50 text-brand text-sm font-bold" style={{ borderRadius: '2px' }}>
              <Sparkles className="w-3.5 h-3.5" /> {discount}% OFF
            </span>
          )}

          {status === 'loading' && (
            <div className="py-16" data-testid="qr-loading">
              <div className="w-10 h-10 border-2 border-slate-200 border-t-brand rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-slate-400 text-xs">Generating your QR code...</p>
            </div>
          )}

          {status === 'active' && (
            <div data-testid="qr-active" className="mt-6">
              {/* QR with scan line */}
              <div className="inline-block p-5 bg-white border border-slate-100 scan-line-container relative" style={{ borderRadius: '2px' }}>
                <QRCodeSVG value={qrData} size={200} level="H" />
              </div>

              {/* Circular countdown */}
              <div className="mt-6 flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="countdown-circle w-24 h-24" viewBox="0 0 100 100">
                    <circle className="track" cx="50" cy="50" r="45" />
                    <circle
                      className={`progress ${isWarning ? 'warning' : ''}`}
                      cx="50" cy="50" r="45"
                      strokeDasharray={CIRCLE_CIRCUMFERENCE}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-heading font-black tracking-tighter ${isWarning ? 'text-red-500' : 'text-[#0F172A]'}`}>
                      {secondsLeft}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-slate-300 tracking-wider uppercase font-bold">
                  Show this QR to the vendor
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 w-full bg-slate-100 h-1 overflow-hidden" style={{ borderRadius: '1px' }}>
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${isWarning ? 'bg-red-500' : 'bg-brand'}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="py-12" data-testid="qr-expired">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 flex items-center justify-center" style={{ borderRadius: '2px' }}>
                <XCircle className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-[#0F172A] font-heading font-bold text-lg">QR Expired</p>
              <p className="text-slate-400 text-xs mt-1">This code has expired for security. Generate a new one.</p>
              <button data-testid="regenerate-qr-btn" onClick={generateQR}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-all btn-primary" style={{ borderRadius: '2px' }}>
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} /> Generate New QR
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-12" data-testid="qr-error">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-50 flex items-center justify-center" style={{ borderRadius: '2px' }}>
                <XCircle className="w-8 h-8 text-red-300" strokeWidth={1.5} />
              </div>
              <p className="text-red-500 font-heading font-bold">Something went wrong</p>
              <p className="text-red-400 text-xs mt-1">{error}</p>
              <button data-testid="retry-qr-btn" onClick={generateQR}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white text-xs font-bold btn-primary" style={{ borderRadius: '2px' }}>
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
