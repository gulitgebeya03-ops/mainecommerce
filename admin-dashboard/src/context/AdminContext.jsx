import { createContext, useState, useEffect } from 'react';
import { setAccessToken } from '../services/api';

export const AdminContext = createContext();

const STORAGE_KEY = 'adminAuth';

function readStoredAuth() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!stored?.token) return null;
    return stored;
  } catch {
    return null;
  }
}

export function AdminContextProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = readStoredAuth();
    if (stored?.token && stored?.user) {
      setAdmin(stored.user);
      setToken(stored.token);
      setIsAuthenticated(true);
      setAccessToken(stored.token);
    }
    setLoading(false);
  }, []);

  const adminLogin = ({ token: newToken, user }) => {
    setAdmin(user);
    setToken(newToken);
    setIsAuthenticated(true);
    setAccessToken(newToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user }));
  };

  const adminLogout = () => {
    setAdmin(null);
    setToken(null);
    setIsAuthenticated(false);
    setAccessToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminContext.Provider value={{ admin, token, isAuthenticated, loading, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}
