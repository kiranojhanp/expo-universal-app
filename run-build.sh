#!/bin/bash
# Parallel build script for Docker

# Run `bun run start` and `bun run build:web` in parallel
bun run start &
start_pid=$!

bun run build:web &
build_pid=$!

# Wait for both to complete and log errors if any
wait $start_pid || echo "Error: bun run start failed."
wait $build_pid || echo "Error: bun run build:web failed."
