import express from 'express';
import { body, query, param } from 'express-validator';
import * as orderController from '../controllers/order.controller.js';
import validate from '../middleware/validate.middleware.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// All order routes are protected
router.use(protect);

// Get user orders
router.get('/',
  [
    query('status').optional().isIn(['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED']).withMessage('Invalid order status'),
    query('pair').optional(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  orderController.getUserOrders
);

// Get order by ID
router.get('/:orderId',
  [
    param('orderId').isMongoId().withMessage('Invalid order ID')
  ],
  validate,
  orderController.getOrderById
);

// Cancel order
router.delete('/:orderId',
  [
    param('orderId').isMongoId().withMessage('Invalid order ID')
  ],
  validate,
  orderController.cancelOrder
);

// Place order
router.post('/',
  [
    body('pair').notEmpty().withMessage('Pair is required'),
    body('type').isIn(['LIMIT', 'MARKET', 'STOP_LIMIT', 'STOP_MARKET']).withMessage('Invalid order type'),
    body('side').isIn(['BUY', 'SELL']).withMessage('Invalid order side'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('stopPrice').optional().isNumeric().withMessage('Stop price must be a number')
  ],
  validate,
  orderController.placeOrder
);

// Admin routes
router.get('/admin/all',
  restrictTo('admin'),
  [
    query('userId').optional().isMongoId().withMessage('Invalid user ID'),
    query('pair').optional(),
    query('status').optional().isIn(['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED']).withMessage('Invalid order status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  orderController.getAllOrders
);

export default router;