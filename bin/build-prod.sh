#!/usr/bin/env bash

bin/build-dev.sh

# Build app.js in production mode
docker-compose run app yarn run build
