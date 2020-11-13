#!/bin/bash

NEW_VERSION=$(cat version)
abtnode blocklet:version $NEW_VERSION
git add blocklet.yml
