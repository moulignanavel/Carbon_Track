import axiosInstance from '@/config/axiosConfig';

class AiAssistantService {
  /**
   * Send a chat message to CarbonBot AI assistant
   * @param {string} message
   * @param {Array<{role: string, text: string}>} [history]
   * @returns {Promise<{reply: string, suggestions: string[]}>}
   */
  async sendMessage(message, history = []) {
    const response = await axiosInstance.post('/ai/chat', { message, history });
    return response.data;
  }

  /**
   * Get starter suggestion prompts for chat
   * @returns {Promise<string[]>}
   */
  async getSuggestions() {
    const response = await axiosInstance.get('/ai/suggestions');
    return response.data;
  }
}

export default new AiAssistantService();
