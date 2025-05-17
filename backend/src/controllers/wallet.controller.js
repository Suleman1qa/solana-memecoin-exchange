import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import Token from '../models/token.model.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import walletService from '../services/wallet.service.js';
import solanaService from '../services/solana.service.js';

export const getUserWallets = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  // Find all wallets for the user
  const wallets = await Wallet.find({ userId });
  
  res.status(200).json({
    success: true,
    data: wallets
  });
});

export const createWallet = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { type = 'FUNDING', label = 'My Wallet' } = req.body;
  
  // Create wallet
  const wallet = await walletService.createWallet(userId, type, label);
  
  res.status(201).json({
    success: true,
    data: wallet
  });
});

export const getWalletById = catchAsync(async (req, res, next) => {
  const { walletId } = req.params;
  const userId = req.user._id;
  
  // Find wallet
  const wallet = await Wallet.findOne({ _id: walletId, userId });
  
  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }
  
  // Get wallet balances with token details
  const walletWithTokenDetails = await walletService.getWalletWithTokenDetails(wallet);
  
  res.status(200).json({
    success: true,
    data: walletWithTokenDetails
  });
});

export const updateWallet = catchAsync(async (req, res, next) => {
  const { walletId } = req.params;
  const { label } = req.body;
  const userId = req.user._id;
  
  // Update wallet
  const wallet = await Wallet.findOneAndUpdate(
    { _id: walletId, userId },
    { $set: { label } },
    { new: true, runValidators: true }
  );
  
  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: wallet
  });
});

export const transferBetweenWallets = catchAsync(async (req, res, next) => {
  const { walletId } = req.params;
  const { destinationWalletId, tokenAddress, amount } = req.body;
  const userId = req.user._id;
  
  // Validate wallets
  const sourceWallet = await Wallet.findOne({ _id: walletId, userId });
  if (!sourceWallet) {
    return next(new AppError('Source wallet not found', 404));
  }
  
  const destinationWallet = await Wallet.findOne({ _id: destinationWalletId, userId });
  if (!destinationWallet) {
    return next(new AppError('Destination wallet not found', 404));
  }
  
  // Validate token
  const token = await Token.findOne({ address: tokenAddress });
  if (!token) {
    return next(new AppError('Token not found', 404));
  }
  
  // Process transfer
  const result = await walletService.transferBetweenWallets(
    userId,
    sourceWallet._id,
    destinationWallet._id,
    token._id,
    amount
  );
  
  res.status(200).json({
    success: true,
    data: result
  });
});

export const depositFunds = catchAsync(async (req, res, next) => {
  const { walletId, tokenAddress, amount, txHash } = req.body;
  const userId = req.user._id;
  
  // Validate wallet
  const wallet = await Wallet.findOne({ _id: walletId, userId });
  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }
  
  // Validate token
  const token = await Token.findOne({ address: tokenAddress });
  if (!token) {
    return next(new AppError('Token not found', 404));
  }
  
  // Verify transaction on Solana
  const verifiedTx = await solanaService.verifyTransaction(txHash, wallet.address, tokenAddress, amount);
  if (!verifiedTx.success) {
    return next(new AppError(`Transaction verification failed: ${verifiedTx.message}`, 400));
  }
  
  // Process deposit
  const result = await walletService.depositFunds(userId, walletId, token._id, amount, txHash);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

export const withdrawFunds = catchAsync(async (req, res, next) => {
  const { walletId, tokenAddress, amount, destinationAddress } = req.body;
  const userId = req.user._id;
  
  // Validate wallet
  const wallet = await Wallet.findOne({ _id: walletId, userId });
  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }
  
  // Validate token
  const token = await Token.findOne({ address: tokenAddress });
  if (!token) {
    return next(new AppError('Token not found', 404));
  }
  
  // Process withdrawal
  const result = await walletService.withdrawFunds(
    userId,
    walletId,
    token._id,
    amount,
    destinationAddress
  );
  
  res.status(200).json({
    success: true,
    data: result
  });
});

export const swapTokens = catchAsync(async (req, res, next) => {
  const { walletId, fromTokenAddress, toTokenAddress, amount, slippageTolerance = 1 } = req.body;
  const userId = req.user._id;
  
  // Validate wallet
  const wallet = await Wallet.findOne({ _id: walletId, userId });
  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }
  
  // Validate tokens
  const fromToken = await Token.findOne({ address: fromTokenAddress });
  if (!fromToken) {
    return next(new AppError('From token not found', 404));
  }
  
  const toToken = await Token.findOne({ address: toTokenAddress });
  if (!toToken) {
    return next(new AppError('To token not found', 404));
  }
  
  // Process swap
  const result = await walletService.swapTokens(
    userId,
    walletId,
    fromToken._id,
    toToken._id,
    amount,
    slippageTolerance
  );
  
  res.status(200).json({
    success: true,
    data: result
  });
});