import apiClient from './apiClient.js';

const walletService = {
  getUserWallets: async () => {
    const response = await apiClient.get('/wallets');
    return response.data.data;
  },
  
  getWalletById: async (walletId) => {
    const response = await apiClient.get(`/wallets/${walletId}`);
    return response.data.data;
  },
    getTransactionHistory: async (walletId, status, type, page = 1, limit = 50) => {
    let url = `/transactions?walletId=${walletId}&page=${page}&limit=${limit}`;
    
    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
  
  createWallet: async (type, label) => {
    const response = await apiClient.post('/wallets', {
      type,
      label,
    });
    return response.data.data;
  },
  
  updateWallet: async (walletId, label) => {
    const response = await apiClient.put(`/wallets/${walletId}`, {
      label,
    });
    return response.data.data;
  },
  
  transferBetweenWallets: async (sourceWalletId, destinationWalletId, tokenAddress, amount) => {
    const response = await apiClient.post(`/wallets/${sourceWalletId}/transfer`, {
      destinationWalletId,
      tokenAddress,
      amount,
    });
    return response.data.data;
  },
  
  depositFunds: async (walletId, tokenAddress, amount, txHash) => {
    const response = await apiClient.post('/wallets/deposit', {
      walletId,
      tokenAddress,
      amount,
      txHash,
    });
    return response.data.data;
  },
  
  withdrawFunds: async (walletId, tokenAddress, amount, destinationAddress) => {
    const response = await apiClient.post('/wallets/withdraw', {
      walletId,
      tokenAddress,
      amount,
      destinationAddress,
    });
    return response.data.data;
  },
  
  swapTokens: async (walletId, fromTokenAddress, toTokenAddress, amount, slippageTolerance) => {
    const response = await apiClient.post('/wallets/swap', {
      walletId,
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippageTolerance,
    });
    return response.data.data;
  },
};

export default walletService;
