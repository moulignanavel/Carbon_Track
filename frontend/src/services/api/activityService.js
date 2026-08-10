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
   * Log transport activity to dedicated endpoint
   * @param {Object} data - { transportMode, distance, unit, logDate, notes }
   * @returns {Promise<ActivityLog>}
   */
  async logTransportActivity(data) {
    const { data: res } = await axiosInstance.post(API_ENDPOINTS.ACTIVITY_LOGS_TRANSPORT, {
      transportMode: data.transportMode,
      distance: Number(data.distance),
      unit: data.unit || 'km',
      logDate: data.logDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
    });
    return res;
  }

  /**
   * Log electricity activity to dedicated endpoint
   * @param {Object} data - { energySource, kwhConsumed, unit, logDate, notes }
   * @returns {Promise<ActivityLog>}
   */
  async logElectricityActivity(data) {
    const { data: res } = await axiosInstance.post(API_ENDPOINTS.ACTIVITY_LOGS_ELECTRICITY, {
      energySource: data.energySource || 'grid',
      kwhConsumed: Number(data.kwhConsumed || data.amount || 0),
      unit: data.unit || 'kWh',
      logDate: data.logDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
    });
    return res;
  }

  /**
   * Create new activity log
   * @param {Object} activityData - Activity details
   * @returns {Promise<ActivityLog>}
   */
  async createActivity(activityData) {
    const qty = Number(activityData.amount ?? activityData.quantity ?? 1);
    const { data } = await axiosInstance.post(API_ENDPOINTS.ACTIVITY_LOGS_CREATE, {
      category: activityData.category,
      activityType: activityData.activityType,
      amount: qty,
      quantity: qty,
      unit: activityData.unit,
      logDate: activityData.logDate,
      notes: activityData.notes,
    });
    return data;
  }

  /**
   * Scan receipt or utility bill using AI Vision
   * @param {File} file - Receipt / utility bill image file
   * @returns {Promise<Object>} Extracted activity fields
   */
  async scanReceipt(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post(API_ENDPOINTS.ACTIVITY_LOGS_SCAN, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
