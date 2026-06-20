import api from './api';
import { API_ENDPOINTS } from '../config';

class PaymentService {
  // 为租赁创建支付
  async createPaymentForRental(rentalId, amount, paymentMethod, email) {
    try {
      const response = await api.post(`${API_ENDPOINTS.PAYMENTS.RENTAL(rentalId)}`, {
        amount,
        paymentMethod,
        email
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment for rental:', error);
      throw new Error('创建支付失败，请稍后重试');
    }
  }

  // 获取支付详情
  async getPaymentById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PAYMENTS.DETAIL(id)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('获取支付详情失败');
    }
  }

  // 获取租赁的所有支付记录
  async getPaymentsByRentalId(rentalId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PAYMENTS.BY_RENTAL(rentalId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rental payments:', error);
      throw new Error('获取租赁支付记录失败');
    }
  }

  // 更新支付状态
  async updatePaymentStatus(paymentId, status) {
    try {
      const response = await api.put(`${API_ENDPOINTS.PAYMENTS.UPDATE_STATUS(paymentId)}`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('更新支付状态失败');
    }
  }

  // 模拟支付
  async simulatePayment(paymentId) {
    try {
      const response = await api.post(`${API_ENDPOINTS.PAYMENTS.SIMULATE(paymentId)}`);
      return response.data;
    } catch (error) {
      console.error('Error simulating payment:', error);
      throw new Error('模拟支付失败');
    }
  }

  // 处理支付回调
  processPaymentCallback(transactionId, status) {
    // 前端通常不直接处理回调，这里只是为了完整性
    console.log('Processing payment callback:', { transactionId, status });
    // 可以触发一些前端状态更新
    return { success: true };
  }
}

export default new PaymentService(); 