import { Connection, PublicKey } from "@solana/web3.js";
import { Token } from "@solana/spl-token";
import axios from "axios";
import mongoose from "mongoose";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import RateLimiter from "../utils/rateLimit.js";

// Initialize Solana connection
const connection = new Connection(
  config.solana.clusterEndpoint,
  config.solana.commitment
);

// Initialize rate limiter
const rateLimiter = new RateLimiter(10); // 10 requests per second

// Initialize token model
const TokenSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    decimals: {
      type: Number,
      required: true,
    },
    totalSupply: {
      type: String,
      required: true,
    },
    logoURI: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["MEMECOIN", "STABLECOIN", "TOKEN", "NFT"],
      default: "MEMECOIN",
    },
    status: {
      type: String,
      enum: ["NEW", "GRADUATING", "GRADUATED", "DELISTED"],
      default: "NEW",
    },
    priceUSD: {
      type: String,
      default: "0",
    },
    priceSOL: {
      type: String,
      default: "0",
    },
    marketCapUSD: {
      type: String,
      default: "0",
    },
    volume24h: {
      type: String,
      default: "0",
    },
    priceChange24h: {
      type: String,
      default: "0",
    },
    launchDate: {
      type: Date,
      default: Date.now,
    },
    liquidityUSD: {
      type: String,
      default: "0",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    creatorAddress: {
      type: String,
      default: "",
    },
    website: String,
    twitter: String,
    telegram: String,
    discord: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TokenModel = mongoose.models.Token || mongoose.model("Token", TokenSchema);

class TokenProcessor {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this._lastProcessedSignature = null;
    this._processingTokens = new Set();
  }

  // Check if token exists in database
  async checkTokenExists(address) {
    const savedToken = await TokenModel.findOne({ address });
    return !!savedToken;
  }

  // Get token information from Solana
  async getTokenInfo(address) {
    try {
      const publicKey = new PublicKey(address);

      // Use rate limiter for token supply request
      const tokenInfo = await rateLimiter.enqueue(() =>
        connection.getTokenSupply(publicKey)
      );

      if (!tokenInfo || !tokenInfo.value) {
        return null;
      }

      // Use rate limiter for largest accounts request
      const largestAccounts = await rateLimiter.enqueue(() =>
        connection.getTokenLargestAccounts(publicKey)
      );

      let ownerAddress = "";

      if (
        largestAccounts &&
        largestAccounts.value &&
        largestAccounts.value.length > 0
      ) {
        try {
          // Use rate limiter for account info request
          const accountInfo = await rateLimiter.enqueue(() =>
            connection.getAccountInfo(largestAccounts.value[0].address)
          );
          if (accountInfo && accountInfo.owner) {
            ownerAddress = accountInfo.owner.toString();
          }
        } catch (error) {
          logger.error(
            `Error getting token account info for ${address}:`,
            error
          );
        }
      }

      // Generate token data
      const symbol = `${address.substring(0, 4).toUpperCase()}`;
      const name = `${symbol} Token`;

      return {
        address,
        decimals: tokenInfo.value.decimals,
        totalSupply: tokenInfo.value.amount,
        symbol,
        name,
        creatorAddress: ownerAddress,
      };
    } catch (error) {
      logger.error(`Error getting token info for ${address}:`, error);
      return null;
    }
  }

  // Process a new token
  async processNewToken(address, decimals, tokenInfo) {
    try {
      // Check if it's likely a memecoin
      const isMemecoin = await this.checkIfMemecoin(address, tokenInfo);

      if (!isMemecoin) {
        logger.info(
          `Token ${address} does not appear to be a memecoin. Skipping.`
        );
        return;
      }

      // Create token in database
      const newToken = new Token({
        address: tokenInfo.address,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply,
        category: "MEMECOIN",
        status: "NEW",
        priceUSD: "0.00000001", // Initial price
        priceSOL: "0.0000000002", // Initial price
        creatorAddress: tokenInfo.creatorAddress,
        launchDate: new Date(),
      });

      await newToken.save();

      logger.info(`Saved new memecoin: ${tokenInfo.symbol} (${address})`);

      // Try to get additional info
      setTimeout(async () => {
        await this.enrichTokenInfo(address);
      }, 5000);
    } catch (error) {
      logger.error(`Error processing new token ${address}:`, error);
    }
  }

  // Check if token is likely a memecoin
  async checkIfMemecoin(address, tokenInfo) {
    // This is a simplified check. In a real app, you would implement more sophisticated criteria

    // Check if total supply is very large (common for memecoins)
    const totalSupply = parseFloat(tokenInfo.totalSupply);
    if (totalSupply > 1000000000) {
      return true;
    }

    // Check if token has liquidity on DEXes (simplified)
    const hasLiquidity = await this.checkForLiquidity(address);
    if (hasLiquidity) {
      return true;
    }

    // Default to true for demo purposes
    return true;
  }

  // Check for liquidity on DEXes
  async checkForLiquidity(address) {
    // This would check if the token has liquidity on Raydium, Orca, etc.
    // Simplified implementation for demo
    return true;
  }

  // Enrich token with additional information
  async enrichTokenInfo(address) {
    try {
      const savedToken = await TokenModel.findOne({ address });
      if (!savedToken) {
        return;
      }

      // Try to get token metadata from Solana
      // This is simplified; a real implementation would use the Metaplex protocol

      // Generate some mock data for demo purposes
      token.website =
        Math.random() > 0.3 ? `https://${token.symbol.toLowerCase()}.io` : "";
      token.twitter =
        Math.random() > 0.3
          ? `https://twitter.com/${token.symbol.toLowerCase()}`
          : "";
      token.telegram =
        Math.random() > 0.3 ? `https://t.me/${token.symbol.toLowerCase()}` : "";
      token.discord =
        Math.random() > 0.4
          ? `https://discord.gg/${token.symbol.toLowerCase()}`
          : "";
      token.description = `${token.name} is a community-driven memecoin on the Solana blockchain.`;

      await token.save();

      logger.info(`Enriched token info for ${token.symbol} (${address})`);
    } catch (error) {
      logger.error(`Error enriching token info for ${address}:`, error);
    }
  }

  // Extract token addresses from a liquidity pool (stub for Raydium/Orca/Serum, etc.)
  async extractTokensFromLiquidityPool(platform, poolAddress, accountData) {
    // This is a stub. In a real implementation, you would decode the accountData
    // according to the platform's pool layout to extract the token mint addresses.
    // For now, return an empty array or mock addresses for testing.
    // Example: return [tokenMintA, tokenMintB];
    return [];
  }

  // Parse token metadata from account data (stub for Metaplex, etc.)
  async parseMetadata(address, accountData) {
    // This is a stub. In a real implementation, you would decode the accountData
    // according to the Metaplex metadata layout to extract metadata fields.
    // For now, return a mock result for testing.
    return {
      tokenAddress: address,
      metadata: {
        name: "Mock Token",
        symbol: "MOCK",
        uri: "",
        description: "Mock metadata for testing.",
      },
    };
  }

  // Update token metadata (stub for metadata.listener)
  async updateTokenMetadata(address, metadata) {
    // This is a stub. In a real implementation, update the token in the DB with new metadata.
    logger.info(
      `Stub: updateTokenMetadata called for ${address} with metadata:`,
      metadata
    );
    return true;
  }

  // --- Signature/Slot Tracking Methods for TokenListener ---
  // These use Redis if available, otherwise fallback to in-memory

  _getRedisClient() {
    return this.redisClient || null;
  }

  // Get the last processed signature/slot (returns string or null)
  async getLastProcessedSignature() {
    const redis = this._getRedisClient();
    if (redis) {
      try {
        const value = await redis.get("lastProcessedSignature");
        return value || null;
      } catch (err) {
        logger.error("Error getting lastProcessedSignature from Redis:", err);
        return null;
      }
    }
    return this._lastProcessedSignature || null;
  }

  // Set the last processed signature/slot
  async setLastProcessedSignature(signature) {
    const redis = this._getRedisClient();
    if (redis) {
      try {
        await redis.set("lastProcessedSignature", signature);
      } catch (err) {
        logger.error("Error setting lastProcessedSignature in Redis:", err);
      }
    } else {
      this._lastProcessedSignature = signature;
    }
  }

  // Mark a token as being processed (address: string)
  async markTokenProcessing(address) {
    const redis = this._getRedisClient();
    if (redis) {
      try {
        await redis.sAdd("processingTokens", address);
      } catch (err) {
        logger.error("Error marking token as processing in Redis:", err);
      }
    } else {
      this._processingTokens.add(address);
    }
  }

  // Unmark a token as being processed (address: string)
  async unmarkTokenProcessing(address) {
    const redis = this._getRedisClient();
    if (redis) {
      try {
        await redis.sRem("processingTokens", address);
      } catch (err) {
        logger.error("Error unmarking token as processing in Redis:", err);
      }
    } else {
      this._processingTokens.delete(address);
    }
  }

  // Check if a token is being processed (address: string)
  async isTokenBeingProcessed(address) {
    const redis = this._getRedisClient();
    if (redis) {
      try {
        return await redis.sIsMember("processingTokens", address);
      } catch (err) {
        logger.error(
          "Error checking if token is being processed in Redis:",
          err
        );
        return false;
      }
    } else {
      return this._processingTokens.has(address);
    }
  }
  // --- END Signature/Slot Tracking Methods ---
}

export default TokenProcessor;
