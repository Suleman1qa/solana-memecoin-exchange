const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pair: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['LIMIT', 'MARKET', 'STOP_LIMIT', 'STOP_MARKET'],
    required: true
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  price: {
    type: String,
    required: function() {
      return this.type !== 'MARKET';
    }
  },
  stopPrice: {
    type: String,
    required: function() {
      return this.type.startsWith('STOP');
    }
  },
  amount: {
    type: String,
    required: true
  },
  filled: {
    type: String,
    default: '0'
  },
  status: {
    type: String,
    enum: ['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED'],
    default: 'OPEN'
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

module.exports = mongoose.model('Order', OrderSchema);