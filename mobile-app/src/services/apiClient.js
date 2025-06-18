import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { store } from '../store/index.js';
import { refreshToken, logout } from '../store/slices/authSlice.js';

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        await store.dispatch(refreshToken());
        const state = store.getState();
        
        // If token was refreshed successfully
        if (state.auth.token) {
          // Update token in the original request
          originalRequest.headers.Authorization = `Bearer ${state.auth.token}`;
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          // If token refresh failed, logout
          store.dispatch(logout());
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If token refresh failed, logout
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;