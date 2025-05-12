const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

// Create axios instance with default config
const httpClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
httpClient.interceptors.request.use(
  request => {
    // Log the request (in development environment)
    if (config.env === 'development') {
      logger.debug(`HTTP Request: ${request.method.toUpperCase()} ${request.url}`);
    }
    return request;
  },
  error => {
    logger.error('HTTP Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
httpClient.interceptors.response.use(
  response => {
    // Log response (in development environment)
    if (config.env === 'development') {
      logger.debug(`HTTP Response: ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  error => {
    if (error.response) {
      // Log response error
      logger.error(`HTTP Response Error: ${error.response.status} from ${error.config.url}`);
    } else if (error.request) {
      // Log request error
      logger.error(`HTTP Request Error: No response received for ${error.config.url}`);
    } else {
      // Log other error
      logger.error('HTTP Error:', error.message);
    }
    return Promise.reject(error);
  }
);

module.exports = httpClient;