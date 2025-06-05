import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import TokenModel from '../../../backend/src/models/token.model.js';

class TokenListener {
  constructor(connection, tokenProcessor) {
    this.connection = connection;
    this.tokenProcessor = tokenProcessor;
    this.isListening = false;
    this.subscriptionId = null;
    this.lastSignature = null;
    this.reconnectTimeout = null;
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async start() {
    try {
      logger.info('Starting token listener...');
      await this.setupTokenProgramSubscription();
      logger.info('Token listener started successfully');
    } catch (error) {
      logger.error('Failed to start token listener:', error);
      throw error;
    }
  }

  async setupTokenProgramSubscription() {
    try {
      // Load the last processed signature from Redis
      this.lastSignature = await this.tokenProcessor.getLastProcessedSignature();

      // Subscribe to token program to detect new token creations
      this.subscriptionId = this.connection.onProgramAccountChange(
        TOKEN_PROGRAM_ID,
        async (accountInfo, context) => {
          try {
            if (accountInfo && accountInfo.accountId) {
              // Add to processing queue
              this.addToProcessingQueue({
                address: accountInfo.accountId.toString(),
                accountInfo: accountInfo.accountInfo,
                slot: context.slot
              });
            }
          } catch (error) {
            logger.error('Error in token subscription callback:', error);
          }
        },
        'confirmed',
        // Filter for token mint accounts (type 2)
        [
          {
            dataSize: 82 // Size of a token mint account
          },
          {
            memcmp: {
              offset: 0,
              bytes: "2" // Filter for token mint accounts
            }
          }
        ]
      );

      this.isListening = true;
      logger.info('Token program subscription established');

      // Process the queue periodically
      setInterval(() => this.processQueue(), 1000);
    } catch (error) {
      logger.error('Error setting up token program subscription:', error);
      this.isListening = false;

      // Set up reconnection
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        logger.info('Attempting to reconnect token program subscription...');
        this.setupTokenProgramSubscription();
      }, 10000); // Try to reconnect after 10 seconds

      throw error;
    }
  }

  addToProcessingQueue(tokenData) {
    this.processingQueue.push(tokenData);
    logger.debug(`Added token ${tokenData.address} to processing queue. Queue size: ${this.processingQueue.length}`);
  }

  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      const tokenData = this.processingQueue.shift();
      logger.debug(`Processing token ${tokenData.address} from queue. Remaining: ${this.processingQueue.length}`);
      
      await this.processTokenAccount(tokenData.address, tokenData.accountInfo, tokenData.slot);
    } catch (error) {
      logger.error('Error processing token from queue:', error);
    } finally {
      this.isProcessing = false;
      
      // If there are more items, continue processing
      if (this.processingQueue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  async processTokenAccount(address, accountInfo, slot) {
    try {
      // Check if token is already being processed
      const isBeingProcessed = await this.tokenProcessor.isTokenBeingProcessed(address);
      if (isBeingProcessed) {
        logger.debug(`Token ${address} is already being processed. Skipping.`);
        return;
      }

      // Mark token as being processed
      await this.tokenProcessor.markTokenProcessing(address);

      // Check if we've already processed this token
      const exists = await this.tokenProcessor.checkTokenExists(address);
      if (exists) {
        logger.debug(`Token ${address} already exists. Skipping.`);
        return;
      }

      logger.info(`Processing new token: ${address}`);

      // Decode token mint data
      if (!accountInfo || !accountInfo.data || accountInfo.data.length < 82) {
        logger.debug(`Invalid token data for ${address}. Skipping.`);
        return;
      }

      const data = accountInfo.data;
      const mintAuthorityOption = data[0];
      const decimals = data[44];

      // If there's no mint authority, it might not be a memecoin
      if (mintAuthorityOption !== 1) {
        logger.debug(`Token ${address} has no mint authority. Likely not a memecoin. Skipping.`);
        return;
      }

      // Check if decimals are within acceptable range for memecoins
      if (decimals > config.tokenFilters.maxDecimals) {
        logger.debug(`Token ${address} has too many decimals (${decimals}). Skipping.`);
        return;
      }

      // Get additional token information
      const tokenInfo = await this.tokenProcessor.getTokenInfo(address, decimals);
      
      if (!tokenInfo) {
        logger.debug(`Could not get token info for ${address}. Skipping.`);
        return;
      }

      // Check if it should be processed as a memecoin
      const isMemecoin = await this.tokenProcessor.checkIfMemecoin(address, tokenInfo);
      if (!isMemecoin) {
        logger.debug(`Token ${address} doesn't meet memecoin criteria. Skipping.`);
        return;
      }

      // Process the token
      await this.tokenProcessor.processNewToken(address, decimals, tokenInfo);
      
      // Update last processed signature/slot
      if (slot) {
        await this.tokenProcessor.setLastProcessedSignature(slot.toString());
      }

    } catch (error) {
      logger.error(`Error processing token account ${address}:`, error);
    } finally {
      // Unmark token as being processed, even if there was an error
      await this.tokenProcessor.unmarkTokenProcessing(address);
    }
  }

  async pollHistoricalTokens() {
    try {
      logger.info('Polling for historical tokens...');
      
      // Get timestamp for lookback period
      const lookbackDays = config.solana.newTokensLookbackDays;
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);
      
      // Find the most recent tokens
      const recentTokens = await TokenModel.find({
        createdAt: { $gte: lookbackDate }
      })
      .sort({ launchDate: -1 })
      .limit(config.polling.batchSize);
      
      logger.info(`Found ${recentTokens.length} recent tokens to check for related tokens`);
      
      // For each token, check for transactions that might involve other tokens
      for (const token of recentTokens) {
        try {
          const creatorAddress = token.creatorAddress;
          
          if (!creatorAddress) continue;
          
          // Get signatures for creator address
          const signatures = await this.connection.getSignaturesForAddress(
            new PublicKey(creatorAddress),
            { limit: 50 }
          );
          
          // Process each signature
          for (const sigInfo of signatures) {
            try {
              // Get transaction
              const tx = await this.connection.getTransaction(sigInfo.signature);
              
              if (!tx || !tx.meta || !tx.transaction) continue;
              
              // Look for token creation instructions
              for (const instruction of tx.transaction.message.instructions) {
                if (instruction.programId.equals(TOKEN_PROGRAM_ID)) {
                  // Look for token mint accounts
                  if (tx.meta.postTokenBalances && tx.meta.postTokenBalances.length > 0) {
                    for (const tokenBalance of tx.meta.postTokenBalances) {
                      if (tokenBalance.mint && tokenBalance.mint !== token.address) {
                        // Found a potentially related token
                        await this.processTokenAccount(tokenBalance.mint, null, tx.slot);
                      }
                    }
                  }
                }
              }
            } catch (txError) {
              logger.debug(`Error processing transaction ${sigInfo.signature}: ${txError.message}`);
            }
          }
        } catch (tokenError) {
          logger.debug(`Error checking for related tokens for ${token.address}: ${tokenError.message}`);
        }
      }
      
      logger.info('Historical token polling complete');
    } catch (error) {
      logger.error('Error during historical token polling:', error);
    }
  }

  stop() {
    if (this.subscriptionId !== null) {
      this.connection.removeAccountChangeListener(this.subscriptionId);
      this.subscriptionId = null;
      this.isListening = false;
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      logger.info('Token listener stopped');
    }
  }
}

export default TokenListener;