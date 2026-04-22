import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';

type LoginMode = 'student' | 'vendor' | 'admin';

export default function Login() {
  const { login } = useAuth();
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
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-xl font-heading">A</span>
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">Artha</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-heading font-bold tracking-tight leading-tight">
            Unlock real-world value<br />through your student identity.
          </h1>
          <p className="text-zinc-400 text-lg font-body leading-relaxed max-w-md">
            Artha connects verified students with exclusive discounts at local vendors. Save more, support local businesses.
          </p>
        </div>
        <p className="text-zinc-500 text-sm font-body">
          A verified student discount network.
        </p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white font-bold text-xl font-heading">A</span>
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">Artha</span>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-tight">Sign in</h2>
            <p className="mt-2 text-zinc-500 font-body">
              {mode === 'student' && 'Use your college Google account to continue.'}
              {mode === 'vendor' && 'Sign in to your vendor portal.'}
              {mode === 'admin' && 'Admin access only.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg" data-testid="login-mode-tabs">
            {(['student', 'vendor', 'admin'] as LoginMode[]).map((m) => (
              <button
                key={m}
                data-testid={`login-tab-${m}`}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          {mode === 'student' ? (
            <div className="space-y-4">
              <button
                data-testid="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <p className="text-center text-xs text-zinc-400">
                Only verified college emails are accepted.
              </p>
            </div>
          ) : (
            <form onSubmit={mode === 'vendor' ? handleVendorLogin : handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <input
                    data-testid="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === 'vendor' ? 'vendor@artha.com' : 'admin@artha.com'}
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <input
                    data-testid="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <button
                data-testid="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
