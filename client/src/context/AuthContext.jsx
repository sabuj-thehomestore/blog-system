import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }

    const handleAuthExpired = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    const { user: userData, accessToken } = data.data;
    setAccessToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (userDataPayload) => {
    const { data } = await api.post('/auth/register', userDataPayload);
    const { user: userData, accessToken } = data.data;
    setAccessToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue clearing client state even if request fails
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const setAuthData = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        setAuthData,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
