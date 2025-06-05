import { Connection } from '@solana/web3.js';
import mongoose from 'mongoose';
import redis from 'redis';
import config from './config/index.js';
import logger from './utils/logger.js';
import TokenListener from './listeners/token.listener.js';
import MetadataListener from './listeners/metadata.listener.js';
import LiquidityListener from './listeners/liquidity.listener.js';
import TokenProcessor from './processors/token.processor.js';
import HealthMonitor from './utils/health-monitor.js';

let redisClient;
let solanaConnection;

const initSolanaConnection = async (retries = 5) => {
  try {
    logger.info(`Connecting to Solana (${config.solana.clusterEndpoint})...`);
    const connection = new Connection(
      config.solana.clusterEndpoint,
      {
        commitment: config.solana.commitment,
        confirmTransactionInitialTimeout: 60000,
      }
    );
    const blockHeight = await connection.getBlockHeight();
    logger.info(`Connected to Solana. Block height: ${blockHeight}`);
    return connection;
  } catch (error) {
    if (retries > 0) {
      logger.warn(`Solana connection failed, retrying (${retries}): ${error.message}`);
      await new Promise(res => setTimeout(res, 2000));
      return initSolanaConnection(retries - 1);
    } else {
      logger.error('Failed to connect to Solana after multiple attempts:', error);
      throw error;
    }
  }
};

const startBlockchainListener = async () => {
  solanaConnection = await initSolanaConnection();
  const tokenProcessor = new TokenProcessor(redisClient);

  const tokenListener = new TokenListener(solanaConnection, tokenProcessor);
  const metadataListener = new MetadataListener(solanaConnection, tokenProcessor);
  const liquidityListener = new LiquidityListener(solanaConnection, tokenProcessor);

  const healthMonitor = new HealthMonitor({
    solanaConnection,
    redisClient,
    tokenProcessor,
  });

  healthMonitor.start();

  await tokenListener.start();
  await metadataListener.start();
  await liquidityListener.start();

  logger.info('Blockchain listeners started successfully');

  if (config.polling.enabled) {
    await tokenListener.pollHistoricalTokens();

    setInterval(async () => {
      try {
        await tokenListener.pollHistoricalTokens();
      } catch (error) {
        logger.error('Error during periodic token polling:', error);
      }
    }, config.polling.intervalMs);
  }
};

const shutdown = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis disconnected');
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('MongoDB disconnected');
    }

    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

const main = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('Connected to MongoDB');

    redisClient = redis.createClient({
      url: config.redis.url,
      password: config.redis.password,
      socket: {
        reconnectStrategy: retries => {
          logger.info(`Redis reconnecting... attempt ${retries}`);
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => logger.error('Redis Error:', err));
    await redisClient.connect();
    logger.info('Connected to Redis');

    await startBlockchainListener();
  } catch (err) {
    logger.error('Fatal startup error:', err);
    process.exit(1);
  }
};

main();
