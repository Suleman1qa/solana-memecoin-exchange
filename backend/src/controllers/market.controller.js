const Token = require('../models/token.model');
const Order = require('../models/order.model');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const marketService = require('../services/market.service');
const socketService = require('../services/socket.service');

exports.getTradingPairs = catchAsync(async (req, res, next) => {
  const { base, quote } = req.query;
  
  // Get trading pairs
  const pairs = await marketService.getTradingPairs(base, quote);
  
  res.status(200).json({
    success: true,
    data: pairs
  });
});

exports.getOrderBook = catchAsync(async (req, res, next) => {
  const { pairId } = req.params;
  const { depth = 50 } = req.query;
  
  // Validate trading pair
  const pair = await marketService.getTradingPair(pairId);
  if (!pair) {
    return next(new AppError('Trading pair not found', 404));
  }
  
  // Get order book
  const orderBook = await marketService.getOrderBook(pairId, parseInt(depth));
  
  res.status(200).json({
    success: true,
    data: orderBook
  });
});

exports.getRecentTrades = catchAsync(async (req, res, next) => {
  const { pairId } = req.params;
  const { limit = 50 } = req.query;
  
  // Validate trading pair
  const pair = await marketService.getTradingPair(pairId);
  if (!pair) {
    return next(new AppError('Trading pair not found', 404));
  }
  
  // Get recent trades
  const trades = await marketService.getRecentTrades(pairId, parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: trades
  });
});

exports.getMarketSummary = catchAsync(async (req, res, next) => {
  // Get market summary
  const summary = await marketService.getMarketSummary();
  
  res.status(200).json({
    success: true,
    data: summary
  });
});

exports.placeOrder = catchAsync(async (req, res, next) => {
  const { pairId, type, side, amount, price, stopPrice } = req.body;
  const userId = req.user._id;
  
  // Validate trading pair
  const pair = await marketService.getTradingPair(pairId);
  if (!pair) {
    return next(new AppError('Trading pair not found', 404));
  }
  
  // Validate order type
  if ((type === 'LIMIT' || type === 'STOP_LIMIT') && !price) {
    return next(new AppError('Price is required for limit orders', 400));
  }
  
  if ((type === 'STOP_LIMIT' || type === 'STOP_MARKET') && !stopPrice) {
    return next(new AppError('Stop price is required for stop orders', 400));
  }
  
  // Place order
  const order = await marketService.placeOrder(
    userId,
    pairId,
    type,
    side,
    amount,
    price,
    stopPrice
  );
  
  // Notify clients via WebSocket
  socketService.notifyOrderUpdate(pairId, order);
  
  res.status(201).json({
    success: true,
    data: order
  });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const { status, pairId, page = 1, limit = 20 } = req.query;
  const userId = req.user._id;
  
  // Build filter
  const filter = { userId };
  if (status) filter.status = status;
  if (pairId) filter.pair = pairId;
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get orders
  const orders = await Order.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));
  
  // Count total
  const total = await Order.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  
  // Find order
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  
  // Check if order can be cancelled
  if (order.status === 'FILLED' || order.status === 'CANCELLED' || order.status === 'REJECTED') {
    return next(new AppError(`Order cannot be cancelled: status is ${order.status}`, 400));
  }
  
  // Cancel order
  const cancelledOrder = await marketService.cancelOrder(orderId);
  
  // Notify clients via WebSocket
  socketService.notifyOrderUpdate(order.pair, cancelledOrder);
  
  res.status(200).json({
    success: true,
    data: cancelledOrder
  });
});