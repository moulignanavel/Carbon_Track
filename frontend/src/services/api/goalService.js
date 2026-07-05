/**
 * goalService.js
 * ─────────────────────────────────────────────────────────────
 * Goal API service.
 * Handles carbon reduction goals management.
 */

import axiosInstance from '@/config/axiosconfig';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * @typedef {{
 *   id: number,
 *   userId: number,
 *   title: string,
 *   targetEmissions: number,
 *   currentEmissions: number,
 *   startDate: string,
 *   targetDate: string,
 *   status: 'active' | 'completed' | 'failed',
 *   progress: number
 * }} Goal
 */

class GoalService {
  /**
   * Create new goal
   * @param {Object} goalData - Goal details
   * @returns {Promise<Goal>}
   */
  async createGoal(goalData) {
    const { data } = await axiosInstance.post(API_ENDPOINTS.GOALS_CREATE, {
      title: goalData.title,
      targetEmissions: goalData.targetEmissions,
      startDate: goalData.startDate,
      targetDate: goalData.targetDate,
    });
    return data;
  }

  /**
   * Get all goals for current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Array<Goal>>}
   */
  async getGoals(params = {}) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.GOALS, { params });
    return data;
  }

  /**
   * Get goal by ID
   * @param {number} id - Goal ID
   * @returns {Promise<Goal>}
   */
  async getGoalById(id) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.GOALS_UPDATE(id));
    return data;
  }

  /**
   * Update goal
   * @param {number} id - Goal ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Goal>}
   */
  async updateGoal(id, updates) {
    const { data } = await axiosInstance.put(API_ENDPOINTS.GOALS_UPDATE(id), updates);
    return data;
  }

  /**
   * Delete goal
   * @param {number} id - Goal ID
   * @returns {Promise<{ message: string }>}
   */
  async deleteGoal(id) {
    const { data } = await axiosInstance.delete(API_ENDPOINTS.GOALS_DELETE(id));
    return data;
  }

  /**
   * Get active goals
   * @returns {Promise<Array<Goal>>}
   */
  async getActiveGoals() {
    const { data } = await axiosInstance.get(API_ENDPOINTS.GOALS, {
      params: { status: 'active' },
    });
    return data;
  }

  /**
   * Get goal progress
   * @param {number} id - Goal ID
   * @returns {Promise<{ progress: number, currentEmissions: number }>}
   */
  async getGoalProgress(id) {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.GOALS}/${id}/progress`);
    return data;
  }
}

export default new GoalService();
