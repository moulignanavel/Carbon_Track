/**
 * userService.js
 * ─────────────────────────────────────────────────────────────
 * User API service.
 * Handles user profile operations.
 */

import axiosInstance from '@/config/axiosConfig';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * @typedef {{
 *   userId: number,
 *   username: string,
 *   email: string,
 *   role: string,
 *   organisationId?: number
 * }} UserProfile
 */

class UserService {
  /**
   * Get current user's profile
   * @returns {Promise<UserProfile>}
   */
  async getProfile() {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS_PROFILE);
    return data;
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile fields to update
   * @returns {Promise<UserProfile>}
   */
  async updateProfile(profileData) {
    const { data } = await axiosInstance.put(API_ENDPOINTS.USERS_UPDATE_PROFILE, profileData);
    return data;
  }

  /**
   * Get user by ID (admin only)
   * @param {number} userId
   * @returns {Promise<UserProfile>}
   */
  async getUserById(userId) {
    const { data } = await axiosInstance.get(`/users/${userId}`);
    return data;
  }

  /**
   * List all users (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array<UserProfile>>}
   */
  async listUsers(params = {}) {
    const { data } = await axiosInstance.get('/users', { params });
    return data;
  }
}

export default new UserService();
