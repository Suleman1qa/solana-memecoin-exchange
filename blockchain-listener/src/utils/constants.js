// blockchain-listener/src/utils/constants.js

// Solana Program IDs
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';

// Metaplex Metadata Program ID
export const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';

// DEX Program IDs
export const RAYDIUM_LIQUIDITY_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
export const RAYDIUM_AMM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
export const ORCA_SWAP_PROGRAM_ID = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
export const ORCA_AQUAFARM_PROGRAM_ID = '82yxjeMsvaURa4MbZZ7WZZHfobirZYkH1zF8fmeGtyaQ';

// Jupiter Aggregator Program ID
export const JUPITER_PROGRAM_ID = 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB';

// Serum DEX Program IDs
export const SERUM_DEX_PROGRAM_ID = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';
export const SERUM_DEX_V3_PROGRAM_ID = 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX';

// Popular Solana Token Addresses
export const WSOL_ADDRESS = 'So11111111111111111111111111111111111111112'; // Wrapped SOL
export const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USD Coin
export const USDT_ADDRESS = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'; // Tether USD
export const RAY_ADDRESS = '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'; // Raydium
export const SRM_ADDRESS = 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'; // Serum

// Token Metadata Constants
export const TOKEN_METADATA_SEED = 'metadata';
export const EDITION_SEED = 'edition';
export const MASTER_EDITION_SEED = 'edition';

// Token Standards
export const TOKEN_STANDARD = {
  NON_FUNGIBLE: 'NonFungible',
  FUNGIBLE_ASSET: 'FungibleAsset',
  FUNGIBLE: 'Fungible',
  NON_FUNGIBLE_EDITION: 'NonFungibleEdition',
  PROGRAMMABLE_NON_FUNGIBLE: 'ProgrammableNonFungible'
};

// Account Data Sizes
export const MINT_SIZE = 82; // Size of token mint account
export const ACCOUNT_SIZE = 165; // Size of token account
export const MULTISIG_SIZE = 355; // Size of multisig account

// Token Categories
export const TOKEN_CATEGORIES = {
  MEMECOIN: 'MEMECOIN',
  STABLECOIN: 'STABLECOIN',
  DEFI: 'DEFI',
  NFT: 'NFT',
  GAMING: 'GAMING',
  UTILITY: 'UTILITY',
  GOVERNANCE: 'GOVERNANCE'
};

// Token Status
export const TOKEN_STATUS = {
  NEW: 'NEW',
  GRADUATING: 'GRADUATING',
  GRADUATED: 'GRADUATED',
  DELISTED: 'DELISTED',
  INACTIVE: 'INACTIVE'
};

// Memecoin Keywords for Detection
export const MEMECOIN_KEYWORDS = [
  'meme', 'doge', 'shib', 'pepe', 'cat', 'inu', 'moon', 'elon', 'safe',
  'baby', 'mini', 'floki', 'wojak', 'chad', 'based', 'chad', 'bonk',
  'samo', 'cope', 'rope', 'ape', 'banana', 'monkey', 'frog', 'trump',
  'biden', 'tesla', 'spacex', 'mars', 'rocket', 'lambo', 'diamond',
  'hands', 'hodl', 'yolo', 'wagmi', 'ngmi', 'gm', 'gn', 'ser'
];

// Memecoin Name Patterns
export const MEMECOIN_NAME_PATTERNS = [
  /\b(doge|shib|inu|pepe|floki|bonk|samo)\b/i,
  /\b(baby|mini|micro|nano|pico)\s+\w+/i,
  /\b\w+(coin|token|finance|swap|protocol)\b/i,
  /\b(safe|moon|mars|rocket|lambo)\w*/i,
  /\b(elon|musk|tesla|spacex)\w*/i
];

// Common DEX Pool Identifiers
export const DEX_POOL_IDENTIFIERS = {
  RAYDIUM_AMM: 'RaydiumAMM',
  RAYDIUM_CPMM: 'RaydiumCPMM',
  ORCA_WHIRLPOOL: 'OrcaWhirlpool',
  ORCA_STABLE: 'OrcaStable',
  SERUM_MARKET: 'SerumMarket'
};

// Liquidity Thresholds
export const LIQUIDITY_THRESHOLDS = {
  MIN_MEMECOIN_LIQUIDITY_USD: 1000,    // $1,000 minimum liquidity
  GRADUATING_LIQUIDITY_USD: 50000,     // $50,000 to start graduating
  GRADUATED_LIQUIDITY_USD: 250000,     // $250,000 to be considered graduated
  MINIMUM_VOLUME_24H_USD: 100         // $100 minimum 24h volume
};

// Token Supply Thresholds
export const SUPPLY_THRESHOLDS = {
  MIN_MEMECOIN_SUPPLY: 1000000,        // 1M minimum supply
  MAX_MEMECOIN_SUPPLY: 1000000000000,  // 1T maximum supply
  TYPICAL_MEMECOIN_SUPPLY: 1000000000  // 1B typical supply
};

// Price Change Thresholds (in percentage)
export const PRICE_CHANGE_THRESHOLDS = {
  PUMP_THRESHOLD: 50,      // 50% increase considered a pump
  DUMP_THRESHOLD: -30,     // 30% decrease considered a dump
  VOLATILE_THRESHOLD: 25   // 25% change in either direction is volatile
};

// Time Constants (in milliseconds)
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
};

// API Rate Limits
export const RATE_LIMITS = {
  SOLANA_RPC_REQUESTS_PER_SECOND: 10,
  METADATA_REQUESTS_PER_SECOND: 5,
  EXTERNAL_API_REQUESTS_PER_MINUTE: 100
};

// Error Codes
export const ERROR_CODES = {
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  INVALID_TOKEN_DATA: 'INVALID_TOKEN_DATA',
  METADATA_FETCH_FAILED: 'METADATA_FETCH_FAILED',
  LIQUIDITY_CHECK_FAILED: 'LIQUIDITY_CHECK_FAILED',
  BLOCKCHAIN_CONNECTION_ERROR: 'BLOCKCHAIN_CONNECTION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR'
};

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  EXPONENTIAL_BACKOFF: true,
  JITTER: true
};

// Health Check Constants
export const HEALTH_CHECK = {
  BLOCKCHAIN_CONNECTION_TIMEOUT: 5000,
  DATABASE_CONNECTION_TIMEOUT: 3000,
  CACHE_CONNECTION_TIMEOUT: 2000,
  SERVICE_CHECK_INTERVAL: 30000
};

// Popular Memecoin Contract Addresses (for reference/comparison)
export const POPULAR_MEMECOINS = {
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  SAMO: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  COPE: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQWKb5h8hrBBW45Q',
  ROPE: '8PMHT4swUMtBzgHnh5U564N5sjPSiUz2cjEQzFnnP1Fo'
};

