'use client';

import { useState, useEffect } from 'react';

interface AuthState {
  token: string | null;
  loading: boolean;
}

/**
 * Client-side auth hook. Reads the access token from a cookie.
 * The token is set as httpOnly by the /auth/callback route, so
 * client JS cannot read it directly — but fetch with credentials: 'include'
 * will send it automatically. For components that need the token value
 * (e.g. to pass as Authorization header), we read from a non-httpOnly
 * companion cookie or fall back gracefully.
 */
export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to read access_token from cookies (available if not httpOnly)
    // In production the httpOnly cookie is sent automatically with credentials
    const cookies = document.cookie.split(';').reduce(
      (acc, c) => {
        const [key, ...val] = c.trim().split('=');
        acc[key] = val.join('=');
        return acc;
      },
      {} as Record<string, string>,
    );

    setToken(cookies['access_token'] ?? null);
    setLoading(false);
  }, []);

  return { token, loading };
}
