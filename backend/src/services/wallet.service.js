const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const Token = require('../models/token.model');
const AppError = require('../utils/appError');
const solanaService = require('./solana.service');
const socketService = require('./socket.service');
const BigNumber = require('bignumber.js');

// Create a new wallet
exports.createWallet = async (userId, type, label) => {
  // Generate keypair
  const keypair = await solanaService.generateKeypair();
  
  // Create wallet in database
  const wallet = await Wallet.create({
    userId,
    address: keypair.publicKey.toString(),
    type,
    label,
    encryptedPrivateKey: keypair.encryptedPrivateKey
  });
  
  // Initialize balances for SOL and USDT
  await Promise.all([
    this.addTokenToWallet(wallet._id, process.env.SOL_TOKEN_ID),
    this.addTokenToWallet(wallet._id, process.env.USDT_TOKEN_ID)
  ]);
  
  return wallet;
};

// Add a token to wallet
exports.addTokenToWallet = async (walletId, tokenId) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }
  
  // Check if token already exists in wallet
  const existingToken = wallet.balances.find(balance => 
    balance.token.toString() === tokenId.toString()
  );
  
  if (existingToken) {
    return wallet;
  }
  
  // Add token to wallet
  wallet.balances.push({
    token: tokenId,
    amount: '0',
    locked: '0'
  });
  
  await wallet.save();
  return wallet;
};

// Get wallet with token details
exports.getWalletWithTokenDetails = async (wallet) => {
  // Fetch token details
  const tokenPromises = wallet.balances.map(async (balance) => {
    const token = await Token.findById(balance.token);
    return {
      ...balance.toObject(),
      token
    };
  });
  
  const balancesWithTokens = await Promise.all(tokenPromises);
  
  return {
    ...wallet.toObject(),
    balances: balancesWithTokens
  };
};

// Transfer between wallets
exports.transferBetweenWallets = async (userId, sourceWalletId, destWalletId, tokenId, amount) => {
  // Validate amount
  const amountBN = new BigNumber(amount);
  if (amountBN.isNaN() || amountBN.isLessThanOrEqualTo(0)) {
    throw new AppError('Invalid amount', 400);
  }
  
  // Get wallets
  const sourceWallet = await Wallet.findOne({ _id: sourceWalletId, userId });
  if (!sourceWallet) {
    throw new AppError('Source wallet not found', 404);
  }
  
  const destWallet = await Wallet.findOne({ _id: destWalletId, userId });
  if (!destWallet) {
    throw new AppError('Destination wallet not found', 404);
  }
  
  // Get token balance in source wallet
  const sourceBalance = sourceWallet.balances.find(b => 
    b.token.toString() === tokenId.toString()
  );
  
  if (!sourceBalance) {
    throw new AppError('Token not found in source wallet', 404);
  }
  
  // Check if enough balance
  const sourceBalanceBN = new BigNumber(sourceBalance.amount);
  if (sourceBalanceBN.isLessThan(amountBN)) {
    throw new AppError('Insufficient balance', 400);
  }
  
  // Update source wallet
  sourceBalance.amount = sourceBalanceBN.minus(amountBN).toString();
  await sourceWallet.save();
  
  // Update destination wallet
  let destBalance = destWallet.balances.find(b => 
    b.token.toString() === tokenId.toString()
  );
  
  if (!destBalance) {
    // Add token to destination wallet if not exists
    await this.addTokenToWallet(destWallet._id, tokenId);
    destWallet = await Wallet.findById(destWalletId);
    destBalance = destWallet.balances.find(b => 
      b.token.toString() === tokenId.toString()
    );
  }
  
  destBalance.amount = new BigNumber(destBalance.amount).plus(amountBN).toString();
  await destWallet.save();
  
  // Create transactions
  const token = await Token.findById(tokenId);
  
  const transferTx = await Transaction.create({
    userId,
    walletId: sourceWalletId,
    type: 'TRANSFER',
    status: 'COMPLETED',
    tokenIn: tokenId,
    amountIn: amount,
    destination: destWalletId,
    description: `Transfer ${amount} ${token.symbol} to ${destWallet.label}`
  });
  
  const receiveTx = await Transaction.create({
    userId,
    walletId: destWalletId,
    type: 'TRANSFER',
    status: 'COMPLETED',
    tokenIn: tokenId,
    amountIn: amount,
    source: sourceWalletId,
    description: `Receive ${amount} ${token.symbol} from ${sourceWallet.label}`
  });
  
  // Notify via WebSocket
  socketService.notifyWalletUpdate(userId, sourceWalletId);
  socketService.notifyWalletUpdate(userId, destWalletId);
  
  return {
    sourceWallet,
    destWallet,
    transferTx,
    receiveTx
  };
};

// Deposit funds
exports.depositFunds = async (userId, walletId, tokenId, amount, txHash) => {
  // Validate amount
  const amountBN = new BigNumber(amount);
  if (amountBN.isNaN() || amountBN.isLessThanOrEqualTo(0)) {
    throw new AppError('Invalid amount', 400);
  }
  
  // Get wallet
  const wallet = await Wallet.findOne({ _id: walletId, userId });
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }
  
  // Check if transaction already processed
  const existingTx = await Transaction.findOne({ txHash });
  if (existingTx) {
    throw new AppError('Transaction already processed', 400);
  }
  
  // Update wallet balance
  let tokenBalance = wallet.balances.find(b => 
    b.token.toString() === tokenId.toString()
  );
  
  if (!tokenBalance) {
    // Add token to wallet if not exists
    await this.addTokenToWallet(walletId, tokenId);
    const updatedWallet = await Wallet.findById(walletId);
    tokenBalance = updatedWallet.balances.find(b => 
      b.token.toString() === tokenId.toString()
    );
  }
  
  tokenBalance.amount = new BigNumber(tokenBalance.amount).plus(amountBN).toString();
  await wallet.save();
  
  // Create transaction record
  const token = await Token.findById(tokenId);
  
  const transaction = await Transaction.create({
    userId,
    walletId,
    type: 'DEPOSIT',
    status: 'COMPLETED',
    tokenIn: tokenId,
    amountIn: amount,
    txHash,
    description: `Deposit ${amount} ${token.symbol}`
  });
  
  // Notify via WebSocket
  socketService.notifyWalletUpdate(userId, walletId);
  
  return {
    wallet,
    transaction
  };
};

// Withdraw funds
exports.withdrawFunds = async (userId, walletId, tokenId, amount, destinationAddress)  => {
  // Validate amount
  const amountBN = new BigNumber(amount);
  if (amountBN.isNaN() || amountBN.isLessThanOrEqualTo(0)) {
    throw new AppError('Invalid amount', 400);
  }
  
  // Get wallet
  const wallet = await Wallet.findOne({ _id: walletId, userId });
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }
  
  // Get token
  const token = await Token.findById(tokenId);
  if (!token) {
    throw new AppError('Token not found', 404);
  }
  
  // Check if enough balance
  const tokenBalance = wallet.balances.find(b => 
    b.token.toString() === tokenId.toString()
  );
  
  if (!tokenBalance) {
    throw new AppError('Token not found in wallet', 404);
  }
  
  const balanceBN = new BigNumber(tokenBalance.amount);
  if (balanceBN.isLessThan(amountBN)) {
    throw new AppError('Insufficient balance', 400);
  }
  
  // Calculate fee
  const feeBN = amountBN.multipliedBy(0.001); // 0.1% fee
  const amountAfterFeeBN = amountBN.minus(feeBN);
  
  // Create pending transaction
  const transaction = await Transaction.create({
    userId,
    walletId,
    type: 'WITHDRAWAL',
    status: 'PENDING',
    tokenIn: tokenId,
    amountIn: amount,
    fee: feeBN.toString(),
    destination: destinationAddress,
    description: `Withdraw ${amountAfterFeeBN.toString()} ${token.symbol} to ${destinationAddress}`
  });
  
  try {
    // Submit to Solana
    const txHash = await solanaService.sendTokens(
      wallet,
      token.address,
      destinationAddress,
      amountAfterFeeBN.toString(),
      token.decimals
    );
    
    // Update transaction
    transaction.status = 'COMPLETED';
    transaction.txHash = txHash;
    await transaction.save();
    
    // Update wallet balance
    tokenBalance.amount = balanceBN.minus(amountBN).toString();
    await wallet.save();
    
    // Notify via WebSocket
    socketService.notifyWalletUpdate(userId, walletId);
    socketService.notifyTransactionUpdate(userId, transaction._id);
    
    return {
      wallet,
      transaction,
      txHash
    };
  } catch (error) {
    // Mark transaction as failed
    transaction.status = 'FAILED';
    transaction.description += ` - Failed: ${error.message}`;
    await transaction.save();
    
    // Notify via WebSocket
    socketService.notifyTransactionUpdate(userId, transaction._id);
    
    throw new AppError(`Withdrawal failed: ${error.message}`, 500);
  }
};

// Swap tokens
exports.swapTokens = async (userId, walletId, fromTokenId, toTokenId, amount, slippageTolerance) => {
  // Validate amount
  const amountBN = new BigNumber(amount);
  if (amountBN.isNaN() || amountBN.isLessThanOrEqualTo(0)) {
    throw new AppError('Invalid amount', 400);
  }
  
  // Get wallet
  const wallet = await Wallet.findOne({ _id: walletId, userId });
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }
  
  // Get tokens
  const fromToken = await Token.findById(fromTokenId);
  if (!fromToken) {
    throw new AppError('Source token not found', 404);
  }
  
  const toToken = await Token.findById(toTokenId);
  if (!toToken) {
    throw new AppError('Destination token not found', 404);
  }
  
  // Check if enough balance
  const fromTokenBalance = wallet.balances.find(b => 
    b.token.toString() === fromTokenId.toString()
  );
  
  if (!fromTokenBalance) {
    throw new AppError('Source token not found in wallet', 404);
  }
  
  const balanceBN = new BigNumber(fromTokenBalance.amount);
  if (balanceBN.isLessThan(amountBN)) {
    throw new AppError('Insufficient balance', 400);
  }
  
  // Create pending transaction
  const swapTx = await Transaction.create({
    userId,
    walletId,
    type: 'SWAP',
    status: 'PENDING',
    tokenIn: fromTokenId,
    amountIn: amount,
    tokenOut: toTokenId,
    description: `Swap ${amount} ${fromToken.symbol} to ${toToken.symbol}`
  });
  
  try {
    // Get quote from AMM
    const quote = await solanaService.getSwapQuote(
      fromToken.address,
      toToken.address,
      amount,
      slippageTolerance
    );
    
    // Execute swap on Solana
    const txHash = await solanaService.executeSwap(
      wallet,
      fromToken.address,
      toToken.address,
      amount,
      quote.minAmountOut,
      slippageTolerance
    );
    
    // Update transaction
    swapTx.status = 'COMPLETED';
    swapTx.txHash = txHash;
    swapTx.amountOut = quote.expectedAmountOut;
    await swapTx.save();
    
    // Update wallet balances
    // Subtract source token
    fromTokenBalance.amount = balanceBN.minus(amountBN).toString();
    
    // Add destination token
    let toTokenBalance = wallet.balances.find(b => 
      b.token.toString() === toTokenId.toString()
    );
    
    if (!toTokenBalance) {
      // Add token to wallet if not exists
      await this.addTokenToWallet(walletId, toTokenId);
      const updatedWallet = await Wallet.findById(walletId);
      toTokenBalance = updatedWallet.balances.find(b => 
        b.token.toString() === toTokenId.toString()
      );
    }
    
    toTokenBalance.amount = new BigNumber(toTokenBalance.amount)
      .plus(quote.expectedAmountOut)
      .toString();
    
    await wallet.save();
    
    // Notify via WebSocket
    socketService.notifyWalletUpdate(userId, walletId);
    socketService.notifyTransactionUpdate(userId, swapTx._id);
    
    return {
      wallet,
      transaction: swapTx,
      quote,
      txHash
    };
  } catch (error) {
    // Mark transaction as failed
    swapTx.status = 'FAILED';
    swapTx.description += ` - Failed: ${error.message}`;
    await swapTx.save();
    
    // Notify via WebSocket
    socketService.notifyTransactionUpdate(userId, swapTx._id);
    
    throw new AppError(`Swap failed: ${error.message}`, 500);
  }
};