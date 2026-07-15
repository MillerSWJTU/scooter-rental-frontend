import api from './api';
import { API_ENDPOINTS } from '../config';

class ScooterService {
  // ==================== 用户端 ====================

  async getAllScooters() {
    try {
      const response = await api.get(API_ENDPOINTS.SCOOTERS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching all scooters:', error);
      throw new Error('获取滑板车列表失败');
    }
  }

  async getAvailableScooters() {
    try {
      const response = await api.get(API_ENDPOINTS.SCOOTERS.LIST);
      return response.data.filter(scooter => scooter.status === 'AVAILABLE');
    } catch (error) {
      console.error('Error fetching available scooters:', error);
      throw new Error('获取可用滑板车列表失败');
    }
  }

  async getScooterById(scooterId) {
    try {
      if (!scooterId) throw new Error('无效的滑板车ID');

      const rawId = scooterId.toString();
      let numericId = rawId.includes('-') ? rawId.split('-')[1] : rawId;
      if (!numericId) throw new Error('无效的滑板车ID');

      const response = await api.get(API_ENDPOINTS.SCOOTERS.DETAIL(numericId));

      if (response.data) {
        const id = response.data.id.toString();
        response.data.id = id.startsWith('SC-') ? id : `SC-${id}`;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching scooter details:', error);
      if (error.response?.status === 404) throw new Error(`未找到ID为 ${scooterId} 的滑板车`);
      if (error.response?.status === 400) throw new Error('滑板车ID格式无效');
      throw new Error('获取滑板车详情失败');
    }
  }

  // ==================== 管理端 ====================

  async getScooterStats() {
    const response = await api.get('/scooters/stats');
    return response.data;
  }

  async createScooter(scooterData) {
    try {
      if (!scooterData) throw new Error('Missing scooter data');
      if (!scooterData.model) throw new Error('Scooter model is required');

      const data = {
        ...scooterData,
        batteryLevel: parseInt(scooterData.batteryLevel) || 100,
        latitude: parseFloat(scooterData.latitude) || 0,
        longitude: parseFloat(scooterData.longitude) || 0,
        pricePerHour: parseFloat(scooterData.pricePerHour) || 0,
        pricePerFourHours: parseFloat(scooterData.pricePerFourHours) || 0,
        pricePerDay: parseFloat(scooterData.pricePerDay) || 0,
        pricePerWeek: parseFloat(scooterData.pricePerWeek) || 0,
      };

      if (data.status && !['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OFFLINE'].includes(data.status.toUpperCase())) {
        data.status = 'AVAILABLE';
      } else if (data.status) {
        data.status = data.status.toUpperCase();
      }

      const response = await api.post('/scooters', data);
      if (!response?.data) throw new Error('No data returned');
      return response.data;
    } catch (error) {
      console.error('Error creating scooter:', error);
      throw error;
    }
  }

  async updateScooter(scooterId, scooterData) {
    try {
      if (!scooterId) throw new Error('Missing scooter ID');

      const data = { ...scooterData };

      if (scooterData.batteryLevel !== undefined) data.batteryLevel = parseInt(scooterData.batteryLevel) || 0;
      if (scooterData.latitude !== undefined) data.latitude = parseFloat(scooterData.latitude) || 0;
      if (scooterData.longitude !== undefined) data.longitude = parseFloat(scooterData.longitude) || 0;

      if (data.status && !['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OFFLINE'].includes(data.status.toUpperCase())) {
        data.status = 'AVAILABLE';
      } else if (data.status) {
        data.status = data.status.toUpperCase();
      }

      const response = await api.put(`/scooters/${scooterId}`, data);
      if (!response?.data) throw new Error('No data returned');
      return response.data;
    } catch (error) {
      console.error('Error updating scooter:', error);
      throw error;
    }
  }

  async deleteScooter(scooterId) {
    try {
      await api.delete(`/scooters/${scooterId}`);
    } catch (error) {
      console.error('Error deleting scooter:', error);
      throw error;
    }
  }

  async updateScooterStatus(scooterId, status) {
    try {
      const response = await api.put(`/scooters/${scooterId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating scooter status:', error);
      throw error;
    }
  }

  async updateScooterPrice(priceData) {
    try {
      if (!priceData?.id) throw new Error('Missing scooter ID for price update');

      const data = {
        pricePerHour: parseFloat(priceData.pricePerHour) || 0,
        pricePerFourHours: parseFloat(priceData.pricePerFourHours) || 0,
        pricePerDay: parseFloat(priceData.pricePerDay) || 0,
        pricePerWeek: parseFloat(priceData.pricePerWeek) || 0,
      };

      const response = await api.put(`/scooters/${priceData.id}/price`, data);
      if (!response?.data) throw new Error('No data returned');
      return response.data;
    } catch (error) {
      console.error('Error updating scooter price:', error);
      throw error;
    }
  }
}

export default new ScooterService();
