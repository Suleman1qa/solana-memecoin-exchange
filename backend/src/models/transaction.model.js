import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'SWAP', 'TRANSFER', 'BUY', 'SELL', 'STAKE', 'UNSTAKE'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  tokenIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },
  amountIn: {
    type: String,
    required: true
  },
  tokenOut: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token'
  },
  amountOut: {
    type: String
  },
  fee: {
    type: String,
    default: '0'
  },
  txHash: {
    type: String
  },
  destination: {
    type: String
  },
  source: {
    type: String
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
