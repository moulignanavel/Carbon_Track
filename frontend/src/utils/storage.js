/**
 * storage.js
 * ─────────────────────────────────────────────────────────────
 * Thin wrappers around localStorage / sessionStorage.
 *
 * "Remember Me" strategy:
 *   - When the user checks "Remember me", the token is stored in
 *     localStorage (persists across sessions).
 *   - When unchecked, the token is stored in sessionStorage
 *     (cleared when the browser tab is closed).
 *   - The user's email is always saved in localStorage so the
 *     login field can be pre-filled on the next visit.
 */

import { TOKEN_KEY, USER_KEY, REMEMBER_KEY } from '@/constants/api';

/* ─── Token ──────────────────────────────────────────────────── */

/**
 * Persist the JWT access token.
 * @param {string}  token
 * @param {boolean} remember  — true → localStorage, false → sessionStorage
 */
export function saveToken(token, remember = false) {
  // Always clear both stores first to avoid stale state
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

/** Retrieve the JWT access token from either storage. */
export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ??
    sessionStorage.getItem(TOKEN_KEY) ??
    null
  );
}

/** Remove the JWT access token from both storages. */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/* ─── User Info ──────────────────────────────────────────────── */

/**
 * Persist minimal user info.
 * Stored in localStorage (same persistence as token or not,
 * the user sees their name either way — low-sensitivity data).
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Retrieve persisted user info. */
export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Remove persisted user info. */
export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

/* ─── Remember Me ────────────────────────────────────────────── */

/**
 * Save the "remember me" email preference.
 * @param {string|null} email — null clears the preference.
 */
export function saveRememberedEmail(email) {
  if (email) {
    localStorage.setItem(REMEMBER_KEY, email);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

/** Retrieve the remembered email (or empty string). */
export function getRememberedEmail() {
  return localStorage.getItem(REMEMBER_KEY) ?? '';
}

/** Check whether an email is remembered. */
export function hasRememberedEmail() {
  return !!localStorage.getItem(REMEMBER_KEY);
}

/* ─── Composite helpers ──────────────────────────────────────── */

/** Clear all auth-related data from both storages. */
export function clearAuth() {
  removeToken();
  removeUser();
  // Do NOT remove the remembered email — it survives logout intentionally.
}
