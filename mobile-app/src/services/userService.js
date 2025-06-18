import apiClient from './apiClient.js';

const userService = {
  updateCurrentUser: async (userData) => {
    const response = await apiClient.put('/users/me', userData);
    return response.data.data;
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data.data;
  },
};

export default userService;
