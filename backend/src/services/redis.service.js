import redis from 'redis';
import { promisify } from 'util';
import config from '../config/index.js';
import logger from '../utils/logger.js';

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
const get = async (key) => {
  try {
    return await getAsync(key);
  } catch (error) {
    logger.error(`Redis get error for key ${key}:`, error);
    return null;
  }
};

// Set value with expiration (in seconds)
const set = async (key, value, expireSeconds = null) => {
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
const del = async (key) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    logger.error(`Redis del error for key ${key}:`, error);
    return false;
  }
};

// Store refresh token
const setRefreshToken = async (userId, token, expiresIn) => {
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
  
  return set(key, token, expireSeconds);
};

// Get refresh token
const getRefreshToken = async (userId) => {
  return get(`refresh_token:${userId}`);
};

// Remove refresh token
const removeRefreshToken = async (userId) => {
  return del(`refresh_token:${userId}`);
};

const redisService = {
  get,
  set,
  del,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken
};

export default redisService;