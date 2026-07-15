import api from './api';

const userService = {
  // 获取所有用户
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // 获取单个用户
  getUserByUsername: async (username) => {
    try {
      const response = await api.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
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
};

export default userService;
