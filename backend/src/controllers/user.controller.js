const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { uploadToStorage } = require('../services/storage.service');

// Get current user profile
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  // User is already available in req due to auth middleware
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// Update current user profile
exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  const { username, fullName, email } = req.body;

  // Check if username is already taken by another user
  if (username) {
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return next(new AppError('Username is already taken', 400));
    }
  }

  // Check if email is already taken by another user
  if (email) {
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return next(new AppError('Email is already registered', 400));
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { 
      username: username || req.user.username,
      fullName: fullName || req.user.fullName,
      email: email || req.user.email
    },
    { 
      new: true, 
      runValidators: true 
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// Upload profile picture
exports.uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.profilePicture) {
    return next(new AppError('Please upload a profile picture', 400));
  }

  const file = req.files.profilePicture;

  // Check file type
  if (!file.mimetype.startsWith('image')) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return next(new AppError('Image must be less than 2MB', 400));
  }

  // Upload file to storage
  const uploadPath = `users/${req.user._id}/profile`;
  const uploadResult = await uploadToStorage(file, uploadPath);

  // Update user with new profile picture URL
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: uploadResult.url },
    { new: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// Get user by ID (admin only)
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Update user (admin only)
exports.updateUser = catchAsync(async (req, res, next) => {
  const { username, fullName, email, role } = req.body;

  // Check if username is already taken by another user
  if (username) {
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: req.params.userId } 
    });

    if (existingUser) {
      return next(new AppError('Username is already taken', 400));
    }
  }

  // Check if email is already taken by another user
  if (email) {
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.params.userId } 
    });

    if (existingUser) {
      return next(new AppError('Email is already registered', 400));
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    { 
      username: username,
      fullName: fullName,
      email: email,
      role: role
    },
    { 
      new: true, 
      runValidators: true 
    }
  ).select('-password');

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// Get all users (admin only)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// Delete user (admin only)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});