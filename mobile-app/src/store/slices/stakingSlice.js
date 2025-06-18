import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stakingService from '../../services/stakingService';

// Async thunks
export const fetchStakingPools = createAsyncThunk(
  'staking/fetchStakingPools',
  async (_, { rejectWithValue }) => {
    try {
      return await stakingService.getStakingPools();
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchUserStakes = createAsyncThunk(
  'staking/fetchUserStakes',
  async (walletId, { rejectWithValue }) => {
    try {
      return await stakingService.getUserStakes(walletId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const stake = createAsyncThunk(
  'staking/stake',
  async ({ walletId, poolId, amount }, { rejectWithValue }) => {
    try {
      return await stakingService.stake(walletId, poolId, amount);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const unstake = createAsyncThunk(
  'staking/unstake',
  async ({ walletId, poolId, amount }, { rejectWithValue }) => {
    try {
      return await stakingService.unstake(walletId, poolId, amount);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const claimRewards = createAsyncThunk(
  'staking/claimRewards',
  async ({ walletId, stakeId }, { rejectWithValue }) => {
    try {
      return await stakingService.claimRewards(walletId, stakeId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  stakingPools: [],
  userStakes: [],
  totalStaked: '0',
  totalRewards: '0',
  isLoading: false,
  error: null,
  operationSuccess: false,
};

const stakingSlice = createSlice({
  name: 'staking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.operationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Staking Pools
      .addCase(fetchStakingPools.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStakingPools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stakingPools = action.payload;
      })
      .addCase(fetchStakingPools.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch staking pools';
      })
      
      // Fetch User Stakes
      .addCase(fetchUserStakes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStakes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStakes = action.payload.stakes;
        state.totalStaked = action.payload.totalStaked;
        state.totalRewards = action.payload.totalRewards;
      })
      .addCase(fetchUserStakes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch user stakes';
      })
      
      // Stake
      .addCase(stake.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(stake.fulfilled, (state) => {
        state.isLoading = false;
        state.operationSuccess = true;
      })
      .addCase(stake.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Staking failed';
        state.operationSuccess = false;
      })
      
      // Unstake
      .addCase(unstake.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(unstake.fulfilled, (state) => {
        state.isLoading = false;
        state.operationSuccess = true;
      })
      .addCase(unstake.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unstaking failed';
        state.operationSuccess = false;
      })
      
      // Claim Rewards
      .addCase(claimRewards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(claimRewards.fulfilled, (state) => {
        state.isLoading = false;
        state.operationSuccess = true;
      })
      .addCase(claimRewards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Claiming rewards failed';
        state.operationSuccess = false;
      });
  },
});
export const { clearError, clearSuccess } = stakingSlice.actions;
export default stakingSlice.reducer;
