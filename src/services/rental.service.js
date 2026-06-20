import api from './api';
import { API_ENDPOINTS, AUTH_CONFIG } from '../config';

// 基础费率配置
const BASE_RATES = {
  STANDARD: 1.5,    // 标准费率：1.5元/分钟
  PREMIUM: 2.0,     // 高级费率：2.0元/分钟
  ECONOMY: 1.0     // 经济费率：1.0元/分钟
};

class RentalService {
  // Get all rentals for a user
  async getUserRentals(username) {
    if (!username) {
      throw new Error('用户名不能为空');
    }

    try {
      // 从 localStorage 获取当前用户信息
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        throw new Error('请先登录');
      }

      // 确保用户只能访问自己的租赁记录
      if (username !== currentUser.username && currentUser.role !== 'ADMIN') {
        throw new Error('无权访问其他用户的租赁记录');
      }

      const response = await api.get(API_ENDPOINTS.USER.RENTALS(username));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      if (error.response?.status === 404) {
        return [];
      }
      if (error.response?.status === 401) {
        throw new Error('请先登录');
      }
      if (error.response?.status === 403) {
        throw new Error('无权访问');
      }
      throw new Error(error.message || '获取租赁记录失败，请稍后重试');
    }
  }

  // 本地计算租赁费用
  calculateLocalRentalCost(rental) {
    if (!rental) return 0;
    
    const startTime = new Date(rental.startTime);
    const endTime = rental.endTime ? new Date(rental.endTime) : new Date();
    const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
    
    console.log('Calculating cost for rental:', {
      plan: rental.plan,
      durationInMinutes,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });

    // 根据租赁计划计算费用
    let cost = 0;
    switch (rental.plan?.toUpperCase()) {
      case 'DAILY':
        // 按天计费，每天固定费用
        const days = Math.ceil(durationInMinutes / (24 * 60));
        cost = days * 24 * 60 * BASE_RATES.STANDARD; // 每天按标准费率计算
        break;
      case 'WEEKLY':
        // 按周计费，每周固定费用
        const weeks = Math.ceil(durationInMinutes / (7 * 24 * 60));
        cost = weeks * 7 * 24 * 60 * BASE_RATES.STANDARD * 0.8; // 每周按标准费率的80%计算
        break;
      case 'FOUR_HOURS':
        // 4小时套餐，固定费用
        const fourHourBlocks = Math.ceil(durationInMinutes / (4 * 60));
        cost = fourHourBlocks * 4 * 60 * BASE_RATES.STANDARD * 0.9; // 4小时按标准费率的90%计算
        break;
      case 'HOURLY':
      default:
        // 按小时计费
        cost = durationInMinutes * BASE_RATES.STANDARD;
        break;
    }
    
    console.log('Plan-based cost calculation:', {
      plan: rental.plan,
      durationInMinutes,
      cost
    });
    
    // 如果有折扣，应用折扣
    if (rental.discount) {
      const originalCost = cost;
      cost = cost * (1 - rental.discount / 100);
      console.log('Applied discount:', {
        originalCost,
        discount: rental.discount,
        finalCost: cost
      });
    }
    
    return Math.max(0, cost);
  }

  // Get details of a specific rental
  async getRentalById(rentalId) {
    try {
      const response = await api.get(API_ENDPOINTS.RENTALS.DETAIL(rentalId));
      return response.data;
    } catch (error) {
      console.error('Error fetching rental details:', error);
      throw new Error('获取租赁详情失败');
    }
  }

  // Create a new rental
  async createRental(rentalData) {
    if (!rentalData?.username || !rentalData?.scooterId) {
      throw new Error('缺少必要的租赁信息');
    }

    try {
      console.log('Creating rental with data:', rentalData);

      const payload = {
        startLocation: rentalData.startLocation || "Current Location",
        startTime: new Date().toISOString(),
        endLocation: null,
        endTime: null,
        active: true,
        notes: rentalData.notes || "",
        totalCost: 0,
        plan: rentalData.plan || "HOURLY",
        duration: rentalData.duration || 1
      };

      console.log('Sending payload to server:', payload);

      const response = await api.post(
        `${API_ENDPOINTS.RENTALS.CREATE}?username=${rentalData.username}&scooterId=${rentalData.scooterId}`,
        payload
      );
      
      return response.data;
    } catch (error) {
      // Check if we got a response with data despite the error
      if (error.response?.data?.id) {
        return error.response.data;
      }
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || '租赁参数无效，请检查输入');
      }
      if (error.response?.status === 404) {
        throw new Error('未找到指定的滑板车');
      }
      if (error.response?.status === 409) {
        throw new Error('该滑板车已被租用');
      }
      
      console.error('Error creating rental:', error);
      throw new Error('创建租赁记录失败，请稍后重试');
    }
  }

  // Unlock scooter for an active rental
  async unlockScooter(rentalId) {
    try {
      const response = await api.post(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/unlock');
      return response.data;
    } catch (error) {
      console.error('Error unlocking scooter:', error);
      throw new Error('解锁滑板车失败');
    }
  }

  // End a rental
  async endRental(rentalId) {
    if (!rentalId) {
      throw new Error('租赁ID不能为空');
    }

    try {
      // 验证用户认证状态
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      
      if (!currentUser || !token) {
        throw new Error('请先登录');
      }

      // 获取当前位置（这里使用一个示例位置，实际应该从GPS获取）
      const currentLocation = "Return Location";
      const endTime = new Date().toISOString();

      // 获取当前租赁信息以计算时长
      const currentRental = await this.getRentalById(rentalId);
      const startTime = new Date(currentRental.startTime);
      const durationInMinutes = Math.floor((new Date(endTime) - startTime) / (1000 * 60));

      const payload = {
        endLocation: currentLocation,
        endTime: endTime,
        active: false,
        duration: durationInMinutes / 60 // 转换为小时
      };

      const response = await api.put(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/end', payload);

      if (!response.data) {
        throw new Error('服务器返回数据格式错误');
      }

      // 如果成功结束，返回更新后的租赁信息
      const updatedRental = await this.getRentalById(rentalId);
      
      try {
        // 尝试从服务器获取费用计算结果
        const costResponse = await this.calculateServerRentalCost({
          rentalId: updatedRental.id,
          startTime: updatedRental.startTime,
          endTime: updatedRental.endTime,
          plan: updatedRental.plan,
          duration: updatedRental.duration
        });

        // 更新租赁费用
        if (costResponse?.data?.totalCost) {
          updatedRental.totalCost = costResponse.data.totalCost;
        } else {
          // 如果服务器计算失败，使用本地计算
          updatedRental.totalCost = this.calculateLocalRentalCost(updatedRental);
        }

      return updatedRental;
      } catch (costError) {
        console.error('Error calculating rental cost:', costError);
        // 如果费用计算失败，使用本地计算
        updatedRental.totalCost = this.calculateLocalRentalCost(updatedRental);
        return updatedRental;
      }
    } catch (error) {
      console.error('Error ending rental:', error);
      throw new Error(error.message || '结束租赁失败，请稍后重试');
    }
  }

  // Extend a rental
  async extendRental(rentalId, additionalHours) {
    try {
      const response = await api.put(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/extend', {
        extensionHours: additionalHours
      });
      return response.data;
    } catch (error) {
      console.error('Error extending rental:', error);
      throw error;
    }
  }

  // Cancel a rental
  async cancelRental(rentalId) {
    if (!rentalId) {
      throw new Error('租赁ID不能为空');
    }

    try {
      const rental = await this.getRentalById(rentalId);
      
      // 检查是否可以免费取消（开始后5分钟内）
      const startTime = new Date(rental.startTime);
      const now = new Date();
      const diffMinutes = Math.floor((now - startTime) / (1000 * 60));
      
      if (diffMinutes > 5) {
        throw new Error('超过免费取消时间（5分钟），请选择结束租赁');
      }

      const response = await api.put(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/cancel');

      // 如果成功取消，返回更新后的租赁信息
      const updatedRental = await this.getRentalById(rentalId);
      return {
        ...updatedRental,
        totalCost: 0 // 免费取消
      };
    } catch (error) {
      console.error('Error canceling rental:', error);
      if (error.response?.status === 404) {
        throw new Error('未找到指定的租赁记录');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || '取消租赁失败，请检查租赁状态');
      }
      if (error.response?.status === 409) {
        throw new Error('该租赁已经结束或取消');
      }
      throw new Error(error.message || '取消租赁失败，请稍后重试');
    }
  }

  // Rate a completed rental
  async rateRental(rentalId, ratingDetails) {
    try {
      const response = await api.post(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/rate', ratingDetails);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Report an issue with a rental
  async reportIssue(rentalId, issueDetails) {
    try {
      const response = await api.post(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/issues', issueDetails);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user's active discounts
  async getUserDiscounts(userId) {
    try {
      const response = await api.get('/users/' + userId + '/discounts');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get rental pricing
  async getRentalPricing() {
    try {
      const response = await api.get('/rentals/pricing');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Calculate estimated cost for a rental
  async calculateRentalCost(rentalParams) {
    try {
      const response = await api.post(API_ENDPOINTS.RENTALS.CALCULATE_COST, rentalParams);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user's rental statistics
  async getUserRentalStats(userId) {
    try {
      const response = await api.get('/users/' + userId + '/rental-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get rental history
  async getRentalHistory() {
    try {
      const response = await api.get(API_ENDPOINTS.RENTALS.HISTORY);
      return response.data;
    } catch (error) {
      console.error('Error fetching rental history:', error);
      throw new Error('获取租赁历史失败');
    }
  }

  // Get current rental
  async getCurrentRental() {
    try {
      const response = await api.get(API_ENDPOINTS.RENTALS.CURRENT);
      return response.data;
    } catch (error) {
      console.error('Error fetching current rental:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error('获取当前租赁信息失败，请稍后重试');
    }
  }

  // Lock scooter
  async lockScooter(rentalId) {
    if (!rentalId) {
      throw new Error('租赁ID不能为空');
    }

    try {
      const response = await api.post(API_ENDPOINTS.RENTALS.DETAIL(rentalId) + '/lock');
      return response.data;
    } catch (error) {
      console.error('Error locking scooter:', error);
      if (error.response?.status === 404) {
        throw new Error('未找到指定的租赁记录');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || '锁定滑板车失败，请检查滑板车状态');
      }
      throw new Error('锁定滑板车失败，请稍后重试');
    }
  }

  // 从服务器计算租赁费用
  async calculateServerRentalCost(rentalParams) {
    try {
      const response = await api.post(API_ENDPOINTS.RENTALS.CALCULATE_COST, rentalParams);
      return response.data;
    } catch (error) {
      console.error('Server rental cost calculation failed:', error);
      throw error;
    }
  }
}

export default new RentalService();