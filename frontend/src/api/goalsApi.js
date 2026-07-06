import axiosInstance from './axiosInstance';

/**
 * Goals API service
 *
 * All endpoints require a valid JWT (handled by the Axios interceptor).
 * Every call is scoped to the currently authenticated user on the backend.
 *
 * GET    /api/goals        → GoalResponse[]
 * POST   /api/goals        → GoalResponse
 * PUT    /api/goals/{id}   → GoalResponse
 * DELETE /api/goals/{id}   → 204 No Content
 */

/**
 * Fetch all goals for the logged-in user.
 * @returns {Promise<GoalResponse[]>}
 */
export async function getGoals() {
  const response = await axiosInstance.get('/goals');
  return response.data;
}

/**
 * Create a new goal.
 * @param {{
 *   title: string,
 *   description?: string,
 *   category: string,
 *   period: string,
 *   targetKg: number,
 *   currentKg?: number,
 *   startDate: string,
 *   endDate: string
 * }} goalData
 * @returns {Promise<GoalResponse>}
 */
export async function createGoal(goalData) {
  const payload = {
    ...goalData,
    targetKg: goalData.target ?? goalData.targetKg,
    currentKg: goalData.current ?? goalData.currentKg ?? 0,
  };
  const response = await axiosInstance.post('/goals', payload);
  return response.data;
}

/**
 * Update an existing goal.
 * @param {number} id
 * @param {object} goalData
 * @returns {Promise<GoalResponse>}
 */
export async function updateGoalApi(id, goalData) {
  const payload = {
    ...goalData,
    targetKg: goalData.target ?? goalData.targetKg,
    currentKg: goalData.current ?? goalData.currentKg ?? 0,
  };
  const response = await axiosInstance.put(`/goals/${id}`, payload);
  return response.data;
}

/**
 * Delete a goal by id.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteGoalApi(id) {
  await axiosInstance.delete(`/goals/${id}`);
}

/**
 * @typedef {{
 *   id: number,
 *   userId: number,
 *   title: string,
 *   description: string,
 *   category: string,
 *   period: string,
 *   target: number,
 *   current: number,
 *   startDate: string,
 *   endDate: string,
 *   status: string,
 *   createdAt: string
 * }} GoalResponse
 */
