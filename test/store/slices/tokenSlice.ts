import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

interface TokenState {
  tokens: { [mint: string]: TokenMetadata };
  popularTokens: string[];
  loading: boolean;
  error: string | null;
}

const initialState: TokenState = {
  tokens: {},
  popularTokens: [],
  loading: false,
  error: null,
};

export const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setTokenLoading: (state: TokenState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    setTokenError: (state: TokenState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTokens: (
      state: TokenState,
      action: PayloadAction<{ [mint: string]: TokenMetadata }>
    ) => {
      state.tokens = { ...state.tokens, ...action.payload };
      state.loading = false;
      state.error = null;
    },
    addToken: (state: TokenState, action: PayloadAction<TokenMetadata>) => {
      state.tokens[action.payload.mint] = action.payload;
    },
    setPopularTokens: (state: TokenState, action: PayloadAction<string[]>) => {
      state.popularTokens = action.payload;
    },
  },
});

export const {
  setTokenLoading,
  setTokenError,
  updateTokens,
  addToken,
  setPopularTokens,
} = tokenSlice.actions;

export default tokenSlice.reducer;
