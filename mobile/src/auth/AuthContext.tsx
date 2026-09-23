import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAccessToken } from '../api/client';
import { authApi } from '../api/endpoints';
import type { AuthUser } from '../api/types';
import { TOKEN_KEY, secureStorage } from '../utils/storage';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the persisted session is being restored on cold start. */
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await secureStorage.get(TOKEN_KEY);
      if (!stored) {
        if (!cancelled) setIsRestoring(false);
        return;
      }

      setAccessToken(stored);
      try {
        const { user: restored } = await authApi.me();
        if (!cancelled) setUser(restored);
      } catch {
        // Token expired or revoked - drop it and continue as a guest.
        setAccessToken(null);
        await secureStorage.remove(TOKEN_KEY);
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async (token: string, nextUser: AuthUser) => {
    setAccessToken(token);
    await secureStorage.set(TOKEN_KEY, token);
    setUser(nextUser);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      await persistSession(result.accessToken, result.user);
    },
    [persistSession],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await authApi.register({ name, email, password });
      await persistSession(result.accessToken, result.user);
    },
    [persistSession],
  );

  const signOut = useCallback(async () => {
    setAccessToken(null);
    await secureStorage.remove(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), isRestoring, signIn, signUp, signOut }),
    [user, isRestoring, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
