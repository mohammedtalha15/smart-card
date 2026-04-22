import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, ScanLine, CheckCircle, XCircle, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const vendorNav = [
  { label: 'Dashboard', path: '/vendor-portal', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Scan QR', path: '/vendor-portal/scan', icon: <ScanLine className="w-4 h-4" strokeWidth={1.5} /> },
];

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function VendorScan() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<any>(null);

  const startScanner = async () => {
    setScanStatus('scanning');
    setError('');
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      scannerRef.current = reader;

      reader.decodeFromVideoDevice(undefined, videoRef.current!, (result: any, err: any) => {
        if (result) {
          const text = result.getText();
          if (text.startsWith('qr_')) {
            stopScanner();
            validateQR(text);
          }
        }
      });
    } catch (err) {
      setScanStatus('idle');
      setError('Camera access denied. Please enable camera permissions or use manual entry.');
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const validateQR = async (sessionId: string) => {
    try {
      const data = await apiFetch('/api/qr/validate', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
        token: token || undefined,
      });
      setResult(data);
      setScanStatus('success');
    } catch (err: any) {
      setError(err.message || 'Validation failed');
      setScanStatus('error');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setScanStatus('scanning');
    await validateQR(manualCode.trim());
  };

  const reset = () => {
    setScanStatus('idle');
    setResult(null);
    setError('');
    setManualCode('');
    stopScanner();
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <SidebarLayout navItems={vendorNav} title="Vendor">
      <div className="animate-fade-in-up max-w-lg mx-auto" data-testid="vendor-scan-page">
        <button
          data-testid="scan-back-btn"
          onClick={() => navigate('/vendor-portal')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to dashboard
        </button>

        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-heading font-bold tracking-tight mb-2">Scan Student QR</h1>
          <p className="text-zinc-500 text-sm mb-6">Scan the student's QR code to apply their discount.</p>

          {scanStatus === 'idle' && (
            <div className="space-y-4" data-testid="scan-idle">
              <button
                data-testid="start-camera-btn"
                onClick={startScanner}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" strokeWidth={1.5} />
                Open Camera Scanner
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-zinc-400 uppercase tracking-wider font-bold">Or enter manually</span>
                </div>
              </div>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  data-testid="manual-qr-input"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter QR session code"
                  className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
                <button
                  data-testid="manual-submit-btn"
                  type="submit"
                  className="px-4 h-10 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all"
                >
                  Validate
                </button>
              </form>
            </div>
          )}

          {scanStatus === 'scanning' && (
            <div data-testid="scan-scanning">
              <div className="relative w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-zinc-900 mb-4">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 border-2 border-white/20 rounded-lg">
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-white/60 rounded-md" />
                </div>
              </div>
              <p className="text-zinc-500 text-sm">Point your camera at the student's QR code...</p>
              <button
                data-testid="cancel-scan-btn"
                onClick={reset}
                className="mt-3 text-sm text-zinc-500 hover:text-zinc-700 underline"
              >
                Cancel
              </button>
            </div>
          )}

          {scanStatus === 'success' && result && (
            <div className="py-6" data-testid="scan-success">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-heading font-bold text-emerald-600">Discount Applied!</h2>
              <div className="mt-4 space-y-2 text-sm text-zinc-600">
                <p>Student: <span className="font-medium text-zinc-900">{result.student_name}</span></p>
                <p>Discount: <span className="font-bold text-emerald-600">{result.discount}% OFF</span></p>
              </div>
              <button
                data-testid="scan-another-btn"
                onClick={reset}
                className="mt-6 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all"
              >
                Scan Another
              </button>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="py-6" data-testid="scan-error">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-heading font-bold text-red-600">Error</h2>
              <p className="mt-2 text-sm text-red-500">{error}</p>
              <button
                data-testid="try-again-btn"
                onClick={reset}
                className="mt-6 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
