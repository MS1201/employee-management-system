import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    try {
      api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
  };

  const updateUser = (updated) => {
    setUser(prev => {
      const nu = { ...prev, ...updated };
      localStorage.setItem('user', JSON.stringify(nu));
      return nu;
    });
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isHR = user?.role === 'hr_manager' || isSuperAdmin;
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser,
      isSuperAdmin,
      isHR,
      isEmployee
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

