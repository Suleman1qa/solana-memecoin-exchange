import apiClient from './apiClient';

const stakingService = {
  getStakingPools: async () => {
    const response = await apiClient.get('/staking/pools');
    return response.data.data;
  },
  
  getUserStakes: async (walletId) => {
    const response = await apiClient.get(`/staking/stakes?walletId=${walletId}`);
    return response.data.data;
  },
  
  stake: async (walletId, poolId, amount) => {
    const response = await apiClient.post('/staking/stake', {
      walletId,
      poolId,
      amount
    });
    return response.data.data;
  },
  
  unstake: async (walletId, poolId, amount) => {
    const response = await apiClient.post('/staking/unstake', {
      walletId,
      poolId,
      amount
    });
    return response.data.data;
  },
  
  claimRewards: async (walletId, stakeId) => {
    const response = await apiClient.post('/staking/claim-rewards', {
      walletId,
      stakeId
    });
    return response.data.data;
  },
  
  getStakingAnalytics: async (walletId) => {
    const response = await apiClient.get(`/staking/analytics?walletId=${walletId}`);
    return response.data.data;
  },
};

export default stakingService;