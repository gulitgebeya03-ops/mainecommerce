// src/Admin/Login.jsx
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
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-xl font-black text-gray-900">Admin Login</h2>
          <p className="text-xs text-gray-400 mt-1">Sign in with an admin or salesman account.</p>
        </div>

        {err && (
          <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-xl mb-4 text-xs flex gap-2 items-center">
            <AlertCircle size={14} className="shrink-0" /> <span className="font-medium">{err}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Authenticating...' : 'Authorize Credentials'}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg">
          Staff accounts are created in the database. Use your assigned credentials to continue.
        </p>
      </div>
    </div>
  );
}
