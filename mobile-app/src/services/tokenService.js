import apiClient from './apiClient.js';

const tokenService = {
  getTokens: async (page = 1, limit = 20, category, status, sort, search) => {
    let url = `/tokens?page=${page}&limit=${limit}`;
    
    if (category) url += `&category=${category}`;
    if (status) url += `&status=${status}`;
    if (sort) url += `&sort=${sort}`;
    if (search) url += `&search=${search}`;
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
  
  getTrendingTokens: async (timeframe = '24h', limit = 10) => {
    const response = await apiClient.get(`/tokens/trending?timeframe=${timeframe}&limit=${limit}`);
    return response.data.data;
  },
  
  getNewListings: async (limit = 10) => {
    const response = await apiClient.get(`/tokens/new-listings?limit=${limit}`);
    return response.data.data;
  },
  
  getGraduatingTokens: async (limit = 10) => {
    const response = await apiClient.get(`/tokens/graduating?limit=${limit}`);
    return response.data.data;
  },
  
  getGraduatedTokens: async (limit = 10) => {
    const response = await apiClient.get(`/tokens/graduated?limit=${limit}`);
    return response.data.data;
  },
  
  getTokenByAddress: async (address) => {
    const response = await apiClient.get(`/tokens/${address}`);
    return response.data.data;
  },
  
  getTokenPriceHistory: async (address, interval = '1h', from, to) => {
    let url = `/tokens/${address}/price-history?interval=${interval}`;
    
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
};

export default tokenService;