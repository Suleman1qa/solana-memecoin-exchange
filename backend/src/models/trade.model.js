const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  pair: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TradingPair',
    required: true
  },
  price: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  makerOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  takerOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  makerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  takerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
TradeSchema.index({ pair: 1, timestamp: -1 });

module.exports = mongoose.model('Trade', TradeSchema);