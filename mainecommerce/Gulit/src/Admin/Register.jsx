import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const { handleRegister } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [adminCode, setAdminCode] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!adminCode.trim()) {
      setErr('Admin code is required to create an admin account.');
      return;
    }

    setSubmitting(true);
    const result = await handleRegister(username, email, password, adminCode.trim(), role);
    setSubmitting(false);
    if (result.success) {
      navigate('/admin/login');
    } else {
      setErr(result.error || 'Registration failed');
    }
  };

  const inputCls = "w-full p-2.5 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-surface";

  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-border-light">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <UserPlus size={28} className="text-gold" />
          </div>
          <h2 className="text-lg font-bold text-dark">Register Staff</h2>
          <p className="text-xs text-text-muted mt-1">Create an admin or salesman account using the backend admin code.</p>
        </div>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-xs flex gap-2 items-center">
            <AlertCircle size={14} className="shrink-0" /> <span className="font-medium">{err}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className={inputCls} required>
              <option value="admin">Admin</option>
              <option value="salesman">Salesman</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Admin Code</label>
            <input value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="Admin Code" type="text" className={inputCls} required />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-dark hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
