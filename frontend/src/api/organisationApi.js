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
export async function getDashboardMetrics() {
  const { data } = await axiosInstance.get('/organisations/me/dashboard');
  return data;
}

/* ─── Get CSR Report ─────────────────────────────────────────── */
/**
 * Fetch CSR (Corporate Social Responsibility) report.
 *
 * @param {number} organisationId - Organization ID
 * @returns {Promise<string>}
 */
export async function getCSRReport() {
  const { data } = await axiosInstance.get('/organisations/me/csr-report');
  return data;
}

export async function getPublicOrganisations() {
  const { data } = await axiosInstance.get('/organisations/public');
  return data;
}

export async function getOrganisationPortal() {
  const { data } = await axiosInstance.get('/org-portal/overview', {
    params: { _live: Date.now() },
    headers: { 'Cache-Control': 'no-cache' },
  });
  return data;
}
export async function updateOrganisationProfile(payload) {
  const { data } = await axiosInstance.put('/org-portal/organisation-profile', payload); return data;
}
export async function updateOrganisationAdminProfile(payload) {
  const { data } = await axiosInstance.put('/org-portal/my-profile', payload); return data;
}
export async function changeOrganisationPassword(payload) {
  await axiosInstance.post('/org-portal/change-password', payload);
}
export async function createOrganisationGoal(payload) {
  const { data } = await axiosInstance.post('/org-portal/goals', payload); return data;
}
export async function updateOrganisationGoal(id, payload) {
  const { data } = await axiosInstance.put(`/org-portal/goals/${id}`, payload); return data;
}
export async function deleteOrganisationGoal(id) {
  await axiosInstance.delete(`/org-portal/goals/${id}`);
}
export async function createOrganisationEmployee(payload) {
  const { data } = await axiosInstance.post('/org-portal/employees', payload); return data;
}
export async function updateOrganisationEmployee(id, payload) {
  const { data } = await axiosInstance.put(`/org-portal/employees/${id}`, payload); return data;
}
export async function createOrganisationActivity(payload) {
  const { data } = await axiosInstance.post('/org-portal/activities', payload); return data;
}
export async function updateOrganisationActivityVerification(id, status) {
  const { data } = await axiosInstance.patch(`/org-portal/activities/${id}/verification`, { status });
  return data;
}
