import api from './api';

const adminService = {
  // 仪表盘总览
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // 用户角色分布
  getUserRoleDistribution: async () => {
    const response = await api.get('/admin/user-role-distribution');
    return response.data;
  },

  // 租赁方案统计
  getRentalPlanStats: async () => {
    const response = await api.get('/admin/rental-plans');
    return response.data;
  },

  // 近7天收入（按方案分组）
  getRevenueWeekly: async () => {
    const response = await api.get('/admin/revenue/weekly');
    return response.data;
  },

  // 近7天收入（按天汇总）
  getRevenueDaily: async () => {
    const response = await api.get('/admin/revenue/daily');
    return response.data;
  },

  // 某滑板车本周收入
  getScooterRevenue: async (scooterId) => {
    const response = await api.get(`/admin/revenue/scooters/${scooterId}`);
    return response.data;
  },
};

export default adminService;
