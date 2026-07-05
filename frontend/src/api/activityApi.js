import axiosInstance from './axiosInstance';

/**
 * Activity Logs API service
 *
 * Backend: GET /api/activity-logs  — returns List<ActivityLog>
 *          POST /api/activity-logs — accepts ActivityLog body, returns ActivityLog
 *
 * Both endpoints require a valid JWT (handled by the Axios interceptor).
 */

/**
 * Fetch all activity logs.
 * @returns {Promise<ActivityLog[]>}
 */
export async function getActivityLogs() {
  const response = await axiosInstance.get('/activity-logs');
  return response.data;
}

/**
 * Create a new activity log entry.
 *
 * @param {{
 *   userId: number,
 *   category: string,
 *   activityType: string,
 *   amount: number,
 *   unit: string,
 *   calculatedEmissions: number,
 *   logDate: string  // ISO date "YYYY-MM-DD"
 * }} logData
 * @returns {Promise<ActivityLog>}
 */
export async function createActivityLog(logData) {
  const response = await axiosInstance.post('/activity-logs', logData);
  return response.data;
}

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
