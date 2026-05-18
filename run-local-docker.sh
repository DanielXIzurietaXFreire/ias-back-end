#!/usr/bin/env bash
ENV_FILE="${1:-.env.test}"

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE not found. Copy .env.test.example to .env.test and fill the values before running."
  exit 1
fi

echo "Building Docker image ias-backend:local..."
docker build -t ias-backend:local .

if [ $? -ne 0 ]; then
  exit 1
fi

echo "Running container (port 3000) using $ENV_FILE..."
docker run --rm -it -p 3000:3000 --env-file "$ENV_FILE" --name ias-backend-local ias-backend:local
