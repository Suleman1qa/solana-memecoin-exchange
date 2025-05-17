import TradingPair from '../models/tradingPair.model.js';

let io;

const socketService = {
  initialize: (socketIo) => {
    io = socketIo;

    io.on('connection', (socket) => {
      console.log('New client connected');

      // Join user-specific room on authentication
      socket.on('authenticate', (data) => {
        if (data && data.userId) {
          socket.join(`user:${data.userId}`);
          console.log(`User ${data.userId} authenticated`);
        }
      });

      // Join market data rooms
      socket.on('subscribe', (channels) => {
        if (Array.isArray(channels)) {
          channels.forEach(channel => {
            socket.join(channel);
            console.log(`Subscribed to ${channel}`);
          });
        }
      });

      // Leave market data rooms
      socket.on('unsubscribe', (channels) => {
        if (Array.isArray(channels)) {
          channels.forEach(channel => {
            socket.leave(channel);
            console.log(`Unsubscribed from ${channel}`);
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    // Start periodic market updates
    setInterval(() => {
      socketService.broadcastMarketUpdates();
    }, 5000);
  },

  // Send wallet update to specific user
  notifyWalletUpdate: (userId, walletId) => {
    if (!io) return;

    io.to(`user:${userId}`).emit('wallet_update', { walletId });
  },

  // Send transaction update to specific user
  notifyTransactionUpdate: (userId, transactionId) => {
    if (!io) return;

    io.to(`user:${userId}`).emit('transaction_update', { transactionId });
  },

  // Send order update to market subscribers and user
  notifyOrderUpdate: (pairId, order) => {
    if (!io) return;

    // Broadcast to market channel (only public data)
    io.to(`market:${pairId}`).emit('order_update', {
      id: order._id,
      pair: order.pair,
      type: order.type,
      side: order.side,
      price: order.price,
      amount: order.amount,
      filled: order.filled,
      status: order.status,
      createdAt: order.createdAt
    });

    // Send full details to the user
    if (order.userId) {
      io.to(`user:${order.userId}`).emit('order_update', order);
    }
  },

  // Send trade update to market subscribers
  notifyTradeUpdate: (pairId, trade) => {
    if (!io) return;

    io.to(`market:${pairId}`).emit('trade_update', trade);
  },

  // Broadcast market updates periodically
  broadcastMarketUpdates: async () => {
    if (!io) return;

    try {
      // Get all trading pairs
      const pairs = await TradingPair.find()
        .populate('baseToken', 'symbol name')
        .populate('quoteToken', 'symbol name');

      // For each pair, broadcast ticker data
      pairs.forEach(pair => {
        io.to(`market:${pair._id}`).emit('ticker', {
          pair: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
          lastPrice: pair.lastPrice,
          volume24h: pair.volume24h,
          priceChange24h: pair.priceChange24h,
          priceChangePercent24h: pair.priceChangePercent24h,
          high24h: pair.high24h,
          low24h: pair.low24h,
          timestamp: Date.now()
        });
      });
    } catch (error) {
      console.error('Error broadcasting market updates:', error);
    }
  }
};

export default socketService;