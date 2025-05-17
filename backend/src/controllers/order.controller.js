import Order from '../models/order.model.js';
import TradingPair from '../models/tradingPair.model.js';
import Wallet from '../models/wallet.model.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import socketService from '../services/socket.service.js';
import marketService from '../services/market.service.js';

export const getUserOrders = catchAsync(async (req, res, next) => {
  const {
    status,
    pair,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;
  
  // Build filter
  const filter = { userId: req.user._id };
  if (status) filter.status = status;
  if (pair) filter.pair = pair;
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get orders
  const orders = await Order.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('pair', 'baseToken quoteToken');
  
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

export const getOrderById = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  
  // Find order
  const order = await Order.findOne({
    _id: orderId,
    userId: req.user._id
  }).populate('pair', 'baseToken quoteToken');
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

export const cancelOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  
  // Find order
  const order = await Order.findOne({
    _id: orderId,
    userId: req.user._id
  });
  
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  
  // Check if order can be cancelled
  if (['FILLED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
    return next(new AppError(`Order cannot be cancelled: status is ${order.status}`, 400));
  }
  
  // Cancel order using market service
  const cancelledOrder = await marketService.cancelOrder(orderId);
  
  // Notify clients via WebSocket
  socketService.notifyOrderUpdate(order.pair, cancelledOrder);
  
  res.status(200).json({
    success: true,
    data: cancelledOrder
  });
});

export const placeOrder = catchAsync(async (req, res, next) => {
  const { pair: pairId, type, side, amount, price, stopPrice } = req.body;
  const userId = req.user._id;
  
  // Validate trading pair
  const pair = await TradingPair.findById(pairId)
    .populate('baseToken')
    .populate('quoteToken');
  
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
  
  // Get user's trading wallet
  const wallet = await Wallet.findOne({
    userId,
    type: 'TRADING'
  });
  
  if (!wallet) {
    return next(new AppError('Trading wallet not found', 404));
  }
  
  // Place order
  const order = await marketService.placeOrder(
    userId,
    pairId,
    type,
    side,
    amount,
    price,
    stopPrice,
    wallet
  );
  
  // Notify clients via WebSocket
  socketService.notifyOrderUpdate(pairId, order);
  
  res.status(201).json({
    success: true,
    data: order
  });
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  const {
    userId,
    pair,
    status,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;
  
  // Build filter
  const filter = {};
  if (userId) filter.userId = userId;
  if (pair) filter.pair = pair;
  if (status) filter.status = status;
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get orders
  const orders = await Order.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'username email')
    .populate('pair', 'baseToken quoteToken');
  
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