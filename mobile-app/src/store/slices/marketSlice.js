import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import marketService from '../../services/marketService.js';

// Async thunks
export const fetchTradingPairs = createAsyncThunk(
  'market/fetchTradingPairs',
  async ({ base, quote }, { rejectWithValue }) => {
    try {
      return await marketService.getTradingPairs(base, quote);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchOrderBook = createAsyncThunk(
  'market/fetchOrderBook',
  async ({ pairId, depth = 50 }, { rejectWithValue }) => {
    try {
      return await marketService.getOrderBook(pairId, depth);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchRecentTrades = createAsyncThunk(
  'market/fetchRecentTrades',
  async ({ pairId, limit = 50 }, { rejectWithValue }) => {
    try {
      return await marketService.getRecentTrades(pairId, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchMarketSummary = createAsyncThunk(
  'market/fetchMarketSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await marketService.getMarketSummary();
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  'market/placeOrder',
  async ({ pairId, type, side, amount, price, stopPrice }, { rejectWithValue }) => {
    try {
      return await marketService.placeOrder(pairId, type, side, amount, price, stopPrice);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'market/fetchUserOrders',
  async ({ status, pairId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      return await marketService.getUserOrders(status, pairId, page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'market/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      return await marketService.cancelOrder(orderId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  tradingPairs: [],
  currentPair: null,
  orderBook: { bids: [], asks: [], timestamp: null },
  recentTrades: [],
  marketSummary: [],
  userOrders: [],
  ordersPagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  isLoading: false,
  orderPlaced: false,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPair: (state, action) => {
      state.currentPair = action.payload;
    },
    resetOrderPlaced: (state) => {
      state.orderPlaced = false;
    },
    updateOrderBook: (state, action) => {
      state.orderBook = action.payload;
    },
    updateRecentTrades: (state, action) => {
      state.recentTrades = [action.payload, ...state.recentTrades].slice(0, 50);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trading Pairs
      .addCase(fetchTradingPairs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTradingPairs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tradingPairs = action.payload;
        // Set current pair if not set and pairs exist
        if (!state.currentPair && action.payload.length > 0) {
          state.currentPair = action.payload[0];
        }
      })
      .addCase(fetchTradingPairs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch trading pairs';
      })
      
      // Fetch Order Book
      .addCase(fetchOrderBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderBook = action.payload;
      })
      .addCase(fetchOrderBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch order book';
      })
      
      // Fetch Recent Trades
      .addCase(fetchRecentTrades.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentTrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentTrades = action.payload;
      })
      .addCase(fetchRecentTrades.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch recent trades';
      })
      
      // Fetch Market Summary
      .addCase(fetchMarketSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.marketSummary = action.payload;
      })
      .addCase(fetchMarketSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch market summary';
      })
      
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true;
        state.orderPlaced = false;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.isLoading = false;
        state.orderPlaced = true;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to place order';
      })
      
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userOrders = action.payload.orders;
        state.ordersPagination = action.payload.pagination;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch user orders';
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update order in userOrders
        const index = state.userOrders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.userOrders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to cancel order';
      });
  },
});

export const { clearError, setCurrentPair, resetOrderPlaced, updateOrderBook, updateRecentTrades } = marketSlice.actions;
export default marketSlice.reducer;