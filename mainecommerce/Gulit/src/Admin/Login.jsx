import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { handleLogin } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    const result = await handleLogin(email, password);
    setSubmitting(false);

    if (result.success && result.role === 'admin') {
      navigate(location.state?.from || '/admin/dashboard', { replace: true });
    } else if (result.success && result.role === 'salesman') {
      navigate('/admin/reports', { replace: true });
    } else if (result.success) {
      setErr('This account does not have staff privileges.');
    } else {
      setErr(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-border-light">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={28} className="text-gold" />
          </div>
          <h2 className="text-xl font-bold text-dark">Staff Login</h2>
          <p className="text-xs text-text-muted mt-1">Sign in with an admin or salesman account.</p>
        </div>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-xs flex gap-2 items-center">
            <AlertCircle size={14} className="shrink-0" /> <span className="font-medium">{err}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Account Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-surface"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-surface"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-dark hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-text-muted bg-surface p-2 rounded-lg">
          Staff accounts are created in the database. Use your assigned credentials to continue.
        </p>
      </div>
    </div>
  );
}
