import api from './api';
import { API_ENDPOINTS } from '../config';

/**
 * ScooterService - Handles user-facing scooter operations
 * This service focuses on operations that regular users would perform
 * Admin operations are handled by adminService
 */
class ScooterService {
  // Get all scooters regardless of status
  async getAllScooters() {
    try {
      const response = await api.get(API_ENDPOINTS.SCOOTERS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching all scooters:', error);
      throw new Error('获取滑板车列表失败');
    }
  }

  // Get all available scooters
  async getAvailableScooters() {
    try {
      const response = await api.get(API_ENDPOINTS.SCOOTERS.LIST);
      return response.data.filter(scooter => scooter.status === 'AVAILABLE');
    } catch (error) {
      console.error('Error fetching available scooters:', error);
      throw new Error('获取可用滑板车列表失败');
    }
  }

  // Get scooter details by ID
  async getScooterById(scooterId) {
    try {
      if (!scooterId) {
        throw new Error('无效的滑板车ID');
      }

      // 提取纯数字 ID
      const rawId = scooterId.toString();
      let numericId;
      
      if (rawId.includes('-')) {
        // 如果ID包含破折号，提取数字部分
        numericId = rawId.split('-')[1];
      } else {
        // 否则直接使用原始ID
        numericId = rawId;
      }
      
      // 确保ID是有效的
      if (!numericId) {
        throw new Error('无效的滑板车ID');
      }

      console.log('Fetching scooter details with ID:', numericId);

      // 发送请求
      const response = await api.get(API_ENDPOINTS.SCOOTERS.DETAIL(numericId));
      
      // 确保返回的数据中的 ID 格式正确
      if (response.data) {
        const id = response.data.id.toString();
        response.data.id = id.startsWith('SC-') ? id : `SC-${id}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching scooter details:', error);
      if (error.response?.status === 404) {
        throw new Error(`未找到ID为 ${scooterId} 的滑板车`);
      }
      if (error.response?.status === 400) {
        throw new Error('滑板车ID格式无效');
      }
      throw new Error('获取滑板车详情失败');
    }
  }

  // Report scooter issue
  async reportScooterIssue(scooterId, issueDetails) {
    try {
      const response = await api.post(API_ENDPOINTS.SCOOTERS.ISSUES(scooterId), issueDetails);
      return response.data;
    } catch (error) {
      console.error('Error reporting scooter issue:', error);
      throw new Error('报告滑板车问题失败');
    }
  }

  // Get scooter battery level
  async getScooterBatteryLevel(scooterId) {
    try {
      const scooter = await this.getScooterById(scooterId);
      return { batteryLevel: scooter.batteryLevel };
    } catch (error) {
      console.error('Error getting scooter battery level:', error);
      throw new Error('获取滑板车电量失败');
    }
  }

  // Get scooter location
  async getScooterLocation(scooterId) {
    try {
      const scooter = await this.getScooterById(scooterId);
      return {
        coordinates: [scooter.latitude, scooter.longitude],
        location: scooter.location
      };
    } catch (error) {
      console.error('Error getting scooter location:', error);
      throw new Error('获取滑板车位置失败');
    }
  }

  // Check scooter availability
  async checkScooterAvailability(scooterId) {
    try {
      const scooter = await this.getScooterById(scooterId);
      return { available: scooter.status === 'AVAILABLE' };
    } catch (error) {
      console.error('Error checking scooter availability:', error);
      throw new Error('检查滑板车可用性失败');
    }
  }

  // Reserve scooter
  async reserveScooter(scooterId) {
    try {
      const response = await api.post(API_ENDPOINTS.SCOOTERS.DETAIL(scooterId) + '/reserve');
      return response.data;
    } catch (error) {
      console.error('Error reserving scooter:', error);
      throw new Error('预约滑板车失败');
    }
  }
}

export default new ScooterService();