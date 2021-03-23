TOP_DIR=.
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))

build: init
	@echo "Building the software..."
	@npm run bundle

init: install dep
	@echo "Initializing the repo..."

install:
	@echo "Install software required for this repo..."
	@npm install -g yarn @abtnode/cli @babel/cli

dep:
	@echo "Install dependencies required for this repo..."
	@yarn

pre-build: install dep
	@echo "Running scripts before the build..."

post-build:
	@echo "Running scripts after the build is done..."

all: pre-build build post-build

test:
	@echo "Running test suites..."

doc:
	@echo "Building the documenation..."

coverage:
	@echo "Collecting test coverage ..."

lint:
	@echo "Linting the software..."
	@npm run lint

setenv:
	@echo "Setup .env file..."
	@echo "SKIP_PREFLIGHT_CHECK=true" > .env

precommit: setenv dep lint test coverage

github-init:
	@sudo npm install -g yarn @abtnode/cli @babel/cli
	@make precommit

clean:
	@echo "Cleaning the build..."

run:
	@echo "Running the software..."
	@npm run start

include .makefiles/*.mk

.PHONY: build init install dep pre-build post-build all test doc precommit github-action-test clean watch run bump-version create-pr
