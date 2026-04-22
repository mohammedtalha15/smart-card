import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

export default function AuthCallback() {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate('/login', { replace: true });
      return;
    }

    const sessionId = match[1];

    (async () => {
      try {
        const data = await apiFetch('/api/auth/session', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId }),
        });
        login(data.token, data.user);
        // Clear hash and navigate
        window.history.replaceState(null, '', window.location.pathname);
        const role = data.user?.role;
        if (role === 'admin') navigate('/admin', { replace: true });
        else if (role === 'vendor') navigate('/vendor-portal', { replace: true });
        else navigate('/dashboard', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" data-testid="auth-callback">
      <div className="animate-pulse text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-2xl font-heading">A</span>
        </div>
        <p className="mt-4 text-zinc-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
