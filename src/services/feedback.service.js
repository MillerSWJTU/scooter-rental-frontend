import api from './api';

const feedbackService = {
  // 创建反馈
  createFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('创建反馈失败:', error);
      throw error;
    }
  },

  // 获取所有反馈（管理端）
  getAllFeedbacks: async () => {
    try {
      const response = await api.get('/feedback');
      return response.data;
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      throw error;
    }
  },

  // 获取用户的所有反馈
  getUserFeedbacks: async (username) => {
    try {
      const response = await api.get(`/feedback/user/${username}`);
      return response.data;
    } catch (error) {
      console.error('获取用户反馈失败:', error);
      throw error;
    }
  },

  // 获取特定反馈
  getFeedbackById: async (feedbackId) => {
    try {
      const response = await api.get(`/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error('获取反馈详情失败:', error);
      throw error;
    }
  },

  // 更新反馈状态
  updateFeedbackStatus: async (feedbackId, status) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('更新反馈状态失败:', error);
      throw error;
    }
  },

  // 管理员回复反馈
  updateFeedback: async (feedbackId, feedbackData) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}/response`, null, {
        params: { response: feedbackData.adminResponse }
      });
      return response.data;
    } catch (error) {
      console.error('回复反馈失败:', error);
      throw error;
    }
  },

  // 删除反馈
  deleteFeedback: async (feedbackId) => {
    try {
      await api.delete(`/feedback/${feedbackId}`);
    } catch (error) {
      console.error('删除反馈失败:', error);
      throw error;
    }
  }
};

export default feedbackService;
