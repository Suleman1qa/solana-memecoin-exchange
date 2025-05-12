const rateLimit = require('express-rate-limit');
const config = require('../config');

const defaultLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per window
  message: {
    success: false,
    error: {
      message: 'Too many login attempts from this IP, please try again after 15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  defaultLimiter,
  authLimiter
};
