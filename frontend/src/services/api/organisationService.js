/**
 * organisationService.js
 * ─────────────────────────────────────────────────────────────
 * Organisation API service.
 * Handles organization dashboard and CSR reports.
 */

import axiosInstance from '@/config/axiosconfig';
import { API_ENDPOINTS } from '@/config/constants';

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
 * }} OrganisationDashboard
 */

class OrganisationService {
  /**
   * Get organization dashboard metrics
   * @param {number} organisationId - Organization ID
   * @returns {Promise<OrganisationDashboard>}
   */
  async getDashboardMetrics(organisationId) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ORG_DASHBOARD(organisationId));
    return data;
  }

  /**
   * Get CSR report for organization
   * @param {number} organisationId - Organization ID
   * @returns {Promise<string>}
   */
  async getCSRReport(organisationId) {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ORG_CSR_REPORT(organisationId));
    return data;
  }

  /**
   * Download CSR report as file
   * @param {number} organisationId - Organization ID
   * @param {string} filename - File name for download
   * @returns {Promise<void>}
   */
  async downloadCSRReport(organisationId, filename = 'csr-report.txt') {
    try {
      const report = await this.getCSRReport(organisationId);
      
      // Create blob and download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Failed to download CSR report:', error);
      throw error;
    }
  }

  /**
   * Get department metrics
   * @param {number} organisationId - Organization ID
   * @returns {Promise<Array>}
   */
  async getDepartmentMetrics(organisationId) {
    const data = await this.getDashboardMetrics(organisationId);
    return data.departmentComparison;
  }

  /**
   * Get top employees
   * @param {number} organisationId - Organization ID
   * @param {number} limit - Number of top employees
   * @returns {Promise<Array>}
   */
  async getTopEmployees(organisationId, limit = 10) {
    const data = await this.getDashboardMetrics(organisationId);
    return data.topEmployees.slice(0, limit);
  }
}

export default new OrganisationService();
