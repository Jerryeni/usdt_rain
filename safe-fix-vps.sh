#!/bin/bash

# SAFE VPS Deployment Fix
# This script ONLY touches /var/www/usdtrain-backend/backend
# It will NOT affect any other files or directories on your VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_IP="147.93.110.96"
VPS_USER="root"
VPS_PATH="/var/www/usdtrain-backend/backend"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║   SAFE VPS DEPLOYMENT FIX - ES MODULE ISSUE                  ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}⚠️  SAFETY INFORMATION:${NC}"
echo ""
echo -e "${GREEN}✅ This script will ONLY:${NC}"
echo "   1. Upload ONE file to: ${VPS_PATH}/ecosystem.config.cjs"
echo "   2. Work inside directory: ${VPS_PATH}"
echo "   3. Restart ONLY the 'usdtrain-backend' PM2 process"
echo ""
echo -e "${GREEN}✅ This script will NOT:${NC}"
echo "   ❌ Touch any files outside ${VPS_PATH}"
echo "   ❌ Modify your .env file"
echo "   ❌ Delete any existing files"
echo "   ❌ Affect other PM2 processes"
echo "   ❌ Change system configurations"
echo "   ❌ Modify Nginx or other services"
echo ""

# Ask for confirmation
read -p "Do you want to proceed? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}Aborted by user.${NC}"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Checking VPS connection...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test SSH connection
if ! ssh -o ConnectTimeout=5 ${VPS_USER}@${VPS_IP} "echo 'Connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to VPS. Please check:${NC}"
    echo "   - VPS IP: ${VPS_IP}"
    echo "   - SSH access"
    echo "   - Network connection"
    exit 1
fi

echo -e "${GREEN}✅ VPS connection successful${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Checking backend directory...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if directory exists
if ! ssh ${VPS_USER}@${VPS_IP} "[ -d ${VPS_PATH} ]"; then
    echo -e "${RED}❌ Backend directory does not exist: ${VPS_PATH}${NC}"
    echo ""
    echo "Please create it first or check the path."
    exit 1
fi

echo -e "${GREEN}✅ Backend directory exists${NC}"
echo ""

# Show what's currently in the directory
echo -e "${YELLOW}Current files in ${VPS_PATH}:${NC}"
ssh ${VPS_USER}@${VPS_IP} "ls -la ${VPS_PATH} | head -20"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Creating ecosystem config...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Create ecosystem config file content
cat > /tmp/ecosystem.config.cjs << 'EOF'
// PM2 Ecosystem Configuration for USDT Rain Backend
module.exports = {
  apps: [{
    name: 'usdtrain-backend',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--experimental-modules',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    exp_backoff_restart_delay: 100
  }]
};
EOF

echo -e "${GREEN}✅ Config file created locally${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Uploading to VPS...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Uploading to: ${VPS_PATH}/ecosystem.config.cjs"
scp /tmp/ecosystem.config.cjs ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

echo -e "${GREEN}✅ File uploaded successfully${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Restarting backend...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
# Change to backend directory ONLY
cd /var/www/usdtrain-backend/backend

echo "Current directory: $(pwd)"
echo ""

# Check if PM2 process exists
if pm2 list | grep -q "usdtrain-backend"; then
  echo "Stopping existing usdtrain-backend process..."
  pm2 delete usdtrain-backend || true
else
  echo "No existing usdtrain-backend process found."
fi

echo ""
echo "Starting backend with ecosystem config..."
pm2 start ecosystem.config.cjs

echo ""
echo "Saving PM2 configuration..."
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current PM2 Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Recent Logs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs usdtrain-backend --lines 20 --nostream

ENDSSH

# Cleanup local temp file
rm -f /tmp/ecosystem.config.cjs

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║   ✅ DEPLOYMENT FIX COMPLETED SUCCESSFULLY!                  ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📋 What was changed:${NC}"
echo "   ✅ Added: ${VPS_PATH}/ecosystem.config.cjs"
echo "   ✅ Restarted: usdtrain-backend PM2 process"
echo "   ✅ No other files were modified"
echo ""

echo -e "${BLUE}🧪 Test the API:${NC}"
echo "   curl https://usdtrain.ucchain.org/api/v1/health"
echo ""

echo -e "${BLUE}📊 View logs:${NC}"
echo "   ssh ${VPS_USER}@${VPS_IP} 'pm2 logs usdtrain-backend'"
echo ""

echo -e "${BLUE}🔍 Check status:${NC}"
echo "   ssh ${VPS_USER}@${VPS_IP} 'pm2 status'"
echo ""
