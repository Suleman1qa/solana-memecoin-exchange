import axios from "axios";
import { API_BASE_URL } from "@env";

console.log("STARTUP: Initializing API Client");
console.log(
  "STARTUP: API Base URL =",
  API_BASE_URL || "http://192.168.18.36:5000/api"
);

const apiClient = axios.create({
  baseURL: API_BASE_URL || "http://192.168.18.36:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Basic request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log("🚀 Making request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.log("❌ Request error:", error.message);
    return Promise.reject(error);
  }
);

// Basic response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.log("❌ Response error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export function setupApiClient(store) {
  console.log("SETUP: Configuring API Client with store");

  // Add auth token to requests
  apiClient.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
    if (token) {
      console.log("🔑 Adding auth token to request");
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export default apiClient;
