import EventEmitter from 'events';
import axios from 'axios';
import config from '../config/index.js';
import logger from './logger.js';

class HealthMonitor extends EventEmitter {
  constructor() {
    super();
    
    this.status = {
      solana: { healthy: false, lastCheck: null, error: null },
      mongodb: { healthy: false, lastCheck: null, error: null },
      redis: { healthy: false, lastCheck: null, error: null },
      backend: { healthy: false, lastCheck: null, error: null },
      system: { healthy: true, lastCheck: null, error: null }
    };
    
    this.checkInterval = 30000;
    this.intervalId = null;
    this.isRunning = false;
    
    // Metrics
    this.metrics = {
      tokensProcessed: 0,
      tokensSkipped: 0,
      errors: 0,
      uptime: Date.now(),
      lastTokenProcessed: null,
      averageProcessingTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    // Health thresholds
    this.thresholds = {
      maxMemoryUsage: 500 * 1024 * 1024, // 500MB
      maxResponseTime: 5000, // 5 seconds
      maxErrorRate: 0.1 // 10%
    };
  }

  // Start health monitoring
  start() {
    if (this.isRunning) {
      logger.warn('Health monitor is already running');
      return;
    }

    logger.info('Starting health monitor...');
    this.isRunning = true;
    
    // Initial health check
    this.performHealthCheck();
    
    // Set up periodic health checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
    
    // Set up metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 60000); // Every minute
    
    this.emit('started');
  }

  // Stop health monitoring
  stop() {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping health monitor...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    this.emit('stopped');
  }

  // Perform comprehensive health check
  async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      // Check all components in parallel
      const checks = await Promise.allSettled([
        this.checkSolanaConnection(),
        this.checkMongoDBConnection(),
        this.checkRedisConnection(),
        this.checkBackendConnection(),
        this.checkSystemHealth()
      ]);
      
      // Process results
      const [solana, mongodb, redis, backend, system] = checks;
      
      this.updateStatus('solana', solana);
      this.updateStatus('mongodb', mongodb);
      this.updateStatus('redis', redis);
      this.updateStatus('backend', backend);
      this.updateStatus('system', system);
      
      // Calculate overall health
      const overallHealth = this.calculateOverallHealth();
      
      // Emit health status
      this.emit('healthCheck', {
        overall: overallHealth,
        components: this.status,
        checkDuration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      
      // Log health status
      if (overallHealth.healthy) {
        logger.debug('Health check completed - All systems healthy');
      } else {
        logger.warn(`Health check completed - Issues detected: ${overallHealth.issues.join(', ')}`);
      }
      
    } catch (error) {
      logger.error('Health check failed:', error);
      this.emit('error', error);
    }
  }

  // Check Solana connection
  async checkSolanaConnection() {
    try {
      const { Connection } = await import('@solana/web3.js');
      const connection = new Connection(config.solana.clusterEndpoint);
      const startTime = Date.now();
      await connection.getSlot();
      const responseTime = Date.now() - startTime;
      return {
        healthy: responseTime < this.thresholds.maxResponseTime,
        responseTime,
        endpoint: config.solana.clusterEndpoint
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        endpoint: config.solana.clusterEndpoint
      };
    }
  }

  // Check MongoDB connection
  async checkMongoDBConnection() {
    try {
      const mongoose = (await import('mongoose')).default;
      const startTime = Date.now();
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB not connected');
      }
      await mongoose.connection.db.admin().ping();
      const responseTime = Date.now() - startTime;
      return {
        healthy: responseTime < this.thresholds.maxResponseTime,
        responseTime,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        readyState: (globalThis.mongoose && globalThis.mongoose.connection && globalThis.mongoose.connection.readyState) || 0
      };
    }
  }

  // Check Redis connection
  async checkRedisConnection() {
    try {
      const redis = (await import('redis')).default;
      const client = redis.createClient({
        url: config.redis.url,
        password: config.redis.password
      });
      const startTime = Date.now();
      await client.connect();
      await client.ping();
      const responseTime = Date.now() - startTime;
      await client.quit();
      return {
        healthy: responseTime < this.thresholds.maxResponseTime,
        responseTime,
        host: config.redis.host,
        port: config.redis.port
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        host: config.redis.host,
        port: config.redis.port
      };
    }
  }

  // Check backend API connection
  async checkBackendConnection() {
    try {
      const startTime = Date.now();
      if (!config.tokenApiEndpoint) {
        return {
          healthy: false,
          error: 'tokenApiEndpoint is not defined in config',
          endpoint: null
        };
      }
      // Test backend health endpoint
      const response = await axios.get(`${config.tokenApiEndpoint.replace('/api/tokens', '')}/health`, {
        timeout: 5000
      });
      const responseTime = Date.now() - startTime;
      return {
        healthy: response.status === 200 && responseTime < this.thresholds.maxResponseTime,
        responseTime,
        status: response.status,
        endpoint: config.tokenApiEndpoint
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        endpoint: config.tokenApiEndpoint
      };
    }
  }

  // Check system health (memory, CPU, etc.)
  async checkSystemHealth() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Check memory usage
      const memoryHealthy = memUsage.heapUsed < this.thresholds.maxMemoryUsage;
      
      // Calculate error rate
      const totalOperations = this.metrics.tokensProcessed + this.metrics.tokensSkipped;
      const errorRate = totalOperations > 0 ? this.metrics.errors / totalOperations : 0;
      const errorRateHealthy = errorRate < this.thresholds.maxErrorRate;
      
      return {
        healthy: memoryHealthy && errorRateHealthy,
        memory: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          healthy: memoryHealthy
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        errorRate: {
          rate: errorRate,
          healthy: errorRateHealthy,
          totalOperations,
          errors: this.metrics.errors
        },
        uptime: Date.now() - this.metrics.uptime
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Update component status
  updateStatus(component, result) {
    const now = new Date();
    
    if (result.status === 'fulfilled') {
      this.status[component] = {
        healthy: result.value.healthy,
        lastCheck: now,
        error: result.value.error || null,
        ...result.value
      };
    } else {
      this.status[component] = {
        healthy: false,
        lastCheck: now,
        error: result.reason.message
      };
    }
  }

  // Calculate overall health
  calculateOverallHealth() {
    const components = Object.keys(this.status);
    const healthyComponents = components.filter(comp => this.status[comp].healthy);
    const unhealthyComponents = components.filter(comp => !this.status[comp].healthy);
    
    const overallHealthy = unhealthyComponents.length === 0;
    
    return {
      healthy: overallHealthy,
      score: (healthyComponents.length / components.length) * 100,
      healthyComponents,
      unhealthyComponents,
      issues: unhealthyComponents.map(comp => `${comp}: ${this.status[comp].error || 'unhealthy'}`)
    };
  }

  // Collect system metrics
  collectMetrics() {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage();
    
    // Emit metrics
    this.emit('metrics', {
      ...this.metrics,
      timestamp: new Date().toISOString()
    });
  }

  // Record token processing
  recordTokenProcessed(processingTime) {
    this.metrics.tokensProcessed++;
    this.metrics.lastTokenProcessed = new Date();
    
    // Update average processing time
    if (this.metrics.averageProcessingTime === 0) {
      this.metrics.averageProcessingTime = processingTime;
    } else {
      this.metrics.averageProcessingTime = 
        (this.metrics.averageProcessingTime + processingTime) / 2;
    }
  }

  // Record token skipped
  recordTokenSkipped() {
    this.metrics.tokensSkipped++;
  }

  // Record error
  recordError() {
    this.metrics.errors++;
  }

  // Get current status
  getStatus() {
    return {
      status: this.status,
      metrics: this.metrics,
      overall: this.calculateOverallHealth(),
      isRunning: this.isRunning
    };
  }

  // Get health summary for API
  getHealthSummary() {
    const overall = this.calculateOverallHealth();
    
    return {
      status: overall.healthy ? 'healthy' : 'unhealthy',
      score: overall.score,
      components: Object.keys(this.status).reduce((acc, comp) => {
        acc[comp] = {
          status: this.status[comp].healthy ? 'healthy' : 'unhealthy',
          lastCheck: this.status[comp].lastCheck,
          responseTime: this.status[comp].responseTime
        };
        return acc;
      }, {}),
      metrics: {
        tokensProcessed: this.metrics.tokensProcessed,
        tokensSkipped: this.metrics.tokensSkipped,
        errors: this.metrics.errors,
        uptime: Date.now() - this.metrics.uptime,
        lastTokenProcessed: this.metrics.lastTokenProcessed
      },
      timestamp: new Date().toISOString()
    };
  }
}

export default HealthMonitor;