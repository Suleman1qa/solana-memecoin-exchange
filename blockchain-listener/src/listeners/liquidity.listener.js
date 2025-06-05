import { PublicKey } from '@solana/web3.js';
import logger from '../utils/logger.js';
import { 
  RAYDIUM_LIQUIDITY_PROGRAM_ID,
  ORCA_SWAP_PROGRAM_ID
} from '../utils/constants.js';

class LiquidityListener {
  constructor(connection, tokenProcessor) {
    this.connection = connection;
    this.tokenProcessor = tokenProcessor;
    this.isListening = false;
    this.raydiumSubscriptionId = null;
    this.orcaSubscriptionId = null;
    this.reconnectTimeout = null;
  }

  async start() {
    try {
      logger.info('Starting liquidity listener...');
      await this.setupLiquiditySubscriptions();
      logger.info('Liquidity listener started successfully');
    } catch (error) {
      logger.error('Failed to start liquidity listener:', error);
      throw error;
    }
  }

  async setupLiquiditySubscriptions() {
    try {
      // Subscribe to Raydium liquidity program
      this.raydiumSubscriptionId = this.connection.onProgramAccountChange(
        new PublicKey(RAYDIUM_LIQUIDITY_PROGRAM_ID),
        async (accountInfo, context) => {
          try {
            if (accountInfo && accountInfo.accountId) {
              await this.processLiquidityEvent(
                'raydium',
                accountInfo.accountId.toString(), 
                accountInfo.accountInfo
              );
            }
          } catch (error) {
            logger.error('Error in Raydium liquidity subscription callback:', error);
          }
        },
        'confirmed'
      );

      // Subscribe to Orca swap program
      this.orcaSubscriptionId = this.connection.onProgramAccountChange(
        new PublicKey(ORCA_SWAP_PROGRAM_ID),
        async (accountInfo, context) => {
          try {
            if (accountInfo && accountInfo.accountId) {
              await this.processLiquidityEvent(
                'orca',
                accountInfo.accountId.toString(), 
                accountInfo.accountInfo
              );
            }
          } catch (error) {
            logger.error('Error in Orca liquidity subscription callback:', error);
          }
        },
        'confirmed'
      );

      this.isListening = true;
      logger.info('Liquidity program subscriptions established');
    } catch (error) {
      logger.error('Error setting up liquidity program subscriptions:', error);
      this.isListening = false;

      // Set up reconnection
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        logger.info('Attempting to reconnect liquidity program subscriptions...');
        this.setupLiquiditySubscriptions();
      }, 10000); // Try to reconnect after 10 seconds

      throw error;
    }
  }

  async processLiquidityEvent(platform, address, accountInfo) {
    try {
      // Extract tokens from liquidity pool
      const tokenAddresses = await this.tokenProcessor.extractTokensFromLiquidityPool(
        platform,
        address,
        accountInfo.data
      );

      if (!tokenAddresses || tokenAddresses.length === 0) {
        return;
      }

      // For each token in the liquidity pool
      for (const tokenAddress of tokenAddresses) {
        // Check if it's already a known token
        const exists = await this.tokenProcessor.checkTokenExists(tokenAddress);
        
        if (exists) {
          // Update liquidity info for existing token
          await this.tokenProcessor.updateTokenLiquidity(tokenAddress, platform, address);
        } else {
          // Process new token with liquidity
          const tokenInfo = await this.tokenProcessor.getTokenInfo(tokenAddress);
          if (tokenInfo) {
            // Even if it's not a typical memecoin, if it has liquidity, consider including it
            await this.tokenProcessor.processNewToken(
              tokenAddress, 
              tokenInfo.decimals, 
              tokenInfo,
              { hasLiquidity: true, liquidityPlatform: platform, liquidityPoolAddress: address }
            );
          }
        }
      }
    } catch (error) {
      logger.debug(`Error processing liquidity event for ${address}: ${error.message}`);
    }
  }

  stop() {
    if (this.raydiumSubscriptionId !== null) {
      this.connection.removeAccountChangeListener(this.raydiumSubscriptionId);
      this.raydiumSubscriptionId = null;
    }

    if (this.orcaSubscriptionId !== null) {
      this.connection.removeAccountChangeListener(this.orcaSubscriptionId);
      this.orcaSubscriptionId = null;
    }

    this.isListening = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    logger.info('Liquidity listener stopped');
  }
}

export default LiquidityListener;