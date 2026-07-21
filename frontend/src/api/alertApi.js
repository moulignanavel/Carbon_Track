import axiosInstance from './axiosInstance';

/**
 * Fetch all alerts for the logged-in user.
 * @returns {Promise<AlertResponse[]>}
 */
export async function getAlerts() {
  const response = await axiosInstance.get('/alerts');
  return response.data;
}

/**
 * Mark a single alert as read.
 * @param {number} alertId
 * @returns {Promise<AlertResponse>}
 */
export async function markAlertAsRead(alertId) {
  const response = await axiosInstance.post(`/alerts/${alertId}/read`);
  return response.data;
}

/**
 * Mark all alerts as read.
 * @returns {Promise<void>}
 */
export async function markAllAlertsAsRead() {
  await axiosInstance.post('/alerts/read-all');
}

/**
 * Delete a single alert.
 * @param {number} alertId
 * @returns {Promise<void>}
 */
export async function deleteAlert(alertId) {
  await axiosInstance.delete(`/alerts/${alertId}`);
}
