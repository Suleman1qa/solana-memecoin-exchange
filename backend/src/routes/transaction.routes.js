const express = require('express');
const { query, param } = require('express-validator');
const transactionController = require('../controllers/transaction.controller');
const validate = require('../middleware/validate.middleware');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const Transaction = require('../models/transaction.model');

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

module.exports = router;