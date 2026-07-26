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
 * Normalize a raw ActivityLog from the backend.
 * Jackson serialises Java LocalDate as [year, month, day] array by default.
 * We flatten that to an ISO string so the rest of the frontend can treat
 * logDate as a plain "YYYY-MM-DD" string consistently.
 */
function normalizeLog(log) {
  if (!log) return log;

  let logDate = log.logDate ?? log.date;
  if (Array.isArray(logDate)) {
    const [y, m, d] = logDate;
    logDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return {
    ...log,
    logDate,
    calculatedEmissions: Number(log.calculatedEmissions ?? log.co2eKg ?? 0),
    amount: Number(log.amount ?? log.quantity ?? 0),
  };
}

/**
 * Fetch all activity logs.
 * @returns {Promise<ActivityLog[]>}
 */
export async function getActivityLogs() {
  const response = await axiosInstance.get('/activity-logs');
  return (response.data ?? []).map(normalizeLog);
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
  const rawCat = (logData.category || '').toLowerCase().trim();
  const category = rawCat.replace(/[\s_]/g, '');
  let endpoint = '/activity-logs/transport';
  let payload = {};
  const qty = parseFloat(logData.amount || logData.quantity || 1);
  const unit = logData.unit || 'items';
  const now = new Date();
  const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const logDate = logData.logDate || defaultDate;

  if (category === 'transport') {
    endpoint = '/activity-logs/transport';
    payload = { transportMode: logData.activityType, distance: qty, unit: unit || 'km', logDate, notes: logData.notes };
  } else if (category === 'electricity' || category === 'energy' || category === 'homeenergy') {
    endpoint = '/activity-logs/electricity';
    payload = { energySource: logData.activityType, kwhConsumed: qty, unit: unit || 'kWh', logDate, notes: logData.notes };
  } else if (category === 'food' || category === 'diet' || category === 'meal') {
    endpoint = '/activity-logs/food';
    payload = { mealType: logData.activityType, amount: qty, unit: unit || 'servings', logDate, notes: logData.notes };
  } else {
    // Shopping / Retail / Other
    endpoint = '/activity-logs/shopping';
    payload = { productCategory: logData.activityType || 'other', spendAmount: qty, currency: unit || 'items', logDate, notes: logData.notes };
  }

  const response = await axiosInstance.post(endpoint, payload);
  // Normalize before returning so the freshly-added log matches the same
  // shape as logs fetched from GET /activity-logs — no refresh needed.
  return normalizeLog(response.data);
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
