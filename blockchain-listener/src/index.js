const { Connection } = require('@solana/web3.js');
const mongoose = require('mongoose');
const redis = require('redis');
const config = require('./config');
const logger = require('./utils/logger');
const TokenListener = require('./listeners/token.listener');
const MetadataListener = require('./listeners/metadata.listener');
const LiquidityListener = require('./listeners/liquidity.listener');
const TokenProcessor = require('./processors/token.processor');
const HealthMonitor = require('./utils/health-monitor');

// MongoDB connection
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    startBlockchainListener();
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Redis client setup
const redisClient = redis.createClient({
  url: config.redis.url,
  password: config.redis.password,
  socket: {
    reconnectStrategy: (retries) => {
      logger.info(`Redis reconnecting... attempt ${retries}`);
      return Math.min(retries * 100, 3000); // exponential backoff
    }
  }
});

redisClient.on('error', (error) => {
  logger.error('Redis error:', error);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
  }
})();

// Initialize Solana connection with retries
let solanaConnection = null;
const initSolanaConnection = async (retries = 5) => {
  try {
    logger.info(`Connecting to Solana (${config.solana.clusterEndpoint})...`);
    solanaConnection = new Connection(
      config.solana.clusterEndpoint,
      { commitment: config.solana.commitment, confirmTransactionInitialTimeout: 60000 }
    );
    
    // Test connection
    const blockHeight = await solanaConnection.getBlockHeight();
    logger.info(`Connected to Solana. Current block height: ${blockHeight}`);
    return solanaConnection;
  } catch (error) {
    if (retries > 0) {
      logger.warn(`Solana connection failed, retrying (${retries} attempts left): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return initSolanaConnection(retries - 1);
    } else {
      logger.error('Failed to connect to Solana after multiple attempts:', error);
      process.exit(1);
    }
  }
};

// Main function to start blockchain listeners
const startBlockchainListener = async () => {
  try {
    // Initialize Solana connection
    solanaConnection = await initSolanaConnection();
    
    // Initialize services
    const tokenProcessor = new TokenProcessor(redisClient);
    
    // Initialize blockchain listeners
    const tokenListener = new TokenListener(solanaConnection, tokenProcessor);
    const metadataListener = new MetadataListener(solanaConnection, tokenProcessor);
    const liquidityListener = new LiquidityListener(solanaConnection, tokenProcessor);
    
    // Initialize health monitor
    const healthMonitor = new HealthMonitor({
      solanaConnection,
      redisClient,
      tokenProcessor
    });
    
    // Start health check server
    healthMonitor.startServer(config.healthCheck.port);
    
    // Start listeners
    await tokenListener.start();
    await metadataListener.start();
    await liquidityListener.start();
    
    logger.info('Blockchain listener started successfully');
    
    // Poll for historical tokens if specified
    if (config.polling.enabled) {
      await tokenListener.pollHistoricalTokens();
      
      // Set up periodic polling
      setInterval(async () => {
        try {
          await tokenListener.pollHistoricalTokens();
        } catch (error) {
          logger.error('Error during periodic token polling:', error);
        }
      }, config.polling.intervalMs);
    }
    
  } catch (error) {
    logger.error('Error starting blockchain listener:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  await shutdown();
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');
  await shutdown();
});

// Graceful shutdown
const shutdown = async () => {
  try {
    // Close Redis connection
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
    
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
    
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  shutdown().catch(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});
