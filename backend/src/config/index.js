import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Add debug log to confirm index.js execution
console.log("Executing config/index.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });
// cloudinary: {
//   cloudName ; process.env.CLOUDINARY_CLOUD_NAME,
//   apiKey ; process.env.CLOUDINARY_API_KEY,
//   apiSecret ; process.env.CLOUDINARY_API_SECRET
// }

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,

  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:8080",
        "http://192.168.0.191:8081",
        "http://192.168.0.191:8080",
        "http://192.168.0.191:3000",
        "exp://192.168.0.191:8081",
        "exp://192.168.0.191:19000",
        "exp://localhost:8081",
        "exp://localhost:19000",
      ],

  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/solana-memecoin-exchange",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "5801b54c3a62a2ba58c2ba5fc095b11d6c4374d9f46245429ecb50941fccf66d",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  solana: {
    clusterEndpoint:
      process.env.SOLANA_CLUSTER_ENDPOINT ||
      "https://api.mainnet-beta.solana.com",
    websocketEndpoint:
      process.env.SOLANA_WEBSOCKET_ENDPOINT ||
      "wss://api.mainnet-beta.solana.com",
    commitment: "confirmed",
    feePayer: process.env.SOLANA_FEE_PAYER_SECRET || "",
  },

  apiKeys: {
    coingecko: process.env.COINGECKO_API_KEY || "",
  },

  email: {
    host: process.env.EMAIL_HOST || "",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
    from: process.env.EMAIL_FROM || "noreply@solanamemecoin.exchange",
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

export default config;
