TOP_DIR=.
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))

build: init
	@echo "Building the software..."
	@pnpm run  bundle

init: install dep
	@echo "Initializing the repo..."

install:
	@echo "Install software required for this repo..."

dep:
	@echo "Install dependencies required for this repo..."
	@pnpm i --ignore-engines

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
	@pnpm run lint

setenv:
	@echo "Setup .env file..."
	@echo "SKIP_PREFLIGHT_CHECK=true" > .env

precommit: setenv lint test coverage

github-init:
	@make dep
	@make setenv

clean:
	@echo "Cleaning the build..."

run:
	@echo "Running the software..."
	@pnpm run start

include .makefiles/*.mk

.PHONY: build init install dep pre-build post-build all test doc precommit github-action-test clean watch run bump-version create-pr
