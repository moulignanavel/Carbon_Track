/**
 * leaderboardService.js
 * ─────────────────────────────────────────────────────────────
 * Leaderboard API service.
 * Handles community leaderboard and rankings.
 */

import axiosInstance from '@/config/axiosconfig';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * @typedef {{
 *   rank: number,
 *   userId: number,
 *   username: string,
 *   totalCO2Saved: number,
 *   activityCount: number,
 *   badges: Array<string>,
 *   isCurrentUser: boolean
 * }} LeaderboardUser
 */

/**
 * @typedef {{
 *   topThree: Array<LeaderboardUser>,
 *   all: Array<LeaderboardUser>,
 *   currentUser: LeaderboardUser,
 *   timestamp: number
 * }} LeaderboardResponse
 */

class LeaderboardService {
  /**
   * Get community leaderboard (top 50)
   * @returns {Promise<LeaderboardResponse>}
   */
  async getCommunityLeaderboard() {
    const { data } = await axiosInstance.get(API_ENDPOINTS.LEADERBOARD_COMMUNITY);
    return data;
  }

  /**
   * Search leaderboard by username or email
   * @param {string} query - Search term
   * @param {Object} params - Additional query parameters
   * @returns {Promise<LeaderboardResponse>}
   */
  async searchLeaderboard(query, params = {}) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.LEADERBOARD_SEARCH, {
      params: {
        q: query,
        ...params,
      },
    });
    return data;
  }

  /**
   * Get top N users
   * @param {number} limit - Number of top users to return
   * @returns {Promise<Array<LeaderboardUser>>}
   */
  async getTopUsers(limit = 10) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.LEADERBOARD_COMMUNITY, {
      params: { limit },
    });
    return data.all.slice(0, limit);
  }

  /**
   * Get current user's rank
   * @returns {Promise<LeaderboardUser>}
   */
  async getCurrentUserRank() {
    const { data } = await axiosInstance.get(API_ENDPOINTS.LEADERBOARD_COMMUNITY);
    return data.currentUser;
  }
}

export default new LeaderboardService();
