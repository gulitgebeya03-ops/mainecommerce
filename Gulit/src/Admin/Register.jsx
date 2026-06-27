import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-lg font-bold mb-1">Register Admin</h2>
        <p className="text-xs text-gray-500 mb-4">Create an admin or salesman account using the backend admin code.</p>
        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded" required />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 border rounded" required />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" required />
          <select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="admin">Admin</option>
            <option value="salesman">Salesman</option>
          </select>
          <input value={adminCode} onChange={e=>setAdminCode(e.target.value)} placeholder="Admin Code" type="text" className="w-full p-2 border rounded" required />
          <button type="submit" disabled={submitting} className="w-full bg-gray-900 text-white py-2 rounded">{submitting ? 'Registering...' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
}
