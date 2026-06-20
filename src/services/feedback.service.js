import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://110.40.158.203:8080/api';

const feedbackService = {
  // 创建反馈
  createFeedback: async (feedbackData) => {
    try {
      const response = await axios.post(`${API_URL}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      console.error('创建反馈失败:', error);
      throw error;
    }
  },

  // 获取用户的所有反馈
  getUserFeedbacks: async (username) => {
    try {
      const response = await axios.get(`${API_URL}/feedback/user/${username}`);
      return response.data;
    } catch (error) {
      console.error('获取用户反馈失败:', error);
      throw error;
    }
  },

  // 获取特定反馈
  getFeedbackById: async (feedbackId) => {
    try {
      const response = await axios.get(`${API_URL}/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error('获取反馈详情失败:', error);
      throw error;
    }
  },

  // 更新反馈状态
  updateFeedbackStatus: async (feedbackId, status) => {
    try {
      const response = await axios.put(`${API_URL}/feedback/${feedbackId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('更新反馈状态失败:', error);
      throw error;
    }
  },

  // 添加管理员回复
  addAdminResponse: async (feedbackId, response) => {
    try {
      const response = await axios.put(`${API_URL}/feedback/${feedbackId}/response`, null, {
        params: { response }
      });
      return response.data;
    } catch (error) {
      console.error('添加管理员回复失败:', error);
      throw error;
    }
  },

  // 删除反馈
  deleteFeedback: async (feedbackId) => {
    try {
      await axios.delete(`${API_URL}/feedback/${feedbackId}`);
    } catch (error) {
      console.error('删除反馈失败:', error);
      throw error;
    }
  }
};

export default feedbackService; 