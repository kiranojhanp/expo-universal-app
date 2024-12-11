ARG NODE_BUILDER_VERSION=18
ARG NODE_RUNNER_VERSION=18-alpine

# Base stage using the official Node image
FROM node:${NODE_BUILDER_VERSION} AS base

# -----------------------------------------------------------------------------
# Stage 1: Build server package
# -----------------------------------------------------------------------------
FROM base AS prerelease
WORKDIR /app

COPY --chown=node:node ./dist ./dist
COPY --chown=node:node ./extras/web-server/express-server.js ./express-server.js

# Install server-only dependencies
RUN yarn init -y
RUN yarn add express@4.21.1 compression@1.7.5 cors@2.8.5 morgan@1.10.0 @expo/server@0.5.0

# TODO: use bun executable when it is smaller. Currently it's 90MB for Hello World.
# https://news.ycombinator.com/item?id=35965782 | https://bun.sh/docs/bundler/executables
# Package the files and node_modules into a tar.gz file for ease of moving
RUN tar -czvf packaged-app-bundle.tar.gz node_modules dist express-server.js

# -----------------------------------------------------------------------------
# Stage 2: Extract and run the application in smaller base image
# -----------------------------------------------------------------------------
FROM node:${NODE_RUNNER_VERSION}
WORKDIR /app

# Copy the tar.gz bundle from the prerelease stage
COPY --chown=node:node --from=prerelease /app/packaged-app-bundle.tar.gz /app/packaged-app-bundle.tar.gz

# Extract the tar.gz bundle
RUN tar -xzvf /app/packaged-app-bundle.tar.gz && rm /app/packaged-app-bundle.tar.gz

# Switch to the "node" user for security
USER node

# Expose the application port
EXPOSE $PORT
CMD ["node", "/app/express-server.js"]