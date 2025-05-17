import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import tokenRoutes from './token.routes.js';
import walletRoutes from './wallet.routes.js';
import marketRoutes from './market.routes.js';
import transactionRoutes from './transaction.routes.js';
import orderRoutes from './order.routes.js';
import { defaultLimiter } from '../middleware/rateLimit.middleware.js';

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

export default router;