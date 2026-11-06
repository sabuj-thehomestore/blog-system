import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setAccessToken } from '../api/client';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAccessToken(token);
      refreshProfile().then(() => {
        navigate('/');
      });
    } else {
      navigate('/login?error=oauth_missing_token');
    }
  }, [searchParams, navigate, refreshProfile]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
      <p className="text-slate-600 font-medium">Completing secure authentication...</p>
    </div>
  );
};
