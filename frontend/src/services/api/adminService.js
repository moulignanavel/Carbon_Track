import axiosInstance from '@/api/axiosInstance';

class AdminService {
  /**
   * Get platform stats (users, logs, total emissions, admins)
   */
  async getStats() {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  }

  /**
   * Get list of all registered users for admin dashboard
   */
  async getUsers() {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  }

  /**
   * Update a user's role ('USER' | 'ADMIN')
   */
  async updateUserRole(userId, role) {
    const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Get all activity logs for a specific user ID (Admin inspection)
   */
  async getUserLogs(userId) {
    const response = await axiosInstance.get(`/admin/users/${userId}/logs`);
    return response.data;
  }

  /**
   * Get system emission factors
   */
  async getEmissionFactors() {
    const response = await axiosInstance.get('/admin/emission-factors');
    return response.data;
  }

  /**
   * Update an emission factor override
   */
  async updateEmissionFactor(id, kgCo2ePerUnit) {
    const response = await axiosInstance.put(`/admin/emission-factors/${id}`, { kgCo2ePerUnit });
    return response.data;
  }

  async getOrganisations(search = '') {
    const response = await axiosInstance.get('/admin/organisations', { params: { search } });
    return response.data;
  }

  async createOrganisation(name) {
    const response = await axiosInstance.post('/admin/organisations', { name });
    return response.data;
  }

  async updateOrganisation(id, name) {
    const response = await axiosInstance.put(`/admin/organisations/${id}`, { name });
    return response.data;
  }

  async setOrganisationActive(id, active) {
    const response = await axiosInstance.patch(`/admin/organisations/${id}/status`, { active });
    return response.data;
  }

  async getOrganisationMembers(id) {
    const response = await axiosInstance.get(`/admin/organisations/${id}/members`);
    return response.data;
  }
}

export default new AdminService();
