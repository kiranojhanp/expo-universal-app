# ----------------------------------------
# Build Web App Makefile
# ----------------------------------------

# Default version components
# These variables define the version tag structure:
# MAJOR.MINOR.PATCH-BUILD (e.g., v1.0.0-1696527327)
MAJOR := 0
MINOR := 0
PATCH := 1
BUILD := $(shell date +%s) # Use timestamp for unique build number

# Install dependencies using Bun
install:
	@printf "\033[1;34m>>> Installing dependencies...\033[0m\n"
	bun install
	@printf "\033[1;32m✔ Dependencies installed successfully.\033[0m\n"

# Build and run the application in a Docker development environment
docker.dev:
	@printf "\033[1;34m>>> Building and starting Docker containers...\033[0m\n"
	bun build:web
	cd docker && docker compose up
	@printf "\033[1;32m✔ Docker containers are up and running.\033[0m\n"

# Generate a version tag
tag:
	@printf "\033[1;34m>>> Creating version tag...\033[0m\n"
	git tag v$(MAJOR).$(MINOR).$(PATCH)-$(BUILD)
	@printf "\033[1;32m✔ Version tag created: v$(MAJOR).$(MINOR).$(PATCH)-$(BUILD)\033[0m\n"

# Push the generated tag to the remote repository
push:
	@printf "\033[1;34m>>> Pushing version tag to origin...\033[0m\n"
	git push origin v$(MAJOR).$(MINOR).$(PATCH)-$(BUILD)
	@printf "\033[1;32m✔ Version tag pushed successfully.\033[0m\n"

# Trigger the full workflow: tag creation + push
release: tag push
	@printf "\033[1;34m>>> Triggering the workflow...\033[0m\n"
	@printf "\033[1;32m✔ Workflow triggered with tag: v$(MAJOR).$(MINOR).$(PATCH)-$(BUILD)\033[0m\n"