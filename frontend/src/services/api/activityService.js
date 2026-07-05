/**
 * activityService.js
 * ─────────────────────────────────────────────────────────────
 * Activity API service.
 * Handles logging, retrieving, and managing carbon reduction activities.
 */

import axiosInstance from '@/config/axiosConfig';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * @typedef {{
 *   id: number,
 *   userId: number,
 *   category: string,
 *   activityType: string,
 *   amount: number,
 *   unit: string,
 *   calculatedEmissions: number,
 *   logDate: string
 * }} ActivityLog
 */

class ActivityService {
  /**
   * Create new activity log
   * @param {Object} activityData - Activity details
   * @returns {Promise<ActivityLog>}
   */
  async createActivity(activityData) {
    const { data } = await axiosInstance.post(API_ENDPOINTS.ACTIVITY_LOGS_CREATE, {
      category: activityData.category,
      activityType: activityData.activityType,
      amount: activityData.amount,
      unit: activityData.unit,
      calculatedEmissions: activityData.calculatedEmissions,
      logDate: activityData.logDate,
    });
    return data;
  }

  /**
   * Get all activity logs for current user
   * @param {Object} params - Query parameters (limit, offset, sorting)
   * @returns {Promise<Array<ActivityLog>>}
   */
  async getActivities(params = {}) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ACTIVITY_LOGS, { params });
    return data;
  }

  /**
   * Get activity log by ID
   * @param {number} id - Activity log ID
   * @returns {Promise<ActivityLog>}
   */
  async getActivityById(id) {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.ACTIVITY_LOGS}/${id}`);
    return data;
  }

  /**
   * Update activity log
   * @param {number} id - Activity log ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<ActivityLog>}
   */
  async updateActivity(id, updates) {
    const { data } = await axiosInstance.put(
      `${API_ENDPOINTS.ACTIVITY_LOGS}/${id}`,
      updates
    );
    return data;
  }

  /**
   * Delete activity log
   * @param {number} id - Activity log ID
   * @returns {Promise<{ message: string }>}
   */
  async deleteActivity(id) {
    const { data } = await axiosInstance.delete(API_ENDPOINTS.ACTIVITY_LOGS_DELETE(id));
    return data;
  }

  /**
   * Get activities by category
   * @param {string} category - Activity category
   * @returns {Promise<Array<ActivityLog>>}
   */
  async getActivitiesByCategory(category) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ACTIVITY_LOGS, {
      params: { category },
    });
    return data;
  }

  /**
   * Get activities for date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array<ActivityLog>>}
   */
  async getActivitiesForDateRange(startDate, endDate) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ACTIVITY_LOGS, {
      params: { startDate, endDate },
    });
    return data;
  }
}

export default new ActivityService();
