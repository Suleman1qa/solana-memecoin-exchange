import { PublicKey } from '@solana/web3.js';
import logger from '../utils/logger.js';
import { METADATA_PROGRAM_ID } from '../utils/constants.js';

class MetadataListener {
  constructor(connection, tokenProcessor) {
    this.connection = connection;
    this.tokenProcessor = tokenProcessor;
    this.isListening = false;
    this.subscriptionId = null;
    this.reconnectTimeout = null;
  }

  async start() {
    try {
      logger.info('Starting metadata listener...');
      await this.setupMetadataSubscription();
      logger.info('Metadata listener started successfully');
    } catch (error) {
      logger.error('Failed to start metadata listener:', error);
      throw error;
    }
  }

  async setupMetadataSubscription() {
    try {
      // Subscribe to metadata program to detect token metadata updates
      this.subscriptionId = this.connection.onProgramAccountChange(
        new PublicKey(METADATA_PROGRAM_ID),
        async (accountInfo, context) => {
          try {
            if (accountInfo && accountInfo.accountId) {
              await this.processMetadata(accountInfo.accountId.toString(), accountInfo.accountInfo);
            }
          } catch (error) {
            logger.error('Error in metadata subscription callback:', error);
          }
        },
        'confirmed'
      );

      this.isListening = true;
      logger.info('Metadata program subscription established');
    } catch (error) {
      logger.error('Error setting up metadata program subscription:', error);
      this.isListening = false;

      // Set up reconnection
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        logger.info('Attempting to reconnect metadata program subscription...');
        this.setupMetadataSubscription();
      }, 10000); // Try to reconnect after 10 seconds

      throw error;
    }
  }

  async processMetadata(address, accountInfo) {
    try {
      // Skip if no account info
      if (!accountInfo || !accountInfo.data || accountInfo.data.length < 10) {
        return;
      }

      // Try to parse metadata
      const { tokenAddress, metadata } = await this.tokenProcessor.parseMetadata(address, accountInfo.data);
      
      if (tokenAddress && metadata) {
        // Update token with metadata
        await this.tokenProcessor.updateTokenMetadata(tokenAddress, metadata);
      }
    } catch (error) {
      logger.debug(`Error processing metadata for ${address}: ${error.message}`);
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
      
      logger.info('Metadata listener stopped');
    }
  }
}

export default MetadataListener;