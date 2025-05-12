const mongoose = require('mongoose');

const TradingPairSchema = new mongoose.Schema({
  baseToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },
  quoteToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },
  pairName: {
    type: String,
    required: true,
    unique: true
  },
  lastPrice: {
    type: String,
    default: '0'
  },
  lastTradeTime: {
    type: Date,
  },
  priceChange24h: {
    type: String,
    default: '0'
  },
  priceChangePercent24h: {
    type: String,
    default: '0'
  },
  high24h: {
    type: String,
    default: '0'
  },
  low24h: {
    type: String,
    default: '0'
  },
  volume24h: {
    type: String,
    default: '0'
  },
  minOrderSize: {
    type: String,
    default: '0.0001'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DELISTED'],
    default: 'ACTIVE'
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

module.exports = mongoose.model('TradingPair', TradingPairSchema);