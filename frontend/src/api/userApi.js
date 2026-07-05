import axiosInstance from './axiosInstance';

/**
 * User API service
 *
 * NOTE: The UserController is currently empty on the backend.
 * These stubs follow the expected contract so the frontend is
 * ready to plug in as soon as the backend endpoints are wired up.
 *
 * Backend (planned):
 *   GET  /api/users/me          → UserProfileResponse
 *   PUT  /api/users/me          → UserProfileResponse
 */

/**
 * Fetch the currently authenticated user's profile.
 * @returns {Promise<UserProfile>}
 */
export async function getMyProfile() {
  const response = await axiosInstance.get('/users/me');
  return response.data;
}

/**
 * Update the currently authenticated user's profile.
 * @param {{ username?: string, email?: string, sustainabilityPreferences?: object }} data
 * @returns {Promise<UserProfile>}
 */
export async function updateMyProfile(data) {
  const response = await axiosInstance.put('/users/me', data);
  return response.data;
}

/**
 * @typedef {{
 *   id: number,
 *   username: string,
 *   email: string,
 *   role: string,
 *   organisation?: { id: number, name: string },
 *   sustainabilityPreferences?: object
 * }} UserProfile
 */
