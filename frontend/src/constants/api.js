/**
 * API Constants
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for every backend endpoint path and
 * every localStorage / sessionStorage key used by the app.
 *
 * The Vite dev-server proxy rewrites /api → http://localhost:8080
 * so all paths use the relative /api prefix (works in prod too
 * when the reverse-proxy is configured to match).
 */

export const API_BASE_URL = '/api';

/* ── Auth ────────────────────────────────────────────────────── */
export const AUTH_ENDPOINTS = {
  LOGIN:           `${API_BASE_URL}/auth/login`,
  REGISTER:        `${API_BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD:  `${API_BASE_URL}/auth/reset-password`,
  REFRESH_TOKEN:   `${API_BASE_URL}/auth/refresh`,
  LOGOUT:          `${API_BASE_URL}/auth/logout`,
};

/* ── User ────────────────────────────────────────────────────── */
export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/users/me`,
  UPDATE:  `${API_BASE_URL}/users/me`,
};

/* ── Activity ────────────────────────────────────────────────── */
export const ACTIVITY_ENDPOINTS = {
  LIST:   `${API_BASE_URL}/activity-logs`,
  CREATE: `${API_BASE_URL}/activity-logs`,
};

/* ── Storage Keys ────────────────────────────────────────────── */
export const TOKEN_KEY       = 'ct_access_token';
export const REFRESH_KEY     = 'ct_refresh_token';
export const USER_KEY        = 'ct_user';
export const REMEMBER_KEY    = 'ct_remember';   // persists email for "remember me"
export const THEME_KEY       = 'ct_theme';
