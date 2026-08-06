import axiosInstance from '@/config/axiosConfig';

class AlertService {
  /**
   * Fetch all alerts for current user
   * @returns {Promise<Array<{ id: number, alertType: string, message: string, triggerValue: number, isRead: boolean, createdAt: string }>>}
   */
  async getAlerts() {
    const response = await axiosInstance.get('/alerts');
    return response.data;
  }

  /**
   * Mark a single alert as read
   * @param {number} alertId
   */
  async markAsRead(alertId) {
    const response = await axiosInstance.post(`/alerts/${alertId}/read`);
    return response.data;
  }

  /**
   * Mark all alerts as read for current user
   */
  async markAllAsRead() {
    const response = await axiosInstance.post('/alerts/read-all');
    return response.data;
  }

  /**
   * Delete an alert
   * @param {number} alertId
   */
  async deleteAlert(alertId) {
    const response = await axiosInstance.delete(`/alerts/${alertId}`);
    return response.data;
  }

  /**
   * Trigger a test email alert to current user's email
   */
  async sendTestEmail() {
    const response = await axiosInstance.post('/alerts/test-email');
    return response.data;
  }
}

export default new AlertService();
