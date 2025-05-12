const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get user transactions
exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const {
    walletId,
    type,
    status,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;
  
  // Build filter object
  const filter = { userId: req.user._id };
  if (walletId) filter.walletId = walletId;
  if (type) filter.type = type;
  if (status) filter.status = status;
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query with populate
  const transactions = await Transaction.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('tokenIn', 'symbol name')
    .populate('tokenOut', 'symbol name');
  
  // Count total documents
  const total = await Transaction.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// Get transaction by ID
exports.getTransactionById = catchAsync(async (req, res, next) => {
  const { transactionId } = req.params;
  
  // Find transaction
  const transaction = await Transaction.findOne({ 
    _id: transactionId,
    userId: req.user._id
  })
    .populate('tokenIn', 'symbol name address')
    .populate('tokenOut', 'symbol name address')
    .populate('walletId', 'address label');
  
  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: transaction
  });
});

// Get all transactions (admin only)
exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const {
    userId,
    walletId,
    type,
    status,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;
  
  // Build filter object
  const filter = {};
  if (userId) filter.userId = userId;
  if (walletId) filter.walletId = walletId;
  if (type) filter.type = type;
  if (status) filter.status = status;
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query with populate
  const transactions = await Transaction.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'username email')
    .populate('tokenIn', 'symbol name')
    .populate('tokenOut', 'symbol name')
    .populate('walletId', 'address label');
  
  // Count total documents
  const total = await Transaction.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// Update transaction (admin only)
exports.updateTransaction = catchAsync(async (req, res, next) => {
  const { transactionId } = req.params;
  const { status, txHash } = req.body;
  
  // Find transaction
  const transaction = await Transaction.findById(transactionId);
  
  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }
  
  // Update transaction fields
  transaction.status = status || transaction.status;
  if (txHash) transaction.txHash = txHash;
  
  // If status changed to COMPLETED, process the transaction
  if (transaction.status === 'COMPLETED' && 
      (transaction.type === 'DEPOSIT' || transaction.type === 'WITHDRAWAL')) {
    
    // Handle wallet balance updates based on transaction type
    const wallet = await Wallet.findById(transaction.walletId);
    
    if (!wallet) {
      return next(new AppError('Wallet not found', 404));
    }
    
    // Find the token balance
    const tokenBalance = wallet.balances.find(b => 
      b.token.toString() === transaction.tokenIn.toString()
    );
    
    if (!tokenBalance) {
      return next(new AppError('Token not found in wallet', 404));
    }
    
    if (transaction.type === 'DEPOSIT') {
      // Add funds to wallet
      tokenBalance.amount = (parseFloat(tokenBalance.amount) + parseFloat(transaction.amountIn)).toString();
    } else if (transaction.type === 'WITHDRAWAL') {
      // Remove funds from wallet
      const newAmount = parseFloat(tokenBalance.amount) - parseFloat(transaction.amountIn);
      if (newAmount < 0) {
        return next(new AppError('Insufficient funds in wallet', 400));
      }
      tokenBalance.amount = newAmount.toString();
    }
    
    await wallet.save();
  }
  
  await transaction.save();
  
  res.status(200).json({
    success: true,
    data: transaction
  });
});

