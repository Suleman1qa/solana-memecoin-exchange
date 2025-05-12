import apiClient from './apiClient';

const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },
  
  register: async (email, password, username, fullName) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      username,
      fullName,
    });
    return response.data.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken,
    });
    return response.data.data;
  },
  
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },
  
  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email', {
      token,
    });
    return response.data;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data;
  },
};

export default authService;