import express from 'express';
import { query, param } from 'express-validator';
import * as tokenController from '../controllers/token.controller.js';
import validate from '../middleware/validate.middleware.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isIn(['MEMECOIN', 'STABLECOIN', 'TOKEN', 'NFT']).withMessage('Invalid category'),
    query('status').optional().isIn(['NEW', 'GRADUATING', 'GRADUATED', 'DELISTED']).withMessage('Invalid status'),
    query('sort').optional(),
    query('search').optional()
  ],
  validate,
  tokenController.getTokens
);

router.get('/trending',
  [
    query('timeframe').optional().isIn(['1h', '24h', '7d']).withMessage('Invalid timeframe')
  ],
  validate,
  tokenController.getTrendingTokens
);

router.get('/new-listings',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validate,
  tokenController.getNewListings
);

router.get('/graduating',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validate,
  tokenController.getGraduatingTokens
);

router.get('/graduated',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validate,
  tokenController.getGraduatedTokens
);

router.get('/:address',
  [
    param('address').notEmpty().withMessage('Token address is required')
  ],
  validate,
  tokenController.getTokenByAddress
);

router.get('/:address/price-history',
  [
    param('address').notEmpty().withMessage('Token address is required'),
    query('interval').isIn(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']).withMessage('Invalid interval'),
    query('from').optional().isISO8601().withMessage('From date must be a valid ISO date'),
    query('to').optional().isISO8601().withMessage('To date must be a valid ISO date')
  ],
  validate,
  tokenController.getTokenPriceHistory
);

// Protected routes (admin only)
router.post('/',
  protect,
  restrictTo('admin'),
  tokenController.createToken
);

router.put('/:address',
  protect,
  restrictTo('admin'),
  [
    param('address').notEmpty().withMessage('Token address is required')
  ],
  validate,
  tokenController.updateToken
);

router.delete('/:address',
  protect,
  restrictTo('admin'),
  [
    param('address').notEmpty().withMessage('Token address is required')
  ],
  validate,
  tokenController.deleteToken
);

export default router;