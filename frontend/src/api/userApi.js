import axiosInstance from './axiosInstance';
import axios from 'axios';
import { env } from '@/config/env';
import { getToken } from '@/utils/storage';

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
  const response = await axiosInstance.get('/users/profile');
  return response.data;
}

/**
 * Update the currently authenticated user's profile.
 * @param {{ username?: string, email?: string, sustainabilityPreferences?: object }} data
 * @returns {Promise<UserProfile>}
 */
export async function updateMyProfile(data) {
  const response = await axiosInstance.put('/users/profile', data);
  return response.data;
}

/**
 * Upload user avatar
 * @param {File} file
 * @returns {Promise<UserProfile>}
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = getToken();
  const response = await axios.post(`${env.api.baseURL}/api/users/me/avatar`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`
      // Not setting Content-Type lets the browser/axios automatically set multipart/form-data with the correct boundary
    }
  });
  return response.data;
}

/**
 * Change the user's password.
 * @param {{ currentPassword: string, newPassword: string }} data
 * @returns {Promise<void>}
 */
export async function changeUserPassword(data) {
  const response = await axiosInstance.post('/users/change-password', data);
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
