import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  publicKey: null,
  connected: false,
  balance: {
    sol: "0",
    tokens: {},
  },
  loading: false,
  error: null,
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletLoading: (state: WalletState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    setWalletError: (state: WalletState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    connectWallet: (state: WalletState, action: PayloadAction<string>) => {
      state.publicKey = action.payload;
      state.connected = true;
      state.loading = false;
      state.error = null;
    },
    disconnectWallet: (state: WalletState) => {
      state.publicKey = null;
      state.connected = false;
      state.balance = initialState.balance;
      state.loading = false;
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
