import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

export default function AuthCallback() {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Use useRef to prevent double-processing under StrictMode
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

        if (data.token && data.user) {
          login(data.token, data.user);
          // Clear the hash fragment
          window.history.replaceState(null, '', window.location.pathname);
          // Navigate based on role
          const role = data.user?.role;
          if (role === 'admin') navigate('/admin', { replace: true });
          else if (role === 'vendor') navigate('/vendor-portal', { replace: true });
          else navigate('/dashboard', { replace: true });
        } else {
          console.error('Auth callback: Missing token or user data');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white" data-testid="auth-callback">
      <div className="text-center anim-fade-in">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-brand rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-400 text-sm font-body">Authenticating...</p>
      </div>
    </div>
  );
}
