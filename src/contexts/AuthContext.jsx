import React, { createContext, useState, useEffect, useContext } from 'react';  
import { useNavigate } from 'react-router-dom';  
import authService from '../services/auth.service';  
import { setAuthToken } from '../services/api';

// Create and export the context
export const AuthContext = createContext(null);  

export const useAuth = () => {  
  const context = useContext(AuthContext);  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;  
};  

export const AuthProvider = ({ children }) => {  
  const [currentUser, setCurrentUser] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const navigate = useNavigate();  

  // 初始化认证状态
  useEffect(() => {  
    const initAuth = async () => {
      try {
        // 先从localStorage中直接恢复用户信息
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (storedUser && token) {
          try {
            const user = JSON.parse(storedUser);
            // 确保用户信息包含必要的字段
            if (!user || typeof user !== 'object') {
              throw new Error('Invalid user data format');
            }
            
            // 检查必要的字段是否存在
            const requiredFields = ['username', 'id', 'email', 'phone'];
            const missingFields = requiredFields.filter(field => !user[field]);
            
            if (missingFields.length > 0) {
              console.warn('Missing required user fields:', missingFields);
              // 尝试从token中恢复用户信息
              const tokenPayload = JSON.parse(atob(token.split('.')[1]));
              const recoveredUser = {
                ...user,
                id: tokenPayload.sub || user.id,
                username: tokenPayload.username || user.username,
                email: user.email || '',
                phone: user.phone || ''
              };
              
              // 如果恢复成功，使用恢复后的用户信息
              if (recoveredUser.id && recoveredUser.username) {
                setCurrentUser(recoveredUser);
                localStorage.setItem('user', JSON.stringify(recoveredUser));
              } else {
                throw new Error('无法恢复用户信息');
              }
            } else {
              setCurrentUser(user);
            }
            
            // 确保token应用到所有API请求中
            setAuthToken(token);
          } catch (parseError) {
            console.error('Failed to parse stored user:', parseError);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);  

  const register = async (userData) => {
    try {
      const { username, password, email, phone } = userData;
      if (!username || !password || !email || !phone) {
        throw new Error('请填写所有必填字段');
      }
      
      const result = await authService.register({
        username,
        password,
        email,
        phone
      });
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setCurrentUser(response);

      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('token', response.token);

      // 检查是否有需要重定向的页面
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/admin/dashboard');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {  
    localStorage.removeItem('user');  
    localStorage.removeItem('token');  
    sessionStorage.removeItem('token');  
    setCurrentUser(null);  
    navigate('/login');  
  };  

  // Add updateUser method
  const updateUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value = {  
    currentUser,  
    loading,  
    login,  
    logout,
    register,
    isAuthenticated: !!currentUser,  
    isAdmin: currentUser?.role === 'ROLE_ADMIN',
    updateUser // <-- expose updateUser
  };  

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;  
};  

export default AuthProvider;