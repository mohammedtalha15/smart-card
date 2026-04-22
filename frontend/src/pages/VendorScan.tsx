import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, ScanLine, CheckCircle, XCircle, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const vendorNav = [
  { label: 'Dashboard', path: '/vendor-portal', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Scan QR', path: '/vendor-portal/scan', icon: <ScanLine className="w-4 h-4" strokeWidth={2} /> },
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

  const startScanner = async () => {
    setScanStatus('scanning');
    setError('');
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      reader.decodeFromVideoDevice(undefined, videoRef.current!, (r: any) => {
        if (r) {
          const text = r.getText();
          if (text.startsWith('qr_')) { stopScanner(); validateQR(text); }
        }
      });
    } catch { setScanStatus('idle'); setError('Camera access denied. Use manual entry below.'); }
  };

  const stopScanner = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  const validateQR = async (sessionId: string) => {
    try {
      const data = await apiFetch('/api/qr/validate', { method: 'POST', body: JSON.stringify({ session_id: sessionId }), token: token || undefined });
      setResult(data);
      setScanStatus('success');
    } catch (err: any) { setError(err.message || 'Validation failed'); setScanStatus('error'); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setScanStatus('scanning');
    await validateQR(manualCode.trim());
  };

  const reset = () => { setScanStatus('idle'); setResult(null); setError(''); setManualCode(''); stopScanner(); };

  useEffect(() => { return () => stopScanner(); }, []);

  return (
    <SidebarLayout navItems={vendorNav} title="Vendor">
      <div className="anim-fade-up max-w-lg mx-auto" data-testid="vendor-scan-page">
        <button data-testid="scan-back-btn" onClick={() => navigate('/vendor-portal')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0F172A] mb-6 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> Back to dashboard
        </button>

        <div className="bg-white border border-slate-200 p-8 text-center" style={{ borderRadius: '2px' }}>
          <p className="text-[10px] tracking-widest uppercase font-bold text-slate-300 mb-1">QR Scanner</p>
          <h1 className="text-xl font-heading font-bold tracking-tighter text-[#0F172A] mb-2">Scan Student QR</h1>
          <p className="text-slate-400 text-xs mb-6">Scan or enter the student's QR code to apply their discount.</p>

          {scanStatus === 'idle' && (
            <div className="space-y-4" data-testid="scan-idle">
              <button data-testid="start-camera-btn" onClick={startScanner}
                className="w-full flex items-center justify-center gap-2 h-11 bg-[#0F172A] text-white font-bold text-xs hover:bg-slate-800 transition-all active:scale-[0.97]" style={{ borderRadius: '2px' }}>
                <Camera className="w-4 h-4" strokeWidth={2} /> Open Camera Scanner
              </button>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] text-slate-300 uppercase tracking-widest font-bold">Or enter manually</span></div>
              </div>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input data-testid="manual-qr-input" type="text" value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Enter QR session code"
                  className="flex-1 h-10 px-3 border border-slate-200 text-sm focus:border-[#002FA7] focus:ring-1 focus:ring-[#002FA7]" style={{ borderRadius: '2px' }} />
                <button data-testid="manual-submit-btn" type="submit" className="px-4 h-10 bg-[#002FA7] text-white text-xs font-bold hover:bg-[#001D6C]" style={{ borderRadius: '2px' }}>Validate</button>
              </form>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
          )}

          {scanStatus === 'scanning' && (
            <div data-testid="scan-scanning">
              <div className="relative w-full aspect-square max-w-xs mx-auto bg-[#0F172A] mb-4 overflow-hidden" style={{ borderRadius: '2px' }}>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 border-2 border-white/10"><div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-white/40" style={{ borderRadius: '2px' }} /></div>
              </div>
              <p className="text-slate-400 text-xs">Point camera at QR code...</p>
              <button data-testid="cancel-scan-btn" onClick={reset} className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline">Cancel</button>
            </div>
          )}

          {scanStatus === 'success' && result && (
            <div className="py-6" data-testid="scan-success">
              <div className="w-14 h-14 bg-emerald-50 flex items-center justify-center mx-auto mb-4" style={{ borderRadius: '2px' }}>
                <CheckCircle className="w-7 h-7 text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-heading font-bold text-emerald-600 tracking-tight">Discount Applied!</h2>
              <div className="mt-4 space-y-1 text-sm text-slate-500">
                <p>Student: <span className="font-medium text-[#0F172A]">{result.student_name}</span></p>
                <p>Discount: <span className="font-bold text-[#002FA7]">{result.discount}% OFF</span></p>
              </div>
              <button data-testid="scan-another-btn" onClick={reset} className="mt-6 px-5 py-2.5 bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-all" style={{ borderRadius: '2px' }}>Scan Another</button>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="py-6" data-testid="scan-error">
              <div className="w-14 h-14 bg-red-50 flex items-center justify-center mx-auto mb-4" style={{ borderRadius: '2px' }}>
                <XCircle className="w-7 h-7 text-red-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-heading font-bold text-red-600 tracking-tight">Error</h2>
              <p className="mt-2 text-sm text-red-400">{error}</p>
              <button data-testid="try-again-btn" onClick={reset} className="mt-6 px-5 py-2.5 bg-[#0F172A] text-white text-xs font-bold" style={{ borderRadius: '2px' }}>Try Again</button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
