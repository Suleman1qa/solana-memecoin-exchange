import logger from "./logger.js";

class RateLimiter {
  constructor(maxRequestsPerSecond = 100) {
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.processing = false;
  }

  async enqueue(operation) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minInterval = 1000 / this.maxRequestsPerSecond;

      if (timeSinceLastRequest < minInterval) {
        await new Promise((resolve) =>
          setTimeout(resolve, minInterval - timeSinceLastRequest)
        );
      }

      const { operation, resolve, reject } = this.requestQueue.shift();

      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        if (error.response?.status === 429) {
          // If rate limited, wait longer and retry
          logger.warn("Rate limited by RPC endpoint, backing off...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          this.requestQueue.unshift({ operation, resolve, reject });
        } else {
          reject(error);
        }
      }

      this.lastRequestTime = Date.now();
    } catch (error) {
      logger.error("Error in rate limiter:", error);
    } finally {
      this.processing = false;
      if (this.requestQueue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }
}

export default RateLimiter;
