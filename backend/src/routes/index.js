const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const tokenRoutes = require('./token.routes');
const walletRoutes = require('./wallet.routes');
const marketRoutes = require('./market.routes');
const transactionRoutes = require('./transaction.routes');
const orderRoutes = require('./order.routes');
const { defaultLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

// Apply rate limiting to all routes
router.use(defaultLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tokens', tokenRoutes);
router.use('/wallets', walletRoutes);
router.use('/market', marketRoutes);
router.use('/transactions', transactionRoutes);
router.use('/orders', orderRoutes);

module.exports = router;