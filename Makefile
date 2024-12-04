# ----------------------------------------
# Build Expo App Makefile
# ----------------------------------------

# Default version components
# These variables define the version tag structure:
# MAJOR.MINOR.PATCH-BUILD (e.g., v1.0.0-1696527327)
MAJOR := 0
MINOR := 0
PATCH := 1
BUILD := $(shell date +%s) # timestamp for unique build number
VERSION:= v$(MAJOR).$(MINOR).$(PATCH)-$(BUILD)

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

# -----------------------------------------------------------------------------
# YOU PROBABLY DON'T NEED TO EDIT BELOW THIS LINE
# -----------------------------------------------------------------------------
# Sync the branch with master
sync-master:
	@printf "\033[1;34m>>> Syncing with master...\033[0m\n"
	git checkout master
	git pull origin master
	@printf "\033[1;32m✔ Synced with master.\033[0m\n"

# Create a new branch for the specified version
create-branch:
	@printf "\033[1;34m>>> Creating a branch for version %s...\033[0m\n" $(VERSION)
	git checkout -b $(VERSION)
	@printf "\033[1;32m✔ Branch created: %s\033[0m\n" $(VERSION)

# Create a tag for the specified version
create-tag:
	@printf "\033[1;34m>>> Creating version tag: %s...\033[0m\n" $(VERSION)
	git tag v$(VERSION)
	@printf "\033[1;32m✔ Tag created: v%s\033[0m\n" $(VERSION)

# Push branch and tag to origin
push:
	@printf "\033[1;34m>>> Pushing branch and tag to origin...\033[0m\n"
	git push origin $(VERSION)
	git push origin v$(VERSION)
	@printf "\033[1;32m✔ Branch and tag pushed.\033[0m\n"

# Create a pull request to merge the branch to master
create-pr:
	@printf "\033[1;34m>>> Creating a pull request for branch %s to master...\033[0m\n" $(VERSION)
	gh pr create --base master --head $(VERSION) --title "Release $(VERSION)" --body "Merge branch $(VERSION) to master"
	@printf "\033[1;32m✔ Pull request created.\033[0m\n"

# Trigger the full workflow: sync, create tag, push PR
release: sync-master create-branch create-tag push create-pr
	@printf "\033[1;34m>>> Triggering the workflow...\033[0m\n"
	@printf "\033[1;32m✔ Workflow triggered for version %s...\033[0m\n" $(VERSION)