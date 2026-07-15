import api, { setAuthToken } from './api';
import { AUTH_CONFIG, API_ENDPOINTS } from '../config';

const authService = {  
  async login(username, password) {  
    try {  
      console.log('Attempting login with username:', username);
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: username,
        password: password
      });
      
      console.log('Login response:', {
        ...response.data,
        password: '[REDACTED]' // 不记录密码
      });
      
      // 检查响应中是否包含必要的用户信息
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);

        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone,
          role: response.data.role || 'USER',
          token: response.data.token
        };
        
        // 存储用户信息
        localStorage.setItem('user', JSON.stringify(userData));
        
        return userData;
      }
      
      throw new Error('登录响应格式不正确');
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response) {
        // 处理后端返回的具体错误信息
        if (error.response.status === 400) {
          if (error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          }
          throw new Error('用户名或密码错误');
        }
      }
      throw new Error(error.response?.data?.message || '登录失败，请稍后重试');
    }  
  },  
  
  async register(userDetails) {  
    try {
      // 验证必填字段
      if (!userDetails.username) {
        throw new Error('用户名不能为空');
      }
      if (!userDetails.password) {
        throw new Error('密码不能为空');
      }
      if (!userDetails.email) {
        throw new Error('邮箱不能为空');
      }
      
      console.log('Sending registration request:', {
        username: userDetails.username,
        email: userDetails.email,
        phone: userDetails.phone || '',
        password: '******' // 不记录实际密码
      });
      
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        username: userDetails.username,
        password: userDetails.password,
        email: userDetails.email,
        phone: userDetails.phone || ''
      });
      
      if (!response.data) {
        throw new Error('注册响应格式不正确');
      }

      console.log('Registration successful:', {
        username: response.data.username,
        email: response.data.email
      });

      return {
        success: true,
        user: {
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // 检查是否有响应
      if (error.response) {
        console.error('Error status:', error.response.status);
        
        // 检查错误响应数据
        if (error.response.data?.message) {
          throw new Error(error.response.data.message);
        }
        
        // 根据HTTP状态码提供不同的错误信息
        switch (error.response.status) {
          case 400:
            throw new Error('注册信息有误，请检查您的输入');
          case 409:
            throw new Error('用户名或邮箱已被注册');
          case 500:
            throw new Error('服务器内部错误，请稍后再试');
          default:
            throw new Error('注册失败，请稍后重试');
        }
      }
      
      // 网络错误或者其他问题
      if (error.request && !error.response) {
        throw new Error('无法连接到服务器，请检查您的网络连接');
      }
      
      // 默认错误消息
      throw new Error(error.message || '注册失败，请稍后再试');
    }
  },  
  
  logout() {
    localStorage.removeItem('user');
    setAuthToken(null);
  },  
  
  getCurrentUser() {  
    try {  
      const userStr = localStorage.getItem('user');  
      return userStr ? JSON.parse(userStr) : null;  
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  },

  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

};  

export default authService;