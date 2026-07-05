/**
 * authService.js
 * ─────────────────────────────────────────────────────────────
 * Authentication API service.
 * Handles login, register, password reset, and token management.
 */

import axiosInstance from '@/config/axiosConfig';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * @typedef {{
 *   accessToken: string,
 *   tokenType: string,
 *   userId: number,
 *   username: string,
 *   role: string
 * }} AuthResponse
 */

class AuthService {
  /**
   * Login with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<AuthResponse>}
   */
  async login(credentials) {
    const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH_LOGIN, {
      email: credentials.email,
      password: credentials.password,
    });
    return data;
  }

  /**
   * Register new user account
   * @param {Object} userData - { username, email, password, orgId? }
   * @returns {Promise<AuthResponse>}
   */
  async register(userData) {
    const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH_REGISTER, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      orgId: userData.orgId,
    });
    return data;
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<{ message: string }>}
   */
  async forgotPassword(email) {
    const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
      email,
    });
    return data;
  }

  /**
   * Reset password with token
   * @param {Object} resetData - { token, password }
   * @returns {Promise<{ message: string }>}
   */
  async resetPassword(resetData) {
    const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
      token: resetData.token,
      password: resetData.password,
    });
    return data;
  }

  /**
   * Verify JWT token is still valid
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async verifyToken(token) {
    try {
      // This endpoint doesn't exist yet but can be added to backend
      // For now, try a minimal request with the token
      await axiosInstance.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();
