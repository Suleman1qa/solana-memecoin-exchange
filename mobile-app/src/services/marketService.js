import apiClient from './apiClient';

const marketService = {
  getTradingPairs: async (base, quote) => {
    let url = '/market/pairs';
    
    if (base || quote) {
      url += '?';
      if (base) url += `base=${base}`;
      if (base && quote) url += '&';
      if (quote) url += `quote=${quote}`;
    }
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
  
  getOrderBook: async (pairId, depth = 50) => {
    const response = await apiClient.get(`/market/pairs/${pairId}/orderbook?depth=${depth}`);
    return response.data.data;
  },
  
  getRecentTrades: async (pairId, limit = 50) => {
    const response = await apiClient.get(`/market/pairs/${pairId}/trades?limit=${limit}`);
    return response.data.data;
  },
  
  getMarketSummary: async () => {
    const response = await apiClient.get('/market/summary');
    return response.data.data;
  },
  
  placeOrder: async (pairId, type, side, amount, price, stopPrice) => {
    const payload = {
      pairId,
      type,
      side,
      amount,
    };
    
    if (type !== 'MARKET') {
      payload.price = price;
    }
    
    if (type.startsWith('STOP')) {
      payload.stopPrice = stopPrice;
    }
    
    const response = await apiClient.post('/market/orders', payload);
    return response.data.data;
  },
  
  getUserOrders: async (status, pairId, page = 1, limit = 20) => {
    let url = `/market/orders?page=${page}&limit=${limit}`;
    
    if (status) url += `&status=${status}`;
    if (pairId) url += `&pairId=${pairId}`;
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
  
  cancelOrder: async (orderId) => {
    const response = await apiClient.delete(`/market/orders/${orderId}`);
    return response.data.data;
  },
};

export default marketService;