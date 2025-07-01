import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  loading: boolean;
  error: string | null;
}

const initialState: MarketState = {
  marketData: {},
  selectedToken: null,
  loading: false,
  error: null,
};

export const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    setMarketLoading: (state: MarketState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    setMarketError: (state: MarketState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateMarketData: (
      state: MarketState,
      action: PayloadAction<MarketData>
    ) => {
      state.marketData = action.payload;
      state.loading = false;
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
});

export const {
  setMarketLoading,
  setMarketError,
  updateMarketData,
  updateTokenPrice,
  setSelectedToken,
} = marketSlice.actions;

export default marketSlice.reducer;
