import axios from 'axios';
import crypto from 'crypto';
import config from '../config.js';
import Token from '../models/token.model.js';
import PriceHistory from '../models/priceHistory.model.js';
import logger from '../utils/logger.js';
import redisService from './redis.service.js';

const marketDataService = {
  // Get token market data with caching
  async getTokenMarketData(tokenAddress) {
    // Try to get from cache first
    const cacheKey = `token:marketData:${tokenAddress}`;
    const cachedData = await redisService.get(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    // Get token from database
    const token = await Token.findOne({ address: tokenAddress });
    if (!token) {
      return null;
    }
    
    // Get price history for charts
    const priceHistory = await this.getTokenPriceHistoryForCharts(token._id);
    
    // For demonstration, we'll return mock data
    // In a real app, you would fetch this from external APIs or calculate from your own data
    const marketData = {
      price: {
        usd: token.priceUSD,
        sol: token.priceSOL
      },
      marketCap: token.marketCapUSD,
      volume24h: token.volume24h,
      priceChange: {
        '1h': this.generateRandomChange(),
        '24h': token.priceChange24h,
        '7d': this.generateRandomChange(),
        '30d': this.generateRandomChange()
      },
      allTimeHigh: {
        price: (parseFloat(token.priceUSD) * (1 + Math.random())).toFixed(8),
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      },
      allTimeLow: {
        price: (parseFloat(token.priceUSD) * (1 - Math.random() * 0.9)).toFixed(8),
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      },
      priceHistory: priceHistory,
      holders: Math.floor(1000 + Math.random() * 10000),
      liquidityUSD: token.liquidityUSD,
      fullyDilutedValuation: (
        parseFloat(token.totalSupply) * parseFloat(token.priceUSD)
      ).toFixed(2)
    };
    
    // Cache the data for 5 minutes
    await redisService.set(cacheKey, JSON.stringify(marketData), 300);
    
    return marketData;
  },

  // Generate random price change for mock data
  generateRandomChange() {
    return (Math.random() * 40 - 20).toFixed(2);
  },

  // Get token price history formatted for charts
  async getTokenPriceHistoryForCharts(tokenId) {
    const intervals = {
      '1h': { interval: '1m', limit: 60, timeframe: '1 hour' },
      '24h': { interval: '5m', limit: 288, timeframe: '24 hours' },
      '7d': { interval: '1h', limit: 168, timeframe: '7 days' },
      '30d': { interval: '4h', limit: 180, timeframe: '30 days' },
      'all': { interval: '1d', limit: 365, timeframe: 'all time' }
    };
    
    const result = {};
    
    for (const [key, config] of Object.entries(intervals)) {
      const now = new Date();
      let startTime;
      
      if (key === 'all') {
        startTime = new Date(0); // Beginning of time
      } else if (key === '30d') {
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() - 30);
      } else if (key === '7d') {
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() - 7);
      } else if (key === '24h') {
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() - 1);
      } else { // 1h
        startTime = new Date(now);
        startTime.setHours(startTime.getHours() - 1);
      }
      
      const priceHistory = await PriceHistory.find({
        tokenId,
        interval: config.interval,
        timestamp: { $gte: startTime }
      })
        .sort('timestamp')
        .limit(config.limit);
      
      // If no data, generate mock data
      if (priceHistory.length === 0) {
        result[key] = this.generateMockPriceHistory(config.limit, key);
      } else {
        result[key] = priceHistory.map(entry => ({
          timestamp: entry.timestamp,
          price: entry.close
        }));
      }
    }
    
    return result;
  },

  // Generate mock price history for demonstration
  generateMockPriceHistory(limit, timeframe) {
    const result = [];
    const now = new Date();
    let basePrice = Math.random() * 10;
    let volatility;
    
    switch (timeframe) {
      case '1h':
        volatility = 0.002;
        break;
      case '24h':
        volatility = 0.01;
        break;
      case '7d':
        volatility = 0.03;
        break;
      case '30d':
      case 'all':
        volatility = 0.08;
        break;
      default:
        volatility = 0.01;
    }
    
    for (let i = 0; i < limit; i++) {
      // Generate timestamp
      const timestamp = new Date(now);
      
      if (timeframe === '1h') {
        timestamp.setMinutes(timestamp.getMinutes() - (limit - i));
      } else if (timeframe === '24h') {
        timestamp.setMinutes(timestamp.getMinutes() - (limit - i) * 5);
      } else if (timeframe === '7d') {
        timestamp.setHours(timestamp.getHours() - (limit - i));
      } else if (timeframe === '30d') {
        timestamp.setHours(timestamp.getHours() - (limit - i) * 4);
      } else { // all
        timestamp.setDate(timestamp.getDate() - (limit - i));
      }
      
      // Generate price with random walk
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      basePrice = basePrice * (1 + randomChange);
      if (basePrice < 0.00001) basePrice = 0.00001; // Ensure non-negative price
      
      result.push({
        timestamp,
        price: basePrice.toFixed(8)
      });
    }
    
    return result;
  },

  // Update token prices and market data from external sources
  async updateTokenMarketData() {
    try {
      // Get all tokens
      const tokens = await Token.find();
      
      // For each token, update market data
      for (const token of tokens) {
        // In a real app, fetch data from CoinGecko, CoinMarketCap, or on-chain sources
        // For demonstration, we'll generate mock data
        
        // Generate random price changes
        const priceChangePct = (Math.random() * 20 - 10) / 100; // -10% to +10%
        const previousPriceUSD = parseFloat(token.priceUSD) || 0.001;
        const newPriceUSD = previousPriceUSD * (1 + priceChangePct);
        
        // Calculate SOL price (assuming 1 SOL = $50, adjust as needed)
        const solPrice = 50;
        const newPriceSOL = newPriceUSD / solPrice;
        
        // Calculate market cap
        const marketCapUSD = newPriceUSD * parseFloat(token.totalSupply);
        
        // Generate random volume
        const volume24h = marketCapUSD * (Math.random() * 0.3); // 0-30% of market cap
        
        // Update token in database
        token.priceUSD = newPriceUSD.toFixed(8);
        token.priceSOL = newPriceSOL.toFixed(8);
        token.marketCapUSD = marketCapUSD.toFixed(2);
        token.volume24h = volume24h.toFixed(2);
        token.priceChange24h = (priceChangePct * 100).toFixed(2);
        
        await token.save();
        
        // Create price history entry
        const now = new Date();
        const intervals = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
        
        // Only create entries for appropriate intervals based on current time
        for (const interval of intervals) {
          let shouldCreate = false;
          
          if (interval === '1m') {
            shouldCreate = true; // Create every minute
          } else if (interval === '5m' && now.getMinutes() % 5 === 0) {
            shouldCreate = true;
          } else if (interval === '15m' && now.getMinutes() % 15 === 0) {
            shouldCreate = true;
          } else if (interval === '30m' && now.getMinutes() % 30 === 0) {
            shouldCreate = true;
          } else if (interval === '1h' && now.getMinutes() === 0) {
            shouldCreate = true;
          } else if (interval === '4h' && now.getHours() % 4 === 0 && now.getMinutes() === 0) {
            shouldCreate = true;
          } else if (interval === '1d' && now.getHours() === 0 && now.getMinutes() === 0) {
            shouldCreate = true;
          }
          
          if (shouldCreate) {
            // Small random fluctuation for candle values
            const open = parseFloat(token.priceUSD);
            const close = newPriceUSD;
            const high = Math.max(open, close) * (1 + Math.random() * 0.05);
            const low = Math.min(open, close) * (1 - Math.random() * 0.05);
            
            await PriceHistory.create({
              tokenId: token._id,
              timestamp: now,
              interval,
              open: open.toFixed(8),
              high: high.toFixed(8),
              low: low.toFixed(8),
              close: close.toFixed(8),
              volume: (volume24h * Math.random()).toFixed(2)
            });
          }
        }
      }
      
      logger.info(`Updated market data for ${tokens.length} tokens`);
    } catch (error) {
      logger.error('Error updating token market data:', error);
    }
  }
};

export default marketDataService;