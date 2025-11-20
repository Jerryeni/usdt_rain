#!/bin/bash

# USDT Rain Backend - VPS Deployment Script
# This script safely deploys the backend to your VPS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="147.93.110.96"
VPS_USER="root"
VPS_PATH="/var/www/usdtrain-backend"
APP_NAME="usdtrain-backend"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   USDT Rain Backend - VPS Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Create deployment package
echo -e "${YELLOW}📦 Step 1: Creating deployment package...${NC}"
cd backend

# Create a clean copy excluding node_modules and logs
tar -czf backend-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='logs' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='.git' \
  src/ package.json package-lock.json ecosystem.config.cjs start.sh README.md

echo -e "${GREEN}✅ Deployment package created${NC}"
echo ""

# Step 2: Upload to VPS
echo -e "${YELLOW}📤 Step 2: Uploading to VPS...${NC}"
echo "Connecting to ${VPS_IP}..."

scp backend-deploy.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/

echo -e "${GREEN}✅ Files uploaded${NC}"
echo ""

# Step 3: Deploy on VPS
echo -e "${YELLOW}🚀 Step 3: Deploying on VPS...${NC}"

ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VPS_PATH="/var/www/usdtrain-backend"
APP_NAME="usdtrain-backend"

echo -e "${BLUE}On VPS: Starting deployment...${NC}"

# Create directory if it doesn't exist
mkdir -p ${VPS_PATH}/backend
cd ${VPS_PATH}/backend

# Backup existing .env if it exists
if [ -f .env ]; then
  echo -e "${YELLOW}Backing up existing .env file...${NC}"
  cp .env .env.backup
fi

# Extract new files
echo -e "${YELLOW}Extracting files...${NC}"
tar -xzf /tmp/backend-deploy.tar.gz

# Restore .env if backup exists
if [ -f .env.backup ]; then
  echo -e "${YELLOW}Restoring .env file...${NC}"
  cp .env.backup .env
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --production

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}Installing PM2...${NC}"
  npm install -g pm2
fi

# Check if app is already running
if pm2 list | grep -q ${APP_NAME}; then
  echo -e "${YELLOW}Restarting ${APP_NAME}...${NC}"
  pm2 restart ${APP_NAME}
else
  echo -e "${YELLOW}Starting ${APP_NAME} with ecosystem config...${NC}"
  pm2 start ecosystem.config.cjs
  pm2 save
fi

# Show status
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
pm2 status
echo ""
echo -e "${BLUE}View logs: pm2 logs ${APP_NAME}${NC}"
echo -e "${BLUE}Check status: pm2 status${NC}"
echo ""

# Cleanup
rm -f /tmp/backend-deploy.tar.gz

ENDSSH

# Cleanup local files
rm -f backend-deploy.tar.gz

cd ..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   🎉 Deployment Successful!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Test API: ${YELLOW}curl https://usdtrain.ucchain.org/api/v1/health${NC}"
echo -e "2. View logs: ${YELLOW}ssh ${VPS_USER}@${VPS_IP} 'pm2 logs ${APP_NAME}'${NC}"
echo -e "3. Check status: ${YELLOW}ssh ${VPS_USER}@${VPS_IP} 'pm2 status'${NC}"
echo ""
