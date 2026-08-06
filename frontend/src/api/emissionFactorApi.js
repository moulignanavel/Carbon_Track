import axiosInstance from './axiosInstance';

/**
 * Fetch the read-only factor catalog used by backend activity calculations.
 *
 * @returns {Promise<Array<{
 *   id: number,
 *   activityType: string,
 *   unit: string,
 *   kgCo2ePerUnit: number,
 *   source: string,
 *   effectiveDate: string
 * }>>}
 */
export async function getEmissionFactors() {
  const { data } = await axiosInstance.get('/emission-factors');
  return Array.isArray(data) ? data : [];
}
