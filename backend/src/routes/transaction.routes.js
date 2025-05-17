import express from 'express';
import { query, param } from 'express-validator';
import * as transactionController from '../controllers/transaction.controller.js';
import validate from '../middleware/validate.middleware.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import Transaction from '../models/transaction.model.js';

const router = express.Router();

// All transaction routes are protected
router.use(protect);

// Get user transactions
router.get('/',
  [
    query('walletId').optional().isMongoId().withMessage('Invalid wallet ID'),
    query('type').optional().isIn(['DEPOSIT', 'WITHDRAWAL', 'SWAP', 'TRANSFER', 'BUY', 'SELL', 'STAKE', 'UNSTAKE']).withMessage('Invalid transaction type'),
    query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  transactionController.getUserTransactions
);

// Get transaction by ID
router.get('/:transactionId',
  [
    param('transactionId').isMongoId().withMessage('Invalid transaction ID')
  ],
  validate,
  transactionController.getTransactionById
);

// Admin endpoints
router.get('/admin/all',
  restrictTo('admin'),
  [
    query('userId').optional().isMongoId().withMessage('Invalid user ID'),
    query('walletId').optional().isMongoId().withMessage('Invalid wallet ID'),
    query('type').optional().isIn(['DEPOSIT', 'WITHDRAWAL', 'SWAP', 'TRANSFER', 'BUY', 'SELL', 'STAKE', 'UNSTAKE']).withMessage('Invalid transaction type'),
    query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  transactionController.getAllTransactions
);

// Update transaction (admin only)
router.put('/admin/:transactionId',
  restrictTo('admin'),
  [
    param('transactionId').isMongoId().withMessage('Invalid transaction ID')
  ],
  validate,
  transactionController.updateTransaction
);

export default router;