import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handle = ({ data }) => {
    localStorage.setItem('lpc-token', data.token);
    setUser(data.user);
    return data.user;
  };

  const login = (email, password) => api.post('/auth/login', { email, password }).then(handle);
  const register = (payload) => api.post('/auth/register', payload).then(handle);
  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('lpc-token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
