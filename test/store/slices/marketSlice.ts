import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TokenPrice {
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
}

interface MarketData {
  [tokenMint: string]: TokenPrice;
}

interface MarketState {
  marketData: MarketData;
  selectedToken: string | null;
  isLoading: boolean;
  error: string | null;
  userOrders: any[]; // Add userOrders to state
}

export const fetchUserOrders = createAsyncThunk(
  "market/fetchUserOrders",
  async (_, thunkAPI) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Return mock orders
    return [
      { id: 1, status: "OPEN" },
      { id: 2, status: "FILLED" },
      { id: 3, status: "PARTIALLY_FILLED" },
    ];
  }
);

const initialState: MarketState = {
  marketData: {},
  selectedToken: null,
  isLoading: false,
  error: null,
  userOrders: [],
};

export const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    setMarketLoading: (state: MarketState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setMarketError: (state: MarketState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateMarketData: (
      state: MarketState,
      action: PayloadAction<MarketData>
    ) => {
      state.marketData = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateTokenPrice: (
      state: MarketState,
      action: PayloadAction<{ tokenMint: string; priceData: TokenPrice }>
    ) => {
      const { tokenMint, priceData } = action.payload;
      state.marketData[tokenMint] = priceData;
    },
    setSelectedToken: (state: MarketState, action: PayloadAction<string>) => {
      state.selectedToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch orders";
      });
  },
});

export const {
  setMarketLoading,
  setMarketError,
  updateMarketData,
  updateTokenPrice,
  setSelectedToken,
} = marketSlice.actions;

export default marketSlice.reducer;
