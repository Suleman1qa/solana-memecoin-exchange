const redis = require('redis');
const { promisify } = require('util');
const config = require('../config');
const logger = require('../utils/logger');

// Create Redis client
const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
});

// Promisify Redis methods
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);
const expireAsync = promisify(client.expire).bind(client);

client.on('error', (error) => {
  logger.error('Redis error:', error);
});

client.on('connect', () => {
  logger.info('Connected to Redis');
});

// Get value by key
exports.get = async (key) => {
  try {
    return await getAsync(key);
  } catch (error) {
    logger.error(`Redis get error for key ${key}:`, error);
    return null;
  }
};

// Set value with expiration (in seconds)
exports.set = async (key, value, expireSeconds = null) => {
  try {
    await setAsync(key, value);
    
    if (expireSeconds) {
      await expireAsync(key, expireSeconds);
    }
    
    return true;
  } catch (error) {
    logger.error(`Redis set error for key ${key}:`, error);
    return false;
  }
};

// Delete key
exports.del = async (key) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    logger.error(`Redis del error for key ${key}:`, error);
    return false;
  }
};

// Store refresh token
exports.setRefreshToken = async (userId, token, expiresIn) => {
  const key = `refresh_token:${userId}`;
  
  // Convert JWT expiration (e.g., '7d') to seconds for Redis
  let expireSeconds;
  
  if (typeof expiresIn === 'string') {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's':
        expireSeconds = value;
        break;
      case 'm':
        expireSeconds = value * 60;
        break;
      case 'h':
        expireSeconds = value * 60 * 60;
        break;
      case 'd':
        expireSeconds = value * 24 * 60 * 60;
        break;
      default:
        expireSeconds = 7 * 24 * 60 * 60; // Default: 7 days
    }
  } else {
    expireSeconds = expiresIn;
  }
  
  return this.set(key, token, expireSeconds);
};

// Get refresh token
exports.getRefreshToken = async (userId) => {
  return this.get(`refresh_token:${userId}`);
};

// Remove refresh token
exports.removeRefreshToken = async (userId) => {
  return this.del(`refresh_token:${userId}`);
};