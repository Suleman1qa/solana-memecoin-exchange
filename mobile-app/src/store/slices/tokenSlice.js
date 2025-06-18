import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tokenService from '../../services/tokenService.js';

// Async thunks
export const fetchTokens = createAsyncThunk(
  'token/fetchTokens',
  async ({ page = 1, limit = 20, category, status, sort, search }, { rejectWithValue }) => {
    try {
      return await tokenService.getTokens(page, limit, category, status, sort, search);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTrendingTokens = createAsyncThunk(
  'token/fetchTrendingTokens',
  async ({ timeframe = '24h', limit = 10 }, { rejectWithValue }) => {
    try {
      return await tokenService.getTrendingTokens(timeframe, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchNewListings = createAsyncThunk(
  'token/fetchNewListings',
  async ({ limit = 10 }, { rejectWithValue }) => {
    try {
      return await tokenService.getNewListings(limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchGraduatingTokens = createAsyncThunk(
  'token/fetchGraduatingTokens',
  async ({ limit = 10 }, { rejectWithValue }) => {
    try {
      return await tokenService.getGraduatingTokens(limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchGraduatedTokens = createAsyncThunk(
  'token/fetchGraduatedTokens',
  async ({ limit = 10 }, { rejectWithValue }) => {
    try {
      return await tokenService.getGraduatedTokens(limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTokenDetails = createAsyncThunk(
  'token/fetchTokenDetails',
  async (address, { rejectWithValue }) => {
    try {
      return await tokenService.getTokenByAddress(address);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTokenPriceHistory = createAsyncThunk(
  'token/fetchTokenPriceHistory',
  async ({ address, interval = '1h', from, to }, { rejectWithValue }) => {
    try {
      return await tokenService.getTokenPriceHistory(address, interval, from, to);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  tokens: [],
  trendingTokens: [],
  newListings: [],
  graduatingTokens: [],
  graduatedTokens: [],
  currentToken: null,
  priceHistory: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  isLoading: false,
  error: null,
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tokens
      .addCase(fetchTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens = action.payload.tokens;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch tokens';
      })
      
      // Fetch Trending Tokens
      .addCase(fetchTrendingTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trendingTokens = action.payload;
      })
      .addCase(fetchTrendingTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch trending tokens';
      })
      
      // Fetch New Listings
      .addCase(fetchNewListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.newListings = action.payload;
      })
      .addCase(fetchNewListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch new listings';
      })
      
      // Fetch Graduating Tokens
      .addCase(fetchGraduatingTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGraduatingTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.graduatingTokens = action.payload;
      })
      .addCase(fetchGraduatingTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch graduating tokens';
      })
      
      // Fetch Graduated Tokens
      .addCase(fetchGraduatedTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGraduatedTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.graduatedTokens = action.payload;
      })
      .addCase(fetchGraduatedTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch graduated tokens';
      })
      
      // Fetch Token Details
      .addCase(fetchTokenDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTokenDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentToken = action.payload;
      })
      .addCase(fetchTokenDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch token details';
      })
      
      // Fetch Token Price History
      .addCase(fetchTokenPriceHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTokenPriceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.priceHistory = action.payload;
      })
      .addCase(fetchTokenPriceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch price history';
      });
  },
});

export const { clearError } = tokenSlice.actions;
export default tokenSlice.reducer;