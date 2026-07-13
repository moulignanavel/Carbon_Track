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
  const category = logData.category.toLowerCase();
  let endpoint = `/activity-logs/${category}`;
  let payload = {};
  const qty = parseFloat(logData.amount || logData.quantity);

  switch (category) {
    case 'transport':
      payload = { transportMode: logData.activityType, distance: qty, logDate: logData.logDate, notes: logData.notes };
      break;
    case 'energy':
    case 'electricity':
      payload = { energySource: logData.activityType, kwhConsumed: qty, logDate: logData.logDate, notes: logData.notes };
      // Override endpoint to use electricity since energy is just a UI alias
      endpoint = '/activity-logs/electricity';
      break;
    case 'food':
      payload = { mealType: logData.activityType, amount: qty, unit: logData.unit || 'servings', logDate: logData.logDate, notes: logData.notes };
      break;
    case 'shopping':
      payload = { productCategory: logData.activityType, spendAmount: qty, currency: logData.unit || 'USD', logDate: logData.logDate, notes: logData.notes };
      break;
    default:
      throw new Error("Invalid category: " + category);
  }

  const response = await axiosInstance.post(endpoint, payload);
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
