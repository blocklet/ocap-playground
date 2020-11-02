#!/usr/bin/env bash

# trigger ArcBlock/blocklets repo release if we merged to master
travis login --pro --github-token=$GIT_HUB_TOKEN
REPO_SLUG="ArcBlock/blocklets"
BUILD_ID=`travis branches --pro --repo $REPO_SLUG | grep master | awk '{print $2}' | awk -F# '{print $2}'`
echo "Last build for $REPO_SLUG repo is: $BUILD_ID"
travis cancel --pro --repo $REPO_SLUG $BUILD_ID
travis restart --pro --repo $REPO_SLUG $BUILD_ID