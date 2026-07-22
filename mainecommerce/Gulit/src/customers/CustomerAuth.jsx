import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, UserRound } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export default function CustomerAuth() {
  const { handleLogin, handleRegister, handleGoogleLogin } = useContext(AppContext);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const updateForm = (field, value) => setForm((c) => ({ ...c, [field]: value }));

  useEffect(() => {
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredentialResponse });
        window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  async function handleGoogleCredentialResponse(response) {
    setGoogleLoading(true); setError('');
    const result = await handleGoogleLogin(response.credential);
    setGoogleLoading(false);
    if (result.success) navigate('/customer', { replace: true });
    else setError(result.error || 'Google sign-in failed.');
  }

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    const email = String(form.email || '').trim().toLowerCase();
    const reg = mode === 'register' ? await handleRegister(form.name, email, form.password, null, 'customer') : { success: true };
    if (!reg.success) { setSubmitting(false); setError(reg.error || 'Could not create account.'); return; }
    if (mode === 'register' && reg.role === 'customer') { setSubmitting(false); navigate('/customer', { replace: true }); return; }
    const login = await handleLogin(email, form.password);
    setSubmitting(false);
    if (login.success && login.role === 'customer') navigate('/customer', { replace: true });
    else setError(login.error || 'Could not sign in.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-surface">
      <div className="bg-white border border-border-light rounded-2xl shadow-xl w-full max-w-md p-8 lg:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center mx-auto mb-3"><UserRound size={22} className="text-gold" /></div>
          <h1 className="text-xl font-semibold text-text-primary">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-xs text-text-muted mt-1">{mode === 'login' ? 'Sign in to your account.' : 'Register to start shopping.'}</p>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl mb-5 text-xs flex gap-2 items-center"><AlertCircle size={14} className="shrink-0" /><span className="font-medium">{error}</span></div>}

        <div className="mb-5">
          {GOOGLE_CLIENT_ID.startsWith('YOUR_') ? (
            <div className="w-full py-3 rounded-full border border-border-light text-center text-xs text-text-muted">Google Sign-In (add Client ID)</div>
          ) : googleLoading ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-border-light text-xs text-text-muted"><Loader2 size={14} className="animate-spin" /> Signing in...</div>
          ) : <div ref={googleBtnRef} className="w-full" />}
        </div>

        <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-border-light" /><span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">or</span><div className="flex-1 h-px bg-border-light" /></div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button type="button" onClick={() => setMode('login')} className={`py-2.5 rounded-full text-xs font-semibold transition ${mode === 'login' ? 'bg-dark text-white' : 'bg-surface text-text-muted hover:bg-gold-light hover:text-gold'}`}>Login</button>
          <button type="button" onClick={() => setMode('register')} className={`py-2.5 rounded-full text-xs font-semibold transition ${mode === 'register' ? 'bg-dark text-white' : 'bg-surface text-text-muted hover:bg-gold-light hover:text-gold'}`}>Register</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && <div><label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Full Name</label><input value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="w-full px-4 py-3 text-sm border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-gold transition" placeholder="Abebe Kebede" required /></div>}
          <div><label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Email</label><input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="w-full px-4 py-3 text-sm border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-gold transition" placeholder="you@example.com" required /></div>
          <div><label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Password</label><input type="password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} className="w-full px-4 py-3 text-sm border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-gold transition" placeholder="Password" required /></div>
          <button type="submit" disabled={submitting} className="w-full bg-dark text-white font-semibold py-3 rounded-full hover:bg-dark-muted transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting && <Loader2 size={14} className="animate-spin" />}{submitting ? 'Working...' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
