import api from './api';
import { API_BASE_URL } from '../config';

const userService = {
    // 获取所有用户
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    
    getUserByUsername: async (username) => {
        const response = await api.get(`/users/${username}`);
        return response.data;
    },

    // 创建用户
    createUser: async (userData) => {
        const response = await api.post('/users/register', {
            username: userData.name,
            password: "defaultPassword123", // 默认密码，实际应该让用户设置
            email: userData.email,
            phone: userData.phone,
            role: userData.role.toUpperCase()
        });
        return response.data;
    },

    // 更新用户
    updateUser: async (username, userData) => {
        const response = await api.put(`/users/${username}`, {
            email: userData.email,
            phone: userData.phone,
            role: userData.role.toUpperCase(),
            status: userData.status
        });
        return response.data;
    },

    // 删除用户
    deleteUser: async (username) => {
        const response = await api.delete(`/users/${username}`);
        return response.data;
    },

    // 修改用户状态
    updateUserStatus: async (username, status) => {
        const response = await api.patch(`/users/${username}/status`, {
            status: status
        });
        return response.data;
    }
};

export default userService; 