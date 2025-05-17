import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import config from '../config/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import emailService from '../services/email.service.js';
import redisService from '../services/redis.service.js';
import walletService from '../services/wallet.service.js';

// Helper function to sign JWT token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Helper function to sign refresh token
const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

// Helper function to create and send tokens
const createSendTokens = async (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  
  // Store refresh token in Redis
  await redisService.setRefreshToken(user._id.toString(), refreshToken, config.jwt.refreshExpiresIn);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    data: {
      token,
      refreshToken,
      user
    }
  });
};

export const register = catchAsync(async (req, res, next) => {
  const { email, password, username, fullName } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (existingUser) {
    return next(new AppError('Email or username already in use', 400));
  }
  
  // Create verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Create new user
  const newUser = await User.create({
    email,
    password,
    username,
    fullName,
    verificationToken,
    role: 'user'
  });
  
  // Create a wallet for the new user
  await walletService.createWallet(newUser._id, 'FUNDING', 'Default Wallet');
  
  // Send verification email
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;
  await emailService.sendVerificationEmail(newUser.email, verificationUrl);
  
  // Create tokens and send response
  await createSendTokens(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  // Find user by email
  const user = await User.findOne({ email });
  
  // Check if user exists and password is correct
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  
  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }
  
  // Update last login timestamp
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  
  // Create tokens and send response
  await createSendTokens(user, 200, res);
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, config.jwt.secret);
  
  // Check if it's a refresh token
  if (decoded.type !== 'refresh') {
    return next(new AppError('Invalid refresh token', 401));
  }
  
  // Check if refresh token exists in Redis
  const storedToken = await redisService.getRefreshToken(decoded.id);
  if (!storedToken || storedToken !== refreshToken) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
  
  // Find user
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists', 401));
  }
  
  // Generate new access token
  const token = signToken(user._id);
  
  res.status(200).json({
    success: true,
    data: {
      token
    }
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  await user.save({ validateBeforeSave: false });
  
  // Send reset email
  try {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl);
    
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  
  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  // Send email notification about password change
  await emailService.sendPasswordChangeNotification(user.email);
  
  // Log in the user
  await createSendTokens(user, 200, res);
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  
  // Find user with verification token
  const user = await User.findOne({ verificationToken: token });
  
  if (!user) {
    return next(new AppError('Invalid verification token', 400));
  }
  
  // Update user
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });
  
  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

export const logout = catchAsync(async (req, res, next) => {
  // Remove refresh token from Redis
  await redisService.removeRefreshToken(req.user._id.toString());
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user
  const user = await User.findById(req.user._id);
  
  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Send email notification
  await emailService.sendPasswordChangeNotification(user.email);
  
  // Create new tokens
  await createSendTokens(user, 200, res);
});