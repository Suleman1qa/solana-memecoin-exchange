FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:20-slim

# Install necessary system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Create logs directory
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production \
    MONGODB_URI=mongodb://mongodb:27017/solana-memecoin-exchange \
    REDIS_URL=redis://redis:6379 \
    HEALTH_CHECK_PORT=5001

# Use tini as entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]

# Start the application
CMD ["npm", "start"]

# Expose health check port
EXPOSE 5001 