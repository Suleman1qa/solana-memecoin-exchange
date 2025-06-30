import apiClient from "./apiClient.js";
import { logApiError } from "./logApiError.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

const BASE_URL = "http://192.168.18.36:5000/api";

// Helper function for logging
const log = (message, data) => {
  const logMessage = `[${Updates.channel || "development"}] ${message}`;
  if (data) {
    console.log(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.log(logMessage);
  }
};

const authService = {
  checkHealth: async () => {
    try {
      console.log("Checking API health...");
      const response = await apiClient.get("/health");
      console.log("Health check response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },

  login: async (email, password) => {
    // Log attempt
    console.warn("Login Attempt:", { email, url: `${BASE_URL}/auth/login` });

    try {
      // Basic fetch with no extra configuration
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }).catch((fetchError) => {
        console.warn("Fetch Error:", fetchError);
        throw new Error(`Fetch failed: ${fetchError.message}`);
      });

      console.warn("Raw Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Try to get the response text first
      const rawText = await response.text().catch((textError) => {
        console.warn("Text Parse Error:", textError);
        return null;
      });

      console.warn("Raw Response Text:", rawText);

      // Try to parse as JSON if we have text
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : null;
        console.warn("Parsed JSON:", data);
      } catch (jsonError) {
        console.warn("JSON Parse Error:", jsonError);
        throw new Error(`Invalid JSON response: ${rawText}`);
      }

      if (!data) {
        throw new Error("No data received from server");
      }

      if (!data.success) {
        throw new Error(data.error || "Server returned unsuccessful response");
      }

      const { token, refreshToken, user } = data.data;

      if (!token || !refreshToken || !user) {
        console.warn("Missing Data:", {
          hasToken: !!token,
          hasRefresh: !!refreshToken,
          hasUser: !!user,
        });
        throw new Error("Incomplete data received from server");
      }

      // Store tokens
      try {
        await AsyncStorage.multiSet([
          ["token", token],
          ["refreshToken", refreshToken],
        ]);
        console.warn("Tokens stored successfully");
      } catch (storageError) {
        console.warn("Storage Error:", storageError);
        throw new Error(`Failed to store tokens: ${storageError.message}`);
      }

      return { user, token, refreshToken };
    } catch (error) {
      console.warn("Final Error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken"]);
      return { success: true };
    } catch (error) {
      console.warn("Logout Error:", error);
      throw error;
    }
  },

  register: async (email, password, username, fullName) => {
    console.log("📝 Registration attempt for:", email);
    try {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
        username,
        fullName,
      });
      console.log("✅ Registration successful");
      return response.data.data;
    } catch (error) {
      console.log("❌ Registration error:", error.message);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.post("/auth/verify-email", {
      token,
    });
    return response.data;
  },

  resendVerificationEmail: async (email) => {
    const response = await apiClient.post("/auth/resend-verification-email", {
      email,
    });
    return response.data;
  },
};

export default authService;