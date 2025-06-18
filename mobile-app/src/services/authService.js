import apiClient from './apiClient.js';

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

  resendVerificationEmail: async (email) => {
    const response = await apiClient.post('/auth/resend-verification-email', {
      email,
    });
    return response.data;
  },
};

export default authService;