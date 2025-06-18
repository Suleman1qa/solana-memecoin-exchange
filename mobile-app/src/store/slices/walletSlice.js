import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import walletService from '../../services/walletService.js';

// Async thunks
export const fetchWallets = createAsyncThunk(
  'wallet/fetchWallets',
  async (_, { rejectWithValue }) => {
    try {
      return await walletService.getUserWallets();
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);
// Add transaction history thunk
export const fetchTransactionHistory = createAsyncThunk(
  'wallet/fetchTransactionHistory',
  async ({ walletId, status, type, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      return await walletService.getTransactionHistory(walletId, status, type, page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchWalletDetails = createAsyncThunk(
  'wallet/fetchWalletDetails',
  async (walletId, { rejectWithValue }) => {
    try {
      return await walletService.getWalletById(walletId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createWallet = createAsyncThunk(
  'wallet/createWallet',
  async ({ type, label }, { rejectWithValue }) => {
    try {
      return await walletService.createWallet(type, label);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const transferBetweenWallets = createAsyncThunk(
  'wallet/transferBetweenWallets',
  async ({ sourceWalletId, destinationWalletId, tokenAddress, amount }, { rejectWithValue }) => {
    try {
      return await walletService.transferBetweenWallets(
        sourceWalletId,
        destinationWalletId,
        tokenAddress,
        amount
      );
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const depositFunds = createAsyncThunk(
  'wallet/depositFunds',
  async ({ walletId, tokenAddress, amount, txHash }, { rejectWithValue }) => {
    try {
      return await walletService.depositFunds(walletId, tokenAddress, amount, txHash);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  'wallet/withdrawFunds',
  async ({ walletId, tokenAddress, amount, destinationAddress }, { rejectWithValue }) => {
    try {
      return await walletService.withdrawFunds(walletId, tokenAddress, amount, destinationAddress);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const swapTokens = createAsyncThunk(
  'wallet/swapTokens',
  async ({ walletId, fromTokenAddress, toTokenAddress, amount, slippageTolerance }, { rejectWithValue }) => {
    try {
      return await walletService.swapTokens(
        walletId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        slippageTolerance
      );
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Update initial state to include blockchain field for multi-chain support
const initialState = {
  wallets: [], // Each wallet: { _id, address, label, blockchain, ... }
  currentWallet: null, // { ...wallet, blockchain }
  transactions: [],
  transactionsPagination: {
    total: 0,
    page: 1,
    limit: 50,
    pages: 0,
  },
  isLoading: false,
  error: null,
  operationSuccess: false,
  // Only Solana is supported for now, but can support USDT (as a token on Solana) and Solana memecoins
  supportedBlockchains: [
    { key: 'solana', label: 'Solana', icon: 'currency-solana' }
  ],
  selectedBlockchain: 'solana',
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.operationSuccess = false;
    },
    setCurrentWallet: (state, action) => {
      state.currentWallet = action.payload;
    },
    setSelectedBlockchain: (state, action) => {
      state.selectedBlockchain = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

          // Fetch Transaction History
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.transactionsPagination = action.payload.pagination;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch transaction history';
      })
      // Fetch Wallets
      .addCase(fetchWallets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallets = action.payload;
        // Set current wallet if not set and wallets exist
        if (!state.currentWallet && action.payload.length > 0) {
          state.currentWallet = action.payload[0];
        }
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch wallets';
      })
      
      // Fetch Wallet Details
      .addCase(fetchWalletDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWallet = action.payload;
        // Update wallet in wallets array
        const index = state.wallets.findIndex(wallet => wallet._id === action.payload._id);
        if (index !== -1) {
          state.wallets[index] = action.payload;
        }
      })
      .addCase(fetchWalletDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch wallet details';
      })
      
      // Create Wallet
      .addCase(createWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallets.push(action.payload);
        state.operationSuccess = true;
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create wallet';
        state.operationSuccess = false;
      })
      
      // Other operations (transfer, deposit, withdraw, swap)
      .addCase(transferBetweenWallets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(transferBetweenWallets.fulfilled, (state) => {
        state.isLoading = false;
        state.operationSuccess = true;
      })
      .addCase(transferBetweenWallets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Transfer failed';
        state.operationSuccess = false;
      })
      
      .addCase(depositFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(depositFunds.fulfilled, (state) => {
        state.isLoading = false;
        state.operationSuccess = true;
      })
      .addCase(depositFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Deposit failed';
        state.operationSuccess = false;
      })
      
      .addCase(withdrawFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(withdrawFunds.fulfilled, (state) => {
        state.isLoading = false;
        state.operationSuccess = true;
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Withdrawal failed';
        state.operationSuccess = false;
      })
      
      .addCase(swapTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(swapTokens.fulfilled, (state) => {
        state.isLoading = false;
        state.operationSuccess = true;
      })
      .addCase(swapTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Swap failed';
        state.operationSuccess = false;
      });
  },
});

export const { clearError, clearSuccess, setCurrentWallet, setSelectedBlockchain } = walletSlice.actions;
export default walletSlice.reducer;