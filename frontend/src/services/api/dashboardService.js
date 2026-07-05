/**
 * dashboardService.js
 * ─────────────────────────────────────────────────────────────
 * Dashboard API service.
 * Handles user dashboard metrics and overview data.
 */

import axiosInstance from '@/config/axiosConfig';

/**
 * @typedef {{
 *   totalActivities: number,
 *   totalEmissions: number,
 *   monthlyTrend: Array,
 *   recentActivities: Array,
 *   goals: Array,
 *   recommendations: Array
 * }} DashboardData
 */

class DashboardService {
  /**
   * Get dashboard overview data
   * @returns {Promise<DashboardData>}
   */
  async getDashboardOverview() {
    const { data } = await axiosInstance.get('/dashboard');
    return data;
  }

  /**
   * Get monthly emissions trend (last 12 months)
   * @returns {Promise<Array>}
   */
  async getMonthlyTrend() {
    const { data } = await axiosInstance.get('/dashboard/monthly-trend');
    return data;
  }

  /**
   * Get recent user activities
   * @param {Object} params - Query parameters (limit, offset, etc.)
   * @returns {Promise<Array>}
   */
  async getRecentActivities(params = {}) {
    const { data } = await axiosInstance.get('/dashboard/recent-activities', { params });
    return data;
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>}
   */
  async getStatistics() {
    const { data } = await axiosInstance.get('/dashboard/statistics');
    return data;
  }
}

export default new DashboardService();
