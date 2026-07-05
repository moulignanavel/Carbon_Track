/**
 * organisationApi.js
 * ─────────────────────────────────────────────────────────────
 * Organization API service — all /api/organisations/* calls.
 *
 * Backend contract (Spring Boot):
 *
 *   GET /api/organisations/{id}/dashboard
 *     Returns: {
 *       organisationId, organisationName,
 *       totalEmployees, totalEmissionsCO2,
 *       monthlyEmissions: [...],
 *       departmentComparison: [...],
 *       topEmployees: [...],
 *       metrics: {...},
 *       lastUpdated: number
 *     }
 *
 *   GET /api/organisations/{id}/csr-report
 *     Returns: CSR Report as text/plain
 */

import axiosInstance from './axiosInstance';

/* ─── Types (JSDoc) ──────────────────────────────────────────── */
/**
 * @typedef {{
 *   organisationId: number,
 *   organisationName: string,
 *   totalEmployees: number,
 *   totalEmissionsCO2: number,
 *   monthlyEmissions: Array,
 *   departmentComparison: Array,
 *   topEmployees: Array,
 *   metrics: Object,
 *   lastUpdated: number
 * }} OrganisationDashboardResponse
 */

/* ─── Get Dashboard Metrics ──────────────────────────────────── */
/**
 * Fetch organization dashboard metrics.
 *
 * @param {number} organisationId - Organization ID
 * @returns {Promise<OrganisationDashboardResponse>}
 */
export async function getDashboardMetrics(organisationId) {
  const { data } = await axiosInstance.get(`/organisations/${organisationId}/dashboard`);
  return data;
}

/* ─── Get CSR Report ─────────────────────────────────────────── */
/**
 * Fetch CSR (Corporate Social Responsibility) report.
 *
 * @param {number} organisationId - Organization ID
 * @returns {Promise<string>}
 */
export async function getCSRReport(organisationId) {
  const { data } = await axiosInstance.get(`/organisations/${organisationId}/csr-report`);
  return data;
}
