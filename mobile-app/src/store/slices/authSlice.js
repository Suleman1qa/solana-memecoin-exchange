import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService.js";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("🎬 Starting login thunk");
      const response = await authService.login(email, password);
      console.log("✅ Login thunk success");
      return response;
    } catch (error) {
      console.log("❌ Login thunk error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.logout();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    rehydrateComplete: (state) => {
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase("persist/REHYDRATE", (state) => {
        state.isLoading = false;
      })
      .addCase(login.pending, (state) => {
        console.log("⏳ Login pending");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("🎉 Login fulfilled");
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.log("💥 Login rejected");
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, () => {
        console.log("👋 Logout successful");
        return { ...initialState, isLoading: false };
      })
      .addCase(logout.rejected, () => {
        console.log("❌ Logout failed, resetting state anyway");
        return { ...initialState, isLoading: false };
      });
  },
});

export const { clearError, rehydrateComplete } = authSlice.actions;
export default authSlice.reducer;
