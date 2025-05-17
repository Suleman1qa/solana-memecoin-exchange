import express from 'express';
import { body, param } from 'express-validator';
import * as walletController from '../controllers/wallet.controller.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All wallet routes are protected
router.use(protect);

router.get('/', walletController.getUserWallets);

router.post('/',
  [
    body('type').optional().isIn(['FUNDING', 'TRADING']).withMessage('Invalid wallet type'),
    body('label').optional().isString().withMessage('Label must be a string')
  ],
  validate,
  walletController.createWallet
);

router.get('/:walletId',
  [
    param('walletId').isMongoId().withMessage('Invalid wallet ID')
  ],
  validate,
  walletController.getWalletById
);

router.put('/:walletId',
  [
    param('walletId').isMongoId().withMessage('Invalid wallet ID'),
    body('label').isString().withMessage('Label must be a string')
  ],
  validate,
  walletController.updateWallet
);

router.post('/:walletId/transfer',
  [
    param('walletId').isMongoId().withMessage('Invalid source wallet ID'),
    body('destinationWalletId').isMongoId().withMessage('Invalid destination wallet ID'),
    body('tokenAddress').notEmpty().withMessage('Token address is required'),
    body('amount').isNumeric().withMessage('Amount must be a number')
  ],
  validate,
  walletController.transferBetweenWallets
);

router.post('/deposit',
  [
    body('walletId').isMongoId().withMessage('Invalid wallet ID'),
    body('tokenAddress').notEmpty().withMessage('Token address is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('txHash').notEmpty().withMessage('Transaction hash is required')
  ],
  validate,
  walletController.depositFunds
);

router.post('/withdraw',
  [
    body('walletId').isMongoId().withMessage('Invalid wallet ID'),
    body('tokenAddress').notEmpty().withMessage('Token address is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('destinationAddress').notEmpty().withMessage('Destination address is required')
  ],
  validate,
  walletController.withdrawFunds
);

router.post('/swap',
  [
    body('walletId').isMongoId().withMessage('Invalid wallet ID'),
    body('fromTokenAddress').notEmpty().withMessage('From token address is required'),
    body('toTokenAddress').notEmpty().withMessage('To token address is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('slippageTolerance').optional().isFloat({ min: 0, max: 100 }).withMessage('Slippage tolerance must be between 0 and 100')
  ],
  validate,
  walletController.swapTokens
);

export default router;