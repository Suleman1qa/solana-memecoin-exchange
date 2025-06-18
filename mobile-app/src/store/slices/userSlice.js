import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService.js';

// Async thunks
export const updateCurrentUser = createAsyncThunk(
  'user/updateCurrentUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.updateCurrentUser(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  currentUser: null,
  isLoading: false,
  error: null,
  updateSuccess: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update user';
        state.updateSuccess = false;
      });
  },
});

export const { clearError, clearUpdateSuccess } = userSlice.actions;
export default userSlice.reducer;
