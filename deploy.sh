#!/bin/bash

# Set execute permissions:
# chmod +x deploy.sh

# Run
# ./deploy.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Step 1: Build and start Docker containers in detached mode
echo "Starting Docker containers..."
docker compose up --build -d

# Step 2: Navigate to the frontend directory
echo "Navigating to the frontend directory..."
cd frontend

# Step 3: Install npm dependencies with legacy peer deps
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Step 4: Build the frontend project
echo "Building frontend project..."
npm run build

# Step 5: Restart the PM2 process for prebo-tools
echo "Restarting PM2 process..."
pm2 restart "prebo-tools"

echo "Deployment completed successfully!"
