const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5252';

export async function register({ username, email, password, role, adminSecret }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const res = await fetch(`${BACKEND}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: normalizedEmail, password, role, adminSecret }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Register failed');
  }
  return res.json();
}

export async function login(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login failed');
  }
  return res.json();
}

export async function googleLogin(idToken) {
  const res = await fetch(`${BACKEND}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Google login failed');
  }
  return res.json();
}
