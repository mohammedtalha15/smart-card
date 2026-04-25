import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Mail, Lock, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

type LoginMode = 'student' | 'vendor' | 'admin';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/vendor/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, { ...data.vendor, user_id: data.vendor.vendor_id, role: 'vendor', email });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left: Branding — Animated dark panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F172A] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-bg opacity-5" />
        {/* Animated gradient blobs */}
        <div className="absolute top-[-20%] right-[-15%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-brand/30 to-violet-500/20 blur-[100px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-emerald-500/15 to-brand/10 blur-[100px] animate-float-delayed" />

        <div className="relative z-10">
          <button
            data-testid="back-to-home-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to home
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white flex items-center justify-center" style={{ borderRadius: '2px' }}>
              <span className="text-[#0F172A] font-heading font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-heading font-bold tracking-tighter">Artha</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-[0.95]">
            Your campus.<br />
            Your discounts.<br />
            <span className="text-[#5A7DFF]">Your network.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Exclusive discounts for verified students. Join thousands of students saving daily at local vendors.
          </p>
          {/* Trust indicators */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Verified only
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
              500+ students
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              100% free
            </div>
          </div>
        </div>
        <p className="relative z-10 text-slate-600 text-xs tracking-widest uppercase font-bold">
          Verified Student Network
        </p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute inset-0 dot-bg-hero opacity-50" />
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="lg:hidden">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] text-sm transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Home
            </button>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-[#0F172A] flex items-center justify-center" style={{ borderRadius: '2px' }}>
                <span className="text-white font-heading font-bold text-sm">A</span>
              </div>
              <span className="font-heading font-bold text-xl tracking-tighter">Artha</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-tighter text-[#0F172A]">Sign in</h2>
            <p className="mt-1.5 text-slate-500 text-sm">
              {mode === 'student' && 'Continue with your college Google account.'}
              {mode === 'vendor' && 'Access your vendor portal.'}
              {mode === 'admin' && 'Admin access only.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex border border-slate-200 overflow-hidden" style={{ borderRadius: '2px' }} data-testid="login-mode-tabs">
            {(['student', 'vendor', 'admin'] as LoginMode[]).map((m) => (
              <button
                key={m}
                data-testid={`login-tab-${m}`}
                onClick={() => { setMode(m); setError(''); setEmail(''); setPassword(''); }}
                className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                  mode === m
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-sm flex items-start gap-2" style={{ borderRadius: '2px' }} data-testid="login-error">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
              {error}
            </div>
          )}

          {mode === 'student' ? (
            <div className="space-y-5">
              <button
                data-testid="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 h-12 border border-slate-200 bg-white text-[#0F172A] font-medium text-sm hover:border-slate-900 hover:shadow-md transition-all active:scale-[0.98]"
                style={{ borderRadius: '2px' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-300">Verified only</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <p className="text-center text-xs text-slate-400">
                Only verified college email domains are accepted.<br />
                <span className="text-slate-300">BMSIT · RVCE · PES · Christ · Jain</span>
              </p>
            </div>
          ) : (
            <form onSubmit={mode === 'vendor' ? handleVendorLogin : handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand transition-colors" strokeWidth={1.5} />
                  <input
                    data-testid="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === 'vendor' ? 'vendor@artha.com' : 'admin@artha.com'}
                    required
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-300 focus:border-[#002FA7] focus:ring-1 focus:ring-[#002FA7] transition-all text-sm"
                    style={{ borderRadius: '2px' }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand transition-colors" strokeWidth={1.5} />
                  <input
                    data-testid="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-300 focus:border-[#002FA7] focus:ring-1 focus:ring-[#002FA7] transition-all text-sm"
                    style={{ borderRadius: '2px' }}
                  />
                </div>
              </div>
              <button
                data-testid="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0F172A] text-white font-medium text-sm hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 btn-primary"
                style={{ borderRadius: '2px' }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight className="w-4 h-4" strokeWidth={2} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
