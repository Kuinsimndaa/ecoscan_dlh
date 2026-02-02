FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

# Expose port
EXPOSE 3030

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3030/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run as non-root user
USER appuser

# Start application
CMD ["node", "src/server.js"]
