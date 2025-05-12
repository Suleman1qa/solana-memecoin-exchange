const Token = require('../models/token.model');
const Order = require('../models/order.model');
const Transaction = require('../models/transaction.model');
const TradingPair = require('../models/tradingPair.model');
const Trade = require('../models/trade.model');
const AppError = require('../utils/appError');
const walletService = require('./wallet.service');
const socketService = require('./socket.service');
const BigNumber = require('bignumber.js');

// Get trading pairs
exports.getTradingPairs = async (base, quote) => {
  // Build filter
  const filter = {};
  if (base) filter.baseToken = base;
  if (quote) filter.quoteToken = quote;
  
  const pairs = await TradingPair.find(filter)
    .populate('baseToken')
    .populate('quoteToken');
  
  return pairs;
};

// Get a single trading pair
exports.getTradingPair = async (pairId) => {
  const pair = await TradingPair.findById(pairId)
    .populate('baseToken')
    .populate('quoteToken');
  
  return pair;
};

// Get order book
exports.getOrderBook = async (pairId, depth = 50) => {
  const pair = await TradingPair.findById(pairId);
  if (!pair) {
    throw new AppError('Trading pair not found', 404);
  }
  
  // Get buy orders (bids)
  const bids = await Order.find({
    pair: pairId,
    side: 'BUY',
    status: { $in: ['OPEN', 'PARTIALLY_FILLED'] },
    type: { $in: ['LIMIT', 'STOP_LIMIT'] }
  })
    .sort('-price')
    .limit(depth);
  
  // Get sell orders (asks)
  const asks = await Order.find({
    pair: pairId,
    side: 'SELL',
    status: { $in: ['OPEN', 'PARTIALLY_FILLED'] },
    type: { $in: ['LIMIT', 'STOP_LIMIT'] }
  })
    .sort('price')
    .limit(depth);
  
  // Aggregate orders by price level
  const aggregatedBids = this.aggregateOrdersByPrice(bids);
  const aggregatedAsks = this.aggregateOrdersByPrice(asks);
  
  return {
    bids: aggregatedBids,
    asks: aggregatedAsks,
    timestamp: Date.now()
  };
};

// Aggregate orders by price
exports.aggregateOrdersByPrice = (orders) => {
  const priceMap = new Map();
  
  orders.forEach(order => {
    const price = order.price;
    const remainingAmount = new BigNumber(order.amount).minus(order.filled).toString();
    
    if (priceMap.has(price)) {
      const existingAmount = priceMap.get(price);
      priceMap.set(price, new BigNumber(existingAmount).plus(remainingAmount).toString());
    } else {
      priceMap.set(price, remainingAmount);
    }
  });
  
  // Convert to array of [price, amount] pairs
  return Array.from(priceMap.entries()).map(([price, amount]) => ({
    price,
    amount
  }));
};

// Get recent trades
exports.getRecentTrades = async (pairId, limit = 50) => {
  const trades = await Trade.find({ pair: pairId })
    .sort('-timestamp')
    .limit(limit);
  
  return trades;
};

// Get market summary
exports.getMarketSummary = async () => {
  // Get all trading pairs
  const pairs = await TradingPair.find()
    .populate('baseToken')
    .populate('quoteToken');
  
  // Get 24h data for each pair
  const summaryPromises = pairs.map(async (pair) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get 24h trades
    const trades = await Trade.find({
      pair: pair._id,
      timestamp: { $gte: oneDayAgo }
    });
    
    // Calculate 24h stats
    let volume = new BigNumber(0);
    let high = new BigNumber(0);
    let low = trades.length > 0 ? new BigNumber(trades[0].price) : new BigNumber(0);
    let lastPrice = new BigNumber(pair.lastPrice || 0);
    
    trades.forEach(trade => {
      const tradeAmount = new BigNumber(trade.amount);
      const tradePrice = new BigNumber(trade.price);
      
      // Update volume
      volume = volume.plus(tradeAmount.multipliedBy(tradePrice));
      
      // Update high/low
      if (tradePrice.isGreaterThan(high)) {
        high = tradePrice;
      }
      
      if (tradePrice.isLessThan(low) || low.isZero()) {
        low = tradePrice;
      }
      
      // Update last price
      if (trade.timestamp > new Date(pair.lastTradeTime || 0)) {
        lastPrice = tradePrice;
      }
    });
    
    // Get first trade price 24h ago to calculate price change
    const oldestTrade = await Trade.findOne({
      pair: pair._id,
      timestamp: { $gte: oneDayAgo }
    }).sort('timestamp');
    
    let priceChange = '0';
    let priceChangePercent = '0';
    
    if (oldestTrade && lastPrice.isGreaterThan(0)) {
      const oldPrice = new BigNumber(oldestTrade.price);
      priceChange = lastPrice.minus(oldPrice).toString();
      priceChangePercent = lastPrice.minus(oldPrice).dividedBy(oldPrice).multipliedBy(100).toString();
    }
    
    return {
      pair: {
        id: pair._id,
        name: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
        baseToken: pair.baseToken,
        quoteToken: pair.quoteToken
      },
      lastPrice: lastPrice.toString(),
      volume24h: volume.toString(),
      high24h: high.toString(),
      low24h: low.toString(),
      priceChange24h: priceChange,
      priceChangePercent24h: priceChangePercent
    };
  });
  
  const summaries = await Promise.all(summaryPromises);
  
  return summaries;
};

// Place order
exports.placeOrder = async (userId, pairId, type, side, amount, price, stopPrice) => {
  // Get trading pair
  const pair = await TradingPair.findById(pairId)
    .populate('baseToken')
    .populate('quoteToken');
  
  if (!pair) {
    throw new AppError('Trading pair not found', 404);
  }
  
  // Get user's trading wallet
  const wallet = await Wallet.findOne({
    userId,
    type: 'TRADING'
  });
  
  if (!wallet) {
    throw new AppError('Trading wallet not found', 404);
  }
  
  // Validate balance
  if (side === 'BUY') {
    // For buy orders, check quote token balance
    const quoteTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.quoteToken._id.toString()
    );
    
    if (!quoteTokenBalance) {
      throw new AppError(`${pair.quoteToken.symbol} not found in wallet`, 404);
    }
    
    const totalCost = new BigNumber(amount).multipliedBy(price);
    const availableBalance = new BigNumber(quoteTokenBalance.amount).minus(quoteTokenBalance.locked);
    
    if (availableBalance.isLessThan(totalCost)) {
      throw new AppError(`Insufficient ${pair.quoteToken.symbol} balance`, 400);
    }
    
    // Lock funds
    quoteTokenBalance.locked = new BigNumber(quoteTokenBalance.locked)
      .plus(totalCost)
      .toString();
    
    await wallet.save();
  } else { // SELL
    // For sell orders, check base token balance
    const baseTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.baseToken._id.toString()
    );
    
    if (!baseTokenBalance) {
      throw new AppError(`${pair.baseToken.symbol} not found in wallet`, 404);
    }
    
    const availableBalance = new BigNumber(baseTokenBalance.amount).minus(baseTokenBalance.locked);
    
    if (availableBalance.isLessThan(amount)) {
      throw new AppError(`Insufficient ${pair.baseToken.symbol} balance`, 400);
    }
    
    // Lock funds
    baseTokenBalance.locked = new BigNumber(baseTokenBalance.locked)
      .plus(amount)
      .toString();
    
    await wallet.save();
  }
  
  // Create order
  const order = await Order.create({
    userId,
    pair: pairId,
    type,
    side,
    price: type === 'MARKET' ? null : price,
    stopPrice: type.startsWith('STOP') ? stopPrice : null,
    amount,
    filled: '0',
    status: 'OPEN'
  });
  
  // If market order, execute immediately
  if (type === 'MARKET') {
    try {
      await this.executeMarketOrder(order, pair, wallet);
    } catch (error) {
      // If market order execution fails, unlock funds and mark order as rejected
      await this.cancelOrder(order._id);
      throw error;
    }
  } else {
    // For limit orders, try to match with existing orders
    await this.matchLimitOrder(order, pair, wallet);
  }
  
  return order;
};

// Execute market order
exports.executeMarketOrder = async (order, pair, wallet) => {
  // Implementation of market order execution
  // This would match against the order book and execute trades
  
  // For now, we'll just mark the order as filled for demonstration
  order.status = 'FILLED';
  order.filled = order.amount;
  await order.save();
  
  // Create a mock trade
  await Trade.create({
    pair: pair._id,
    price: pair.lastPrice || '1',
    amount: order.amount,
    side: order.side,
    makerOrderId: null,
    takerOrderId: order._id,
    timestamp: new Date()
  });
  
  // Update pair last price
  pair.lastPrice = pair.lastPrice || '1';
  pair.lastTradeTime = new Date();
  await pair.save();
  
  // Unlock funds and update balances
  await this.updateBalancesAfterTrade(order, pair, wallet);
  
  return order;
};

// Match limit order
exports.matchLimitOrder = async (order, pair, wallet) => {
  // Implementation of limit order matching
  // This would check for matching orders and execute trades
  
  // For this example, we'll just add the order to the book
  // In a real implementation, you would try to match against existing orders
  
  return order;
};

// Cancel order
exports.cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  
  if (order.status === 'FILLED' || order.status === 'CANCELLED' || order.status === 'REJECTED') {
    throw new AppError(`Cannot cancel order with status ${order.status}`, 400);
  }
  
  // Get pair and wallet
  const pair = await TradingPair.findById(order.pair);
  const wallet = await Wallet.findOne({
    userId: order.userId,
    type: 'TRADING'
  });
  
  // Unlock funds
  if (order.side === 'BUY') {
    const quoteTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.quoteToken.toString()
    );
    
    const lockedAmount = new BigNumber(order.amount)
      .minus(order.filled)
      .multipliedBy(order.price);
    
    quoteTokenBalance.locked = new BigNumber(quoteTokenBalance.locked)
      .minus(lockedAmount)
      .toString();
    
    await wallet.save();
  } else { // SELL
    const baseTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.baseToken.toString()
    );
    
    const lockedAmount = new BigNumber(order.amount).minus(order.filled);
    
    baseTokenBalance.locked = new BigNumber(baseTokenBalance.locked)
      .minus(lockedAmount)
      .toString();
    
    await wallet.save();
  }
  
  // Update order status
  order.status = 'CANCELLED';
  await order.save();
  
  return order;
};

// Update balances after trade
exports.updateBalancesAfterTrade = async (order, pair, wallet) => {
  if (order.side === 'BUY') {
    // Add base token
    const baseTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.baseToken._id.toString()
    );
    
    if (!baseTokenBalance) {
      // Add base token to wallet if not exists
      await walletService.addTokenToWallet(wallet._id, pair.baseToken._id);
      const updatedWallet = await Wallet.findById(wallet._id);
      baseTokenBalance = updatedWallet.balances.find(b => 
        b.token.toString() === pair.baseToken._id.toString()
      );
    }
    
    baseTokenBalance.amount = new BigNumber(baseTokenBalance.amount)
      .plus(order.filled)
      .toString();
    
    // Subtract and unlock quote token
    const quoteTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.quoteToken._id.toString()
    );
    
    const totalCost = new BigNumber(order.filled).multipliedBy(order.price);
    
    quoteTokenBalance.locked = new BigNumber(quoteTokenBalance.locked)
      .minus(totalCost)
      .toString();
    
    await wallet.save();
  } else { // SELL
    // Add quote token
    const quoteTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.quoteToken._id.toString()
    );
    
    if (!quoteTokenBalance) {
      // Add quote token to wallet if not exists
      await walletService.addTokenToWallet(wallet._id, pair.quoteToken._id);
      const updatedWallet = await Wallet.findById(wallet._id);
      quoteTokenBalance = updatedWallet.balances.find(b => 
        b.token.toString() === pair.quoteToken._id.toString()
      );
    }
    
    const totalReceived = new BigNumber(order.filled).multipliedBy(order.price);
    
    quoteTokenBalance.amount = new BigNumber(quoteTokenBalance.amount)
      .plus(totalReceived)
      .toString();
    
    // Subtract and unlock base token
    const baseTokenBalance = wallet.balances.find(b => 
      b.token.toString() === pair.quoteToken._id.toString()
    );
    
    const totalCost = new BigNumber(order.filled).multipliedBy(order.price);
    
    quoteTokenBalance.locked = new BigNumber(quoteTokenBalance.locked)
      .minus(totalCost)
      .toString();
    
    await wallet.save();
  }
  // } else { // SELL
  //   // Add quote token
  //   let quoteTokenBalance = wallet.balances.find(b => 
  //     b.token.toString() === pair.quoteToken._id.toString()
  //   );
    
  //   if (!quoteTokenBalance) {
  //     // Add quote token to wallet if not exists
  //     await walletService.addTokenToWallet(wallet._id, pair.quoteToken._id);
  //     const updatedWallet = await Wallet.findById(wallet._id);
  //     quoteTokenBalance = updatedWallet.balances.find(b => 
  //       b.token.toString() === pair.quoteToken._id.toString()
  //     );
  //   }
    
  //   const totalReceived = new BigNumber(order.filled).multipliedBy(order.price);
    
  //   quoteTokenBalance.amount = new BigNumber(quoteTokenBalance.amount)
  //     .plus(totalReceived)
  //     .toString();
    
  //   // Subtract and unlock base token
  //   const baseTokenBalance = wallet.balances.find(b => 
  //     b.token.toString() === pair.baseToken._id.toString()
  //   );
    
  //   baseTokenBalance.locked = new BigNumber(baseTokenBalance.locked)
  //     .minus(order.filled)
  //     .toString();
    
  //   await wallet.save();
  // }
  
  // Create transaction records
  if (order.side === 'BUY') {
    await Transaction.create({
      userId: order.userId,
      walletId: wallet._id,
      type: 'BUY',
      status: 'COMPLETED',
      tokenIn: pair.quoteToken._id,
      amountIn: new BigNumber(order.filled).multipliedBy(order.price).toString(),
      tokenOut: pair.baseToken._id,
      amountOut: order.filled,
      description: `Buy ${order.filled} ${pair.baseToken.symbol} with ${pair.quoteToken.symbol}`
    });
  } else {
    await Transaction.create({
      userId: order.userId,
      walletId: wallet._id,
      type: 'SELL',
      status: 'COMPLETED',
      tokenIn: pair.baseToken._id,
      amountIn: order.filled,
      tokenOut: pair.quoteToken._id,
      amountOut: new BigNumber(order.filled).multipliedBy(order.price).toString(),
      description: `Sell ${order.filled} ${pair.baseToken.symbol} for ${pair.quoteToken.symbol}`
    });
  }
  
  // Notify via WebSocket
  socketService.notifyWalletUpdate(order.userId, wallet._id);
};