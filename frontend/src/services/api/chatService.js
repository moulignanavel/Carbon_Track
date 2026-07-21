import axiosInstance from '@/config/axiosConfig';

class ChatService {
  /**
   * Send a message to the AI chatbot.
   * @param {string} message 
   * @returns {Promise<{ response: string }>}
   */
  async sendMessage(message) {
    const { data } = await axiosInstance.post('/chat', { message });
    return data;
  }
}

export default new ChatService();
