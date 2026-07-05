/**
 * leaderboardApi.js
 * ─────────────────────────────────────────────────────────────
 * Leaderboard API service — all /api/leaderboard/* calls.
 *
 * Backend contract (Spring Boot):
 *
 *   GET /api/leaderboard
 *     Returns: {
 *       topThree: [{ rank, userId, username, totalCO2Saved, badges, ... }],
 *       all: [{ ... }],  // up to 50 users
 *       currentUser: { ... },
 *       timestamp: number
 *     }
 *
 *   GET /api/leaderboard/search?q={query}&limit={limit}
 *     Returns: Same structure filtered by search
 */

import axiosInstance from './axiosInstance';

/* ─── Types (JSDoc) ──────────────────────────────────────────── */
/**
 * @typedef {{
 *   rank: number,
 *   userId: number,
 *   username: string,
 *   totalCO2Saved: number,
 *   activityCount: number,
 *   badges: string[],
 *   isCurrentUser: boolean
 * }} LeaderboardUser
 */

/**
 * @typedef {{
 *   topThree: LeaderboardUser[],
 *   all: LeaderboardUser[],
 *   currentUser: LeaderboardUser | null,
 *   timestamp: number
 * }} LeaderboardResponse
 */

/* ─── Get Community Leaderboard ──────────────────────────────── */
/**
 * Fetch the full community leaderboard (top 50 users ranked by CO₂ saved).
 *
 * @returns {Promise<LeaderboardResponse>}
 */
export async function getCommunityLeaderboard() {
  const { data } = await axiosInstance.get('/leaderboard');
  return data;
}

/* ─── Search Leaderboard ────────────────────────────────────── */
/**
 * Search leaderboard by username or email.
 *
 * @param {string} query - Search term (username or email)
 * @param {number} [limit=50] - Maximum results to return
 * @returns {Promise<LeaderboardResponse>}
 */
export async function searchLeaderboard(query, limit = 50) {
  const { data } = await axiosInstance.get('/leaderboard/search', {
    params: { q: query, limit },
  });
  return data;
}
