import Token from '../models/token.model.js';
import PriceHistory from '../models/priceHistory.model.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import * as solanaService from '../services/solana.service.js';
import marketDataService from '../services/marketData.service.js';

export const getTokens = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    category,
    status,
    sort = '-createdAt',
    search
  } = req.query;
  
  // Build filter object
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  
  // Handle search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { symbol: { $regex: search, $options: 'i' } },
      { address: search }
    ];
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query
  const tokens = await Token.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Count total documents
  const total = await Token.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: {
      tokens,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

export const getTrendingTokens = catchAsync(async (req, res, next) => {
  const { timeframe = '24h', limit = 10 } = req.query;
  
  // Get trending tokens based on price change or volume
  let sortField;
  switch (timeframe) {
    case '1h':
      sortField = '-priceChange1h';
      break;
    case '7d':
      sortField = '-priceChange7d';
      break;
    default:
      sortField = '-priceChange24h';
  }
  
  const tokens = await Token.find({
    category: 'MEMECOIN',
    status: { $ne: 'DELISTED' }
  })
    .sort(sortField)
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: tokens
  });
});

export const getNewListings = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const tokens = await Token.find({
    status: 'NEW',
    category: 'MEMECOIN'
  })
    .sort('-launchDate')
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: tokens
  });
});

export const getGraduatingTokens = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const tokens = await Token.find({
    status: 'GRADUATING',
    category: 'MEMECOIN'
  })
    .sort('-volume24h')
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: tokens
  });
});

export const getGraduatedTokens = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const tokens = await Token.find({
    status: 'GRADUATED',
    category: 'MEMECOIN'
  })
    .sort('-marketCapUSD')
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: tokens
  });
});

export const getTokenByAddress = catchAsync(async (req, res, next) => {
  const { address } = req.params;
  
  // Find token by address
  const token = await Token.findOne({ address });
  
  if (!token) {
    return next(new AppError('Token not found', 404));
  }
  
  // Get additional market data
  const marketData = await marketDataService.getTokenMarketData(address);
  
  res.status(200).json({
    success: true,
    data: {
      ...token.toObject(),
      marketData
    }
  });
});

export const getTokenPriceHistory = catchAsync(async (req, res, next) => {
  const { address } = req.params;
  const { interval = '1h', from, to } = req.query;
  
  // Validate token exists
  const token = await Token.findOne({ address });
  if (!token) {
    return next(new AppError('Token not found', 404));
  }
  
  // Build filter for price history
  const filter = {
    tokenId: token._id,
    interval
  };
  
  if (from) {
    filter.timestamp = { $gte: new Date(from) };
  }
  
  if (to) {
    filter.timestamp = { ...filter.timestamp, $lte: new Date(to) };
  }
  
  // Get price history
  const priceHistory = await PriceHistory.find(filter).sort('timestamp');
  
  res.status(200).json({
    success: true,
    data: priceHistory
  });
});

export const createToken = catchAsync(async (req, res, next) => {
  const {
    address,
    name,
    symbol,
    decimals,
    totalSupply,
    logoURI,
    category,
    status,
    website,
    twitter,
    telegram,
    discord,
    description
  } = req.body;
  
  // Check if token already exists
  const existingToken = await Token.findOne({ address });
  if (existingToken) {
    return next(new AppError('Token with this address already exists', 400));
  }
  
  // Verify token on Solana
  try {
    await solanaService.verifyToken(address);
  } catch (error) {
    return next(new AppError(`Invalid token address: ${error.message}`, 400));
  }
  
  // Create token
  const token = await Token.create({
    address,
    name,
    symbol,
    decimals,
    totalSupply,
    logoURI,
    category,
    status,
    website,
    twitter,
    telegram,
    discord,
    description,
    launchDate: Date.now()
  });
  
  res.status(201).json({
    success: true,
    data: token
  });
});

export const updateToken = catchAsync(async (req, res, next) => {
  const { address } = req.params;
  const updateData = req.body;
  
  // Find token
  const token = await Token.findOne({ address });
  if (!token) {
    return next(new AppError('Token not found', 404));
  }
  
  // Prevent updating certain fields
  delete updateData.address;
  delete updateData.createdAt;
  
  // Update token
  const updatedToken = await Token.findOneAndUpdate(
    { address },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: updatedToken
  });
});

export const deleteToken = catchAsync(async (req, res, next) => {
  const { address } = req.params;
  
  // Find and delete token
  const token = await Token.findOneAndDelete({ address });
  
  if (!token) {
    return next(new AppError('Token not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Token deleted successfully'
  });
});