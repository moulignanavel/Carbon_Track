import axiosInstance from '@/config/axiosConfig';

class EcoScoreService {
  /**
   * Fetch current user Eco Credit Score (300 to 850)
   * @returns {Promise<{
   *   score: number,
   *   rating: string,
   *   color: string,
   *   percentile: number,
   *   breakdown: { emissionScore: number, streakScore: number, goalScore: number },
   *   tips: string[]
   * }>}
   */
  async getEcoScore() {
    const response = await axiosInstance.get('/eco-score');
    return response.data;
  }
}

export default new EcoScoreService();
