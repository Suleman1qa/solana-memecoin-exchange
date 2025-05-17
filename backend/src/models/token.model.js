import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  decimals: {
    type: Number,
    required: true
  },
  totalSupply: {
    type: String,
    required: true
  },
  logoURI: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['MEMECOIN', 'STABLECOIN', 'TOKEN', 'NFT'],
    default: 'MEMECOIN'
  },
  status: {
    type: String,
    enum: ['NEW', 'GRADUATING', 'GRADUATED', 'DELISTED'],
    default: 'NEW'
  },
  priceUSD: {
    type: String,
    default: '0'
  },
  priceSOL: {
    type: String,
    default: '0'
  },
  marketCapUSD: {
    type: String,
    default: '0'
  },
  volume24h: {
    type: String,
    default: '0'
  },
  priceChange24h: {
    type: String,
    default: '0'
  },
  launchDate: {
    type: Date,
    default: Date.now
  },
  liquidityUSD: {
    type: String,
    default: '0'
  },
  verified: {
    type: Boolean,
    default: false
  },
  creatorAddress: {
    type: String,
    default: ''
  },
  website: String,
  twitter: String,
  telegram: String,
  discord: String,
  description: String,
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

// Index for faster queries
TokenSchema.index({ status: 1, category: 1 });
TokenSchema.index({ symbol: 'text', name: 'text' });

const Token = mongoose.model('Token', TokenSchema);

export default Token;