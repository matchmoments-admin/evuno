'use client';

import { useState, useEffect } from 'react';

interface AuthState {
  token: string | null;
  loading: boolean;
}

/**
 * Client-side auth hook that reads the Keycloak JWT from localStorage.
 * In production, the token is stored after the PKCE callback flow.
 * For development with demo data, returns null token (pages fallback to demo data).
 */
export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('evuno_access_token');
    setToken(stored);
    setLoading(false);
  }, []);

  return { token, loading };
}
