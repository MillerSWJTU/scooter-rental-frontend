import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AUTH_CONFIG } from '../config';

const API_URL = process.env.REACT_APP_API_URL || 'http://110.40.158.203:8080/api';

/**
 * AdminService - Handles administrative operations for the scooter rental system
 * This service focuses on operations that administrators would perform
 * User-facing operations are handled by scooterService
 */

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear user data and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const adminService = {
  // 获取所有用户
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // 创建用户
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // 更新用户
  updateUser: async (username, userData) => {
    try {
      const response = await api.put(`/users/${username}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // 删除用户
  deleteUser: async (username) => {
    try {
      await api.delete(`/users/${username}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // 切换用户状态
  toggleUserStatus: async (username, status) => {
    try {
      const response = await api.put(`/users/${username}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  // 获取所有滑板车
  getScooters: async () => {
    try {
      const response = await api.get('/scooters');
      return response.data;
    } catch (error) {
      console.error('Error fetching scooters:', error);
      throw error;
    }
  },

  // 创建滑板车
  createScooter: async (scooterData) => {
    try {
      if (!scooterData) {
        throw new Error('Missing scooter data for creation');
      }

      // 检查必填字段
      if (!scooterData.model) {
        throw new Error('Scooter model is required');
      }

      // 确保重要字段的数据类型正确
      const sanitizedData = {
        ...scooterData
      };

      // 确保数值字段是数字类型
      sanitizedData.batteryLevel = parseInt(scooterData.batteryLevel) || 100;
      sanitizedData.latitude = parseFloat(scooterData.latitude) || 0;
      sanitizedData.longitude = parseFloat(scooterData.longitude) || 0;
      sanitizedData.pricePerHour = parseFloat(scooterData.pricePerHour) || 0;
      sanitizedData.pricePerFourHours = parseFloat(scooterData.pricePerFourHours) || 0;
      sanitizedData.pricePerDay = parseFloat(scooterData.pricePerDay) || 0;
      sanitizedData.pricePerWeek = parseFloat(scooterData.pricePerWeek) || 0;

      // 确保状态是有效的枚举值 (Backend uses AVAILABLE, RENTED, MAINTENANCE, OFFLINE)
      if (scooterData.status && !['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OFFLINE'].includes(scooterData.status.toUpperCase())) {
        sanitizedData.status = 'AVAILABLE'; // Default to AVAILABLE
      } else if (scooterData.status) {
        sanitizedData.status = scooterData.status.toUpperCase(); // Ensure uppercase
      }

      console.log('Making scooter creation request with data:', sanitizedData);
      
      const response = await api.post('/scooters', sanitizedData);
      
      if (!response || !response.data) {
        throw new Error('No data returned from scooter creation request');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating scooter:', error);
      throw error;
    }
  },

  // 更新滑板车
  updateScooter: async (scooterId, scooterData) => {
    try {
      if (!scooterId) {
        throw new Error('Missing scooter ID for update');
      }

      // 确保重要字段的数据类型正确
      const sanitizedData = {
        ...scooterData
      };

      // 确保数值字段是数字类型
      if (scooterData.batteryLevel !== undefined) {
        sanitizedData.batteryLevel = parseInt(scooterData.batteryLevel) || 0;
      }
      if (scooterData.latitude !== undefined) {
        sanitizedData.latitude = parseFloat(scooterData.latitude) || 0;
      }
      if (scooterData.longitude !== undefined) {
        sanitizedData.longitude = parseFloat(scooterData.longitude) || 0;
      }

      // 确保状态是有效的枚举值 (Backend uses AVAILABLE, RENTED, MAINTENANCE, OFFLINE)
      if (scooterData.status && !['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OFFLINE'].includes(scooterData.status.toUpperCase())) {
        sanitizedData.status = 'AVAILABLE'; // Default to AVAILABLE
      } else if (scooterData.status) {
        sanitizedData.status = scooterData.status.toUpperCase(); // Ensure uppercase
      }

      console.log(`Making scooter update request to /scooters/${scooterId} with data:`, sanitizedData);
      
      const response = await api.put(`/scooters/${scooterId}`, sanitizedData);
      
      if (!response || !response.data) {
        throw new Error('No data returned from scooter update request');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating scooter:', error);
      throw error;
    }
  },

  // 删除滑板车
  deleteScooter: async (scooterId) => {
    try {
      await api.delete(`/scooters/${scooterId}`);
    } catch (error) {
      console.error('Error deleting scooter:', error);
      throw error;
    }
  },

  // 更新滑板车状态 - 管理员专用
  updateScooterStatus: async (scooterId, status) => {
    try {
      const response = await api.put(`/scooters/${scooterId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating scooter status:', error);
      throw error;
    }
  },

  // 更新滑板车价格
  updateScooterPrice: async (priceData) => {
    try {
      if (!priceData || !priceData.id) {
        throw new Error('Missing scooter ID for price update');
      }

      // 确保所有价格字段都是数字
      const sanitizedPriceData = {
        pricePerHour: parseFloat(priceData.pricePerHour) || 0,
        pricePerFourHours: parseFloat(priceData.pricePerFourHours) || 0,
        pricePerDay: parseFloat(priceData.pricePerDay) || 0,
        pricePerWeek: parseFloat(priceData.pricePerWeek) || 0
      };

      console.log(`Making price update request to /scooters/${priceData.id}/price with data:`, sanitizedPriceData);
      
      const response = await api.put(`/scooters/${priceData.id}/price`, sanitizedPriceData);
      
      if (!response || !response.data) {
        throw new Error('No data returned from price update request');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating scooter price:', error);
      throw error;
    }
  },

  // Get all reported issues
  getAllIssues: async () => {
    const response = await api.get('/issues');
    return response.data;
  },

  // Update issue status
  updateIssueStatus: async (issueId, statusData) => {
    const response = await api.put(`/issues/${issueId}/status`, statusData);
    return response.data;
  },

  // Respond to issue
  respondToIssue: async (issueId, responseData) => {
    const response = await api.post(`/issues/${issueId}/response`, responseData);
    return response.data;
  },

  // Get pricing settings
  getPricingSettings: async () => {
    const response = await api.get('/pricing');
    return response.data;
  },

  // Update pricing settings
  updatePricingSettings: async (pricingData) => {
    const response = await api.put('/pricing', pricingData);
    return response.data;
  },

  // Create discount
  createDiscount: async (discountData) => {
    const response = await api.post('/discounts', discountData);
    return response.data;
  },

  // Update discount
  updateDiscount: async (discountId, discountData) => {
    const response = await api.put(`/discounts/${discountId}`, discountData);
    return response.data;
  },

  // Delete discount
  deleteDiscount: async (discountId) => {
    const response = await api.delete(`/discounts/${discountId}`);
    return response.data;
  },

  // Get revenue statistics
  getRevenueStats: async (period) => {
    const response = await api.get('/statistics/revenue', {
      params: { period }
    });
    return response.data;
  },

  // Get usage statistics
  getUsageStats: async (period) => {
    const response = await api.get('/statistics/usage', {
      params: { period }
    });
    return response.data;
  },

  // Get customer growth statistics
  getCustomerGrowthStats: async (period) => {
    const response = await api.get('/statistics/customers', {
      params: { period }
    });
    return response.data;
  },

  async getWeeklyIncomeAnalysis() {
    try {
      const response = await api.get('/admin/income-analysis/weekly');
      return response.data;
    } catch (error) {
      console.error('获取收入分析数据失败:', error);
      throw error;
    }
  },

  // 获取用户角色分布
  getUserRoleDistribution: async () => {
    try {
      const response = await api.get('/statistics/user-role-distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching user role distribution:', error);
      throw error;
    }
  },

  // 获取每日收入
  getDailyRevenue: async () => {
    const response = await api.get('/statistics/daily-revenue');
    return response.data;
  },

  // 获取仪表盘总览
  getDashboardStats: async () => {
    try {
      const response = await api.get('/statistics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // 获取所有反馈
  getAllFeedbacks: async () => {
    try {
      const response = await api.get('/feedback');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },

  // 获取用户反馈
  getFeedbacksByUsername: async (username) => {
    try {
      const response = await api.get(`/feedback/user/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user feedbacks:', error);
      throw error;
    }
  },

  // 更新反馈
  updateFeedback: async (feedbackId, feedbackData) => {
    try {
      // 添加回复并更新状态
      const response = await api.put(`/feedback/${feedbackId}/response`, null, {
        params: {
          response: feedbackData.adminResponse
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  // 删除反馈
  deleteFeedback: async (feedbackId) => {
    try {
      const response = await api.delete(`/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },

  // 获取租赁时长统计
  getRentalPlanStats: async () => {
    try {
      const response = await api.get('/admin/rental-plan-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching rental plan stats:', error);
      throw error;
    }
  },

  // 获取滑板车统计信息
  getScooterStats: async () => {
    const response = await api.get('/scooters/stats');
    return response.data;
  },

  async getWeeklyRentalIncome() {
    try {
      const response = await api.get('/admin/rental-income/weekly');
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly rental income:', error);
      throw error;
    }
  },

  async getRentalPlanStats() {
    try {
      const response = await api.get('/admin/rental-stats/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching rental plan stats:', error);
      throw error;
    }
  },

  async getCombinedDailyIncome() {
    try {
      const response = await api.get('/admin/rental-income/combined-daily');
      return response.data;
    } catch (error) {
      console.error('Error fetching combined daily income:', error);
      throw error;
    }
  },

  async getScooterWeeklyIncome(scooterId) {
    try {
      const response = await api.get(`/admin/rental-income/scooters/${scooterId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching scooter ${scooterId} weekly income:`, error);
      throw error;
    }
  },

  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  async getUserRoleDistribution() {
    try {
      const response = await api.get('/admin/users/role-distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching user role distribution:', error);
      throw error;
    }
  },
};

export default adminService;