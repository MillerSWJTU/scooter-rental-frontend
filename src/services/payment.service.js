import api from './api';
import { API_ENDPOINTS } from '../config';

class PaymentService {
  async createPaymentForRental(rentalId, amount, paymentMethod, email) {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENTS.RENTAL(rentalId), {
        amount, paymentMethod, email
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('创建支付失败，请稍后重试');
    }
  }

  async getPaymentById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error('获取支付详情失败');
    }
  }

  async getPaymentsByRentalId(rentalId) {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.BY_RENTAL(rentalId));
      return response.data;
    } catch (error) {
      console.error('Error fetching rental payments:', error);
      throw new Error('获取租赁支付记录失败');
    }
  }

  async updatePaymentStatus(paymentId, status) {
    try {
      const response = await api.put(API_ENDPOINTS.PAYMENTS.UPDATE_STATUS(paymentId), { status });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('更新支付状态失败');
    }
  }

  async simulatePayment(paymentId) {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENTS.SIMULATE(paymentId));
      return response.data;
    } catch (error) {
      console.error('Error simulating payment:', error);
      throw new Error('模拟支付失败');
    }
  }
}

export default new PaymentService();
