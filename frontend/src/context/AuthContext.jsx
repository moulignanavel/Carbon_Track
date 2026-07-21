/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global authentication state provider.
 *
 * Exposed values:
 *   user          — { userId, username, role } | null
 *   token         — JWT string | null
 *   isLoggedIn    — boolean
 *   isAdmin       — boolean
 *   isInitialising— boolean  (true during hydration from storage)
 *   login()       — async ({ email, password, rememberMe }) => void
 *   register()    — async ({ username, email, password, orgId? }) => void
 *   logout()      — void
 */

import {
  createContext, useContext, useState,
  useCallback, useMemo, useEffect,
} from 'react';
import { loginUser, registerUser } from '@/api/authApi';
import {
  saveToken, saveUser, clearAuth,
  getToken, getUser,
  saveRememberedEmail,
} from '@/utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Hydrate from storage on first render
  const [token,          setToken]          = useState(() => getToken());
  const [user,           setUser]           = useState(() => getUser());
  const [isInitialising, setIsInitialising] = useState(true);

  // One-time hydration flag — prevents flash of unauthenticated UI
  useEffect(() => {
    setIsInitialising(false);
  }, []);

  // Fetch full profile (badges, avatar) when token is present
  const fetchProfile = useCallback(() => {
    if (token) {
      import('@/api/userApi').then(({ getMyProfile }) => {
        getMyProfile().then(data => {
          setUser((prev) => {
            const updated = { ...prev, avatarUrl: data.avatarUrl, badges: data.badges, role: data.role };
            saveUser(updated);
            return updated;
          });
        }).catch(err => console.error("Failed to fetch full profile", err));
      });
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();

    const handleActivityLogged = () => {
      fetchProfile();
    };
    const handleLeaderboardViewed = () => {
      setTimeout(fetchProfile, 800);
    };

    window.addEventListener('activity-logged', handleActivityLogged);
    window.addEventListener('leaderboard-viewed', handleLeaderboardViewed);
    return () => {
      window.removeEventListener('activity-logged', handleActivityLogged);
      window.removeEventListener('leaderboard-viewed', handleLeaderboardViewed);
    };
  }, [token, fetchProfile]);

  /* ── helpers ───────────────────────────────────────────────── */
  const applyAuth = useCallback((authResponse, remember = false) => {
    const { accessToken, userId, username, role } = authResponse;
    saveToken(accessToken, remember);
    const userInfo = { userId, username, role };
    saveUser(userInfo);
    setToken(accessToken);
    setUser(userInfo);
  }, []);

  /* ── login ─────────────────────────────────────────────────── */
  const login = useCallback(async ({ email, password, rememberMe = false }) => {
    const data = await loginUser({ email, password });
    applyAuth(data, rememberMe);

    // Persist or clear remembered email based on checkbox
    saveRememberedEmail(rememberMe ? email : null);
  }, [applyAuth]);

  /* ── register ──────────────────────────────────────────────── */
  const register = useCallback(async ({ username, email, password, orgId }) => {
    const data = await registerUser({ username, email, password, orgId });
    // New accounts always get session storage (no remember-me on signup)
    applyAuth(data, false);
  }, [applyAuth]);

  /* ── logout ────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  /* ── update user profile info ──────────────────────────────── */
  const updateUser = useCallback((newUserInfo) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserInfo };
      saveUser(updated);
      return updated;
    });
  }, []);

  /* ── context value ─────────────────────────────────────────── */
  const value = useMemo(() => ({
    user,
    token,
    isLoggedIn:     !!token,
    isAdmin:        user?.role === 'ADMIN',
    isInitialising,
    login,
    register,
    logout,
    updateUser,
    applyAuth,
  }), [user, token, isInitialising, login, register, logout, updateUser, applyAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** @throws if used outside <AuthProvider> */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
