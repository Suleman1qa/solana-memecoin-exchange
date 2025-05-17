import express from 'express';
import { body, param } from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import validate from '../middleware/validate.middleware.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes are protected
router.use(protect);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update current user profile
router.put('/me',
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('fullName').optional(),
    body('email').optional().isEmail().withMessage('Invalid email address')
  ],
  validate,
  userController.updateCurrentUser
);

// Upload profile picture
router.post('/profile-picture',
  userController.uploadProfilePicture
);

// Get user by ID (admin only)
router.get('/:userId',
  restrictTo('admin'),
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validate,
  userController.getUserById
);

// Update user (admin only)
router.put('/:userId',
  restrictTo('admin'),
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('fullName').optional(),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('Invalid role')
  ],
  validate,
  userController.updateUser
);

// Get all users (admin only)
router.get('/',
  restrictTo('admin'),
  userController.getAllUsers
);

// Delete user (admin only)
router.delete('/:userId',
  restrictTo('admin'),
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validate,
  userController.deleteUser
);

export default router;