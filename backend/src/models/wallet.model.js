import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['TRADING', 'FUNDING'],
    default: 'FUNDING'
  },
  balances: [{
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token'
    },
    amount: {
      type: String,
      default: '0'
    },
    locked: {
      type: String,
      default: '0'
    }
  }],
  encryptedPrivateKey: {
    type: String,
    required: false
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'My Wallet'
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

const Wallet = mongoose.model('Wallet', WalletSchema);
export default Wallet;