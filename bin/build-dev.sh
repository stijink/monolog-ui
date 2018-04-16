#!/usr/bin/env bash

# Ensure .env exists
if [ ! -f .env ]; then
    cp .env.dist .env
fi

# Pull latest versions of docker dependencies
docker pull node:9

# Ensure images are built
docker-compose build

# Install app dependencies
docker-compose run app yarn install

# Install api dependencies
docker-compose run api yarn install
