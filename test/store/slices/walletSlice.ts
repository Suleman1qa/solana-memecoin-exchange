import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";

interface Balance {
  sol: string;
  tokens: {
    [mint: string]: {
      amount: string;
      decimals: number;
    };
  };
}

interface WalletState {
  publicKey: string | null;
  connected: boolean;
  balance: Balance;
  isLoading: boolean;
  error: string | null;
  wallets: any[]; // Add wallets to state
}

export const fetchWallets = createAsyncThunk(
  "wallet/fetchWallets",
  async (_, thunkAPI) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Return mock wallet data
    return [
      {
        id: "wallet1",
        balances: [
          { amount: "1.23", token: { priceUSD: "150" } },
          { amount: "0.5", token: { priceUSD: "2" } },
        ],
      },
    ];
  }
);

const initialState: WalletState = {
  publicKey: null,
  connected: false,
  balance: {
    sol: "0",
    tokens: {},
  },
  isLoading: false,
  error: null,
  wallets: [],
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletLoading: (state: WalletState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setWalletError: (state: WalletState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    connectWallet: (state: WalletState, action: PayloadAction<string>) => {
      state.publicKey = action.payload;
      state.connected = true;
      state.isLoading = false;
      state.error = null;
    },
    disconnectWallet: (state: WalletState) => {
      state.publicKey = null;
      state.connected = false;
      state.balance = initialState.balance;
      state.isLoading = false;
      state.error = null;
    },
    updateBalance: (state: WalletState, action: PayloadAction<Balance>) => {
      state.balance = action.payload;
    },
    updateTokenBalance: (
      state: WalletState,
      action: PayloadAction<{
        mint: string;
        amount: string;
        decimals: number;
      }>
    ) => {
      const { mint, amount, decimals } = action.payload;
      state.balance.tokens[mint] = { amount, decimals };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.wallets = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch wallets";
      });
  },
});

export const {
  setWalletLoading,
  setWalletError,
  connectWallet,
  disconnectWallet,
  updateBalance,
  updateTokenBalance,
} = walletSlice.actions;

export default walletSlice.reducer;
