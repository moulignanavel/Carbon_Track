import axiosInstance from '@/config/axiosConfig';

class RecommendationsService {
  async getRecommendations() {
    const { data } = await axiosInstance.get('/analytics/recommendations');
    return data;
  }
}

export default new RecommendationsService();
