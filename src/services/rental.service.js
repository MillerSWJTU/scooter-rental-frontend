import api from './api';
import { API_ENDPOINTS, AUTH_CONFIG } from '../config';

class RentalService {
  // ==================== 查询 ====================

  async getUserRentals(username) {
    if (!username) throw new Error('用户名不能为空');

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) throw new Error('请先登录');
      if (username !== currentUser.username && currentUser.role !== 'ADMIN') {
        throw new Error('无权访问其他用户的租赁记录');
      }

      const response = await api.get(API_ENDPOINTS.USER.RENTALS(username));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      if (error.response?.status === 404) return [];
      if (error.response?.status === 401) throw new Error('请先登录');
      if (error.response?.status === 403) throw new Error('无权访问');
      throw new Error(error.message || '获取租赁记录失败，请稍后重试');
    }
  }

  async getRentalById(rentalId) {
    try {
      const response = await api.get(API_ENDPOINTS.RENTALS.DETAIL(rentalId));
      return response.data;
    } catch (error) {
      console.error('Error fetching rental details:', error);
      throw new Error('获取租赁详情失败');
    }
  }

  // ==================== 操作 ====================

  async createRental(rentalData) {
    if (!rentalData?.username || !rentalData?.scooterId) {
      throw new Error('缺少必要的租赁信息');
    }

    try {
      const payload = {
        username: rentalData.username,
        scooterId: rentalData.scooterId,
        startLocation: rentalData.startLocation || 'Current Location',
        startTime: new Date().toISOString(),
        notes: rentalData.notes || '',
        plan: rentalData.plan || 'HOURLY',
        duration: rentalData.duration || 1,
      };

      const response = await api.post(API_ENDPOINTS.RENTALS.CREATE, payload);
      return response.data;
    } catch (error) {
      if (error.response?.data?.id) return error.response.data;
      if (error.response?.status === 400) throw new Error(error.response.data?.message || '租赁参数无效');
      if (error.response?.status === 404) throw new Error('未找到指定的滑板车');
      if (error.response?.status === 409) throw new Error('该滑板车已被租用');
      console.error('Error creating rental:', error);
      throw new Error('创建租赁记录失败，请稍后重试');
    }
  }

  async endRental(rentalId) {
    if (!rentalId) throw new Error('租赁ID不能为空');

    try {
      const response = await api.put(
        API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/end',
        { endLocation: 'Return Location' }
      );
      if (!response.data) throw new Error('服务器返回数据格式错误');
      return response.data; // 后端已返回 totalCost
    } catch (error) {
      console.error('Error ending rental:', error);
      throw new Error(error.message || '结束租赁失败，请稍后重试');
    }
  }

  async extendRental(rentalId, additionalHours) {
    try {
      const response = await api.put(
        API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/extend',
        { additionalHours }
      );
      return response.data;
    } catch (error) {
      console.error('Error extending rental:', error);
      throw error;
    }
  }

  async cancelRental(rentalId) {
    if (!rentalId) throw new Error('租赁ID不能为空');

    try {
      const response = await api.put(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/cancel');
      return { ...response.data, totalCost: 0 }; // 免费取消
    } catch (error) {
      console.error('Error canceling rental:', error);
      if (error.response?.status === 404) throw new Error('未找到指定的租赁记录');
      if (error.response?.status === 400) throw new Error(error.response.data?.message || '取消失败');
      if (error.response?.status === 409) throw new Error('该租赁已经结束或取消');
      throw new Error(error.message || '取消租赁失败，请稍后重试');
    }
  }
}

export default new RentalService();
