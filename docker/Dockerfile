ARG BUN_BUILDER_VERSION=1
ARG BUN_RUNNER_VERSION=alpine

# Base stage using the official Bun image
FROM oven/bun:${BUN_BUILDER_VERSION} AS base

# -----------------------------------------------------------------------------
# Stage 1: Build server package
# -----------------------------------------------------------------------------
FROM base AS prerelease
WORKDIR /app

COPY --chown=bun:bun ./dist ./dist
COPY --chown=bun:bun ./web-server/express-server.js ./express-server.js

# Install runtime-only dependencies
RUN bun install express@4.21.1 compression@1.7.5 cors@2.8.5 morgan@1.10.0 @expo/server@0.5.0

# TODO: use bun executable when it is smaller. Currently it's 90MB for Hello World.
# https://news.ycombinator.com/item?id=35965782 | https://bun.sh/docs/bundler/executables
# Package the files and node_modules into a tar.gz file for ease of moving
RUN tar -czvf fewa-bundle.tar.gz node_modules dist express-server.js

# -----------------------------------------------------------------------------
# Stage 2: Run the application in smaller base image
# -----------------------------------------------------------------------------
FROM oven/bun:${BUN_RUNNER_VERSION}
WORKDIR /app

# Copy the tar.gz bundle from the prerelease stage
COPY --chown=bun:bun --from=prerelease /app/fewa-bundle.tar.gz /app/fewa-bundle.tar.gz

# Extract the tar.gz bundle
RUN tar -xzvf /app/fewa-bundle.tar.gz && rm /app/fewa-bundle.tar.gz

# Switch to the "bun" user for security
USER bun

# Expose the application port
EXPOSE $PORT
CMD ["bun", "/app/express-server.js"]