import rateLimit from "express-rate-limit";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const defaultLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn("Rate limit exceeded for default limiter", {
      ip: req.ip,
      path: req.path,
    });
    console.log("Rate limit exceeded for default limiter:", {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // increased from 5 to 20 login attempts per window
  message: {
    success: false,
    error: {
      message:
        "Too many login attempts from this IP, please try again after 15 minutes",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn("Rate limit exceeded for auth limiter", {
      ip: req.ip,
      path: req.path,
    });
    console.log("Rate limit exceeded for auth limiter:", {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
  skip: (req) => {
    // Log all auth requests
    logger.debug("Auth request received", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    console.log("Auth request received:", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    return false; // Don't skip rate limiting
  },
});

export { defaultLimiter, authLimiter };
