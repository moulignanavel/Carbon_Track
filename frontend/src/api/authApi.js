/**
 * authApi.js
 * ─────────────────────────────────────────────────────────────
 * Auth API service — the ONLY module that talks to /api/auth/*.
 *
 * All backend integration is encapsulated here.
 * Pages and context import these functions; they never import
 * axiosInstance directly for auth calls.
 *
 * Backend contract (Spring Boot, JWT stateless):
 *
 *   POST /api/auth/login
 *     Body:    { email, password }
 *     Returns: { accessToken, tokenType, userId, username, role }
 *
 *   POST /api/auth/register
 *     Body:    { username, email, password, orgId? }
 *     Returns: { accessToken, tokenType, userId, username, role }
 *
 *   POST /api/auth/forgot-password   (not yet implemented on backend)
 *     Body:    { email }
 *     Returns: { message }
 *
 *   POST /api/auth/reset-password    (not yet implemented on backend)
 *     Body:    { token, password }
 *     Returns: { message }
 */

import axiosInstance from './axiosInstance';

/* ─── Types (JSDoc) ──────────────────────────────────────────── */
/**
 * @typedef {{
 *   accessToken: string,
 *   tokenType:   string,
 *   userId:      number,
 *   username:    string,
 *   role:        string
 * }} AuthResponse
 */

/* ─── Login ──────────────────────────────────────────────────── */
/**
 * Authenticate an existing user.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<AuthResponse>}
 */
export async function loginUser(credentials) {
  const { data } = await axiosInstance.post('/auth/login', {
    email:    credentials.email,
    password: credentials.password,
  });
  return data;
}

/* ─── Register ───────────────────────────────────────────────── */
/**
 * Create a new user account.
 *
 * @param {{
 *   username: string,
 *   email:    string,
 *   password: string,
 *   orgId?:   number | null
 * }} payload
 * @returns {Promise<AuthResponse>}
 */
export async function registerUser(payload) {
  const { data } = await axiosInstance.post('/auth/register', {
    username: payload.username,
    email:    payload.email,
    password: payload.password,
    ...(payload.orgId != null ? { orgId: payload.orgId } : {}),
  });
  return data;
}

/* ─── Forgot Password ────────────────────────────────────────── */
/**
 * Request a password-reset email.
 *
 * Backend stub: endpoint not yet implemented.
 * Returns { message } on success; the UI shows a confirmation
 * regardless (security best practice — don't leak email existence).
 *
 * @param {{ email: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function requestPasswordReset(payload) {
  const { data } = await axiosInstance.post('/auth/forgot-password', {
    email: payload.email,
  });
  return data;
}

/* ─── Reset Password ─────────────────────────────────────────── */
/**
 * Submit a new password using the token from the reset email.
 *
 * @param {{ token: string, password: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(payload) {
  const { data } = await axiosInstance.post('/auth/reset-password', {
    token:    payload.token,
    password: payload.password,
  });
  return data;
}
