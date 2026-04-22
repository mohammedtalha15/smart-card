import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, History, Timer, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const QR_EXPIRY = 30;

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={1.5} /> },
];

export default function QRPage() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const vendorId = searchParams.get('vendor_id') || '';
  const offerId = searchParams.get('offer_id') || '';

  const [qrData, setQrData] = useState<string>('');
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
    if (vendorId && offerId) {
      generateQR();
    }
  }, [vendorId, offerId, generateQR]);

  useEffect(() => {
    if (status !== 'active' || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, secondsLeft]);

  return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="animate-fade-in-up max-w-lg mx-auto" data-testid="qr-page">
        <button
          data-testid="qr-back-btn"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-heading font-bold tracking-tight mb-1">Your Discount QR</h1>
          {vendorName && (
            <p className="text-zinc-500 text-sm mb-6">{vendorName} &middot; {discount}% OFF</p>
          )}

          {status === 'loading' && (
            <div className="py-16" data-testid="qr-loading">
              <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-zinc-500 text-sm">Generating QR code...</p>
            </div>
          )}

          {status === 'active' && (
            <div data-testid="qr-active">
              <div className="inline-block p-4 bg-white rounded-xl border border-zinc-100 shadow-sm">
                <QRCodeSVG value={qrData} size={220} level="H" />
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                <Timer className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                <span className={`text-lg font-bold font-heading ${secondsLeft <= 10 ? 'text-red-500' : 'text-zinc-900'}`}>
                  {secondsLeft}s
                </span>
                <span className="text-zinc-400 text-sm">remaining</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${secondsLeft <= 10 ? 'bg-red-500' : 'bg-zinc-900'}`}
                  style={{ width: `${(secondsLeft / QR_EXPIRY) * 100}%` }}
                />
              </div>
              <p className="mt-4 text-xs text-zinc-400">Show this QR to the vendor to redeem your discount.</p>
            </div>
          )}

          {status === 'expired' && (
            <div className="py-12" data-testid="qr-expired">
              <XCircle className="w-12 h-12 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-zinc-900 font-heading font-bold text-lg">QR Code Expired</p>
              <p className="text-zinc-500 text-sm mt-1">Generate a new one to continue.</p>
              <button
                data-testid="regenerate-qr-btn"
                onClick={generateQR}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                Generate New QR
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-12" data-testid="qr-error">
              <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-zinc-900 font-heading font-bold text-lg">Error</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
              <button
                data-testid="retry-qr-btn"
                onClick={generateQR}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
