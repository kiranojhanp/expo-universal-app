# Base stage using the official Bun image
FROM oven/bun:1 AS install
WORKDIR /usr/src/app

# Install only production dependencies
COPY package.json bun.lockb ./
RUN bun install --production --frozen-lockfile

# Build the application
COPY . .
CMD ["bun", "run", "start"]
CMD ["bun", "run", "build:web"]

# Final stage for production using a smaller image
FROM oven/bun:1-slim AS release
WORKDIR /usr/src/app

# Copy the build output, server file, and node_modules
COPY --chown=bun:bun --from=install /usr/src/app/dist ./dist
COPY --chown=bun:bun --from=install /usr/src/app/web-server/node-server.js ./node-server.js
COPY --chown=bun:bun --from=install /usr/src/app/node_modules ./node_modules

# Make the script executable
RUN chmod +x /usr/src/app/node-server.js

# Expose the application port
EXPOSE $PORT
CMD ["bun", "/usr/src/app/node-server.js"] 
