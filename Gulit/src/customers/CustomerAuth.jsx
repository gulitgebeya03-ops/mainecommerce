import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, UserRound } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function CustomerAuth() {
  const { handleLogin, handleRegister } = useContext(AppContext);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const result = mode === 'register'
      ? await handleRegister(form.name, form.email, form.password, null, 'customer')
      : { success: true };

    if (!result.success) {
      setSubmitting(false);
      setError(result.error || 'Could not create customer account.');
      return;
    }

    const loginResult = await handleLogin(form.email, form.password);
    setSubmitting(false);

    if (loginResult.success && loginResult.role === 'customer') {
      navigate('/customer', { replace: true });
      return;
    }

    setError(loginResult.error || 'Could not sign in as customer.');
  };

  return (
    <div className="min-h-[75vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2">
            <UserRound size={26} />
          </div>
          <h1 className="text-xl font-black text-gray-900">Customer Account</h1>
          <p className="text-xs text-gray-500 mt-1">Register or sign in. Guest checkout still works.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg text-sm font-bold ${mode === 'login' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg text-sm font-bold ${mode === 'register' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-xl mb-4 text-xs flex gap-2 items-center">
            <AlertCircle size={14} className="shrink-0" /> <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Abebe Kebede"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="customer@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Working...' : mode === 'register' ? 'Create Customer Account' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
