import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
// cloudinary: {
//   cloudName ; process.env.CLOUDINARY_CLOUD_NAME,
//   apiKey ; process.env.CLOUDINARY_API_KEY,
//   apiSecret ; process.env.CLOUDINARY_API_SECRET
// }

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:8081'],
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://sulemanshujah:1qam416V1q@cluster0.bz8kevx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  
  solana: {
    clusterEndpoint: process.env.SOLANA_CLUSTER_ENDPOINT || 'https://api.mainnet-beta.solana.com',
    websocketEndpoint: process.env.SOLANA_WEBSOCKET_ENDPOINT || 'wss://api.mainnet-beta.solana.com',
    commitment: 'confirmed',
    feePayer: process.env.SOLANA_FEE_PAYER_SECRET || ''
  },
  
  apiKeys: {
    coingecko: process.env.COINGECKO_API_KEY || ''
  },
  
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    },
    from: process.env.EMAIL_FROM || 'noreply@solanamemecoin.exchange'
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }
};

export default config;