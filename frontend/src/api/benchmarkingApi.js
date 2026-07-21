/**
 * benchmarkingApi.js
 * ─────────────────────────────────────────────────────────────
 * Benchmarking API service — /api/benchmark/* calls.
 */

import axiosInstance from './axiosInstance';

/**
 * Fetch platform-wide emission averages by category.
 *
 * @returns {Promise<Array<{ category: string, totalEmissions: number }>>}
 */
export async function getPlatformAverages() {
  const { data } = await axiosInstance.get('/benchmark/averages');
  return data;
}

/**
 * Fetch current user's percentile rank compared to the platform.
 *
 * @returns {Promise<{ percentile: number }>}
 */
export async function getUserPercentile() {
  const { data } = await axiosInstance.get('/benchmark/percentile');
  return data;
}
