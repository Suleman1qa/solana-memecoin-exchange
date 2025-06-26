import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/solana-memecoin-exchange',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    }
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    cacheExpiry: {
      tokenProcessing: parseInt(process.env.REDIS_TOKEN_PROCESSING_EXPIRY || '300', 10), // 5 minutes
      signatures: parseInt(process.env.REDIS_SIGNATURES_EXPIRY || '3600', 10), // 1 hour
      tokendata: parseInt(process.env.REDIS_TOKEN_DATA_EXPIRY || '86400', 10) // 24 hours
    }
  },
  
  solana: {
    clusterEndpoint: process.env.SOLANA_CLUSTER_ENDPOINT || 'https://api.mainnet-beta.solana.com',
    websocketEndpoint: process.env.SOLANA_WEBSOCKET_ENDPOINT || 'wss://api.mainnet-beta.solana.com',
    commitment: process.env.SOLANA_COMMITMENT || 'confirmed',
    newTokensLookbackDays: parseInt(process.env.SOLANA_NEW_TOKENS_LOOKBACK_DAYS || '7', 10)
  },
  
  tokenFilters: {
    minTotalSupply: process.env.MIN_TOKEN_SUPPLY ? parseInt(process.env.MIN_TOKEN_SUPPLY, 10) : 1000000,
    maxDecimals: process.env.MAX_TOKEN_DECIMALS ? parseInt(process.env.MAX_TOKEN_DECIMALS, 10) : 9,
    memecoinKeywords: process.env.MEMECOIN_KEYWORDS ? 
      process.env.MEMECOIN_KEYWORDS.split(',').map(k => k.trim().toLowerCase()) : 
      ['meme', 'doge', 'shib', 'pepe', 'cat', 'inu', 'moon', 'elon', 'safe']
  },
  
  polling: {
    enabled: process.env.ENABLE_TOKEN_POLLING === 'true',
    intervalMs: parseInt(process.env.TOKEN_POLLING_INTERVAL_MS || '300000', 10), // 5 minutes
    batchSize: parseInt(process.env.TOKEN_POLLING_BATCH_SIZE || '50', 10),
    maxRetries: parseInt(process.env.TOKEN_POLLING_MAX_RETRIES || '3', 10)
  },
  
  healthCheck: {
    port: parseInt(process.env.HEALTH_CHECK_PORT || '5001', 10),
    intervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || '60000', 10) // 1 minute
  },
  
   healthMonitor: {
    checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || 30000,
    maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE, 10) || 500 * 1024 * 1024,
    maxResponseTime: parseInt(process.env.MAX_RESPONSE_TIME, 10) || 5000,
    maxErrorRate: parseFloat(process.env.MAX_ERROR_RATE) || 0.1
  },
  
  metrics: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT || '9464', 10)
  }
};

export default config;
