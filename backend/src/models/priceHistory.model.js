import mongoose from 'mongoose';

const PriceHistorySchema = new mongoose.Schema({
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  interval: {
    type: String,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
    required: true
  },
  open: {
    type: String,
    required: true
  },
  high: {
    type: String,
    required: true
  },
  low: {
    type: String,
    required: true
  },
  close: {
    type: String,
    required: true
  },
  volume: {
    type: String,
    required: true
  }
});

// Compound index for faster queries
PriceHistorySchema.index({ tokenId: 1, interval: 1, timestamp: 1 });

const PriceHistory = mongoose.model('PriceHistory', PriceHistorySchema);

export default PriceHistory;