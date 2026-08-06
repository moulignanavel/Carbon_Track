/**
 * leaderboardApi.js
 * ─────────────────────────────────────────────────────────────
 * Leaderboard API service — all /api/leaderboard/* calls.
 *
 * Backend contract (Spring Boot):
 *
 *   GET /api/leaderboard
 *     Returns: {
 *       topThree: [{ rank, username, totalCO2Saved, badges, ... }],
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
export async function getCommunityLeaderboard(config = {}) {
  const { data } = await axiosInstance.get('/leaderboard', config);
  return data;
}

/* ─── Search Leaderboard ────────────────────────────────────── */
/**
 * Search the live global leaderboard by username.
 *
 * @param {string} query - Username search term
 * @param {number} [limit=50] - Maximum results to return
 * @returns {Promise<LeaderboardResponse>}
 */
export async function searchLeaderboard(query, limit = 50, config = {}) {
  const { data } = await axiosInstance.get('/leaderboard/search', {
    ...config,
    params: { q: query, limit },
  });
  return data;
}
