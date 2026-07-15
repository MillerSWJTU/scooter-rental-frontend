import api from './api';

/**
 * AdminService — 管理端专用：统计、定价、优惠券、工单
 * 用户/滑板车/反馈的 CRUD 已分别迁至 userService / scooterService / feedbackService
 */

const adminService = {
  // ==================== 工单 ====================

  getAllIssues: async () => {
    const response = await api.get('/issues');
    return response.data;
  },

  updateIssueStatus: async (issueId, statusData) => {
    const response = await api.put(`/issues/${issueId}/status`, statusData);
    return response.data;
  },

  respondToIssue: async (issueId, responseData) => {
    const response = await api.post(`/issues/${issueId}/response`, responseData);
    return response.data;
  },

  // ==================== 定价 ====================

  getPricingSettings: async () => {
    const response = await api.get('/pricing');
    return response.data;
  },

  updatePricingSettings: async (pricingData) => {
    const response = await api.put('/pricing', pricingData);
    return response.data;
  },

  createDiscount: async (discountData) => {
    const response = await api.post('/discounts', discountData);
    return response.data;
  },

  updateDiscount: async (discountId, discountData) => {
    const response = await api.put(`/discounts/${discountId}`, discountData);
    return response.data;
  },

  deleteDiscount: async (discountId) => {
    const response = await api.delete(`/discounts/${discountId}`);
    return response.data;
  },

  // ==================== 统计 ====================

  getRevenueStats: async (period) => {
    const response = await api.get('/statistics/revenue', { params: { period } });
    return response.data;
  },

  getUsageStats: async (period) => {
    const response = await api.get('/statistics/usage', { params: { period } });
    return response.data;
  },

  getCustomerGrowthStats: async (period) => {
    const response = await api.get('/statistics/customers', { params: { period } });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getUserRoleDistribution: async () => {
    const response = await api.get('/admin/users/role-distribution');
    return response.data;
  },

  getDailyRevenue: async () => {
    const response = await api.get('/statistics/daily-revenue');
    return response.data;
  },

  getRentalPlanStats: async () => {
    const response = await api.get('/admin/rental-stats/plans');
    return response.data;
  },

  getWeeklyIncomeAnalysis: async () => {
    const response = await api.get('/admin/income-analysis/weekly');
    return response.data;
  },

  getWeeklyRentalIncome: async () => {
    const response = await api.get('/admin/rental-income/weekly');
    return response.data;
  },

  getCombinedDailyIncome: async () => {
    const response = await api.get('/admin/rental-income/combined-daily');
    return response.data;
  },

  getScooterWeeklyIncome: async (scooterId) => {
    const response = await api.get(`/admin/rental-income/scooters/${scooterId}`);
    return response.data;
  },
};

export default adminService;
