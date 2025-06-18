import io from 'socket.io-client';
import { WEBSOCKET_URL } from '@env';
import { store } from '../store/index.js';
import { updateOrderBook, updateRecentTrades } from '../store/slices/marketSlice';
import { fetchWalletDetails } from '../store/slices/walletSlice';

let socket = null;
let isConnected = false;
let reconnectTimer = null;
let subscribedChannels = [];

const defaultUrl = 'ws://localhost:5000';

export const connectSocket = (userId) => {
  if (socket) {
    return;
  }

  socket = io(WEBSOCKET_URL || defaultUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    isConnected = true;
    // Authenticate with userId
    if (userId) {
      socket.emit('authenticate', { userId });
    }
    
    // Resubscribe to previously subscribed channels
    if (subscribedChannels.length > 0) {
      socket.emit('subscribe', subscribedChannels);
    }
    
    // Clear reconnect timer if it exists
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
    isConnected = false;
    
    // Set up reconnect timer
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectSocket(userId);
      }, 5000);
    }
  });
  
  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error);
    isConnected = false;
  });
  
  // Handle wallet updates
  socket.on('wallet_update', ({ walletId }) => {
    const state = store.getState();
    const currentWallet = state.wallet.currentWallet;
    
    if (currentWallet && currentWallet._id === walletId) {
      store.dispatch(fetchWalletDetails(walletId));
    }
  });
  
  // Handle order book updates
  socket.on('order_book', (data) => {
    if (data && data.pairId) {
      store.dispatch(updateOrderBook(data));
    }
  });
  
  // Handle trade updates
  socket.on('trade_update', (data) => {
    if (data && data.pairId) {
      store.dispatch(updateRecentTrades(data));
    }
  });
  
  // Handle ticker updates (price, volume, etc.)
  socket.on('ticker', (data) => {
    // Update current pair information in the market state
    // This will be implemented in the marketSlice
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    subscribedChannels = [];
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }
};

export const reconnectSocket = (userId) => {
  disconnectSocket();
  connectSocket(userId);
};

export const subscribeToMarket = (pairId) => {
  if (!socket || !isConnected) {
    subscribedChannels.push(`market:${pairId}`);
    return;
  }
  
  socket.emit('subscribe', [`market:${pairId}`]);
  subscribedChannels.push(`market:${pairId}`);
};

export const unsubscribeFromMarket = (pairId) => {
  if (!socket || !isConnected) {
    subscribedChannels = subscribedChannels.filter(channel => channel !== `market:${pairId}`);
    return;
  }
  
  socket.emit('unsubscribe', [`market:${pairId}`]);
  subscribedChannels = subscribedChannels.filter(channel => channel !== `market:${pairId}`);
};

export default {
  connectSocket,
  disconnectSocket,
  reconnectSocket,
  subscribeToMarket,
  unsubscribeFromMarket,
};