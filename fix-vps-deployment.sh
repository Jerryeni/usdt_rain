#!/bin/bash

# Quick fix for VPS deployment issue
# This script fixes the ES Module error on your VPS

set -e

VPS_IP="147.93.110.96"
VPS_USER="root"
VPS_PATH="/var/www/usdtrain-backend/backend"

echo "🔧 Fixing VPS deployment..."
echo ""

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

echo "📤 Uploading ecosystem config..."
scp /tmp/ecosystem.config.cjs ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

echo "🚀 Restarting backend with correct configuration..."

ssh ${VPS_USER}@${VPS_IP} << ENDSSH
cd ${VPS_PATH}

# Stop current process
pm2 delete usdtrain-backend || true

# Start with ecosystem config
pm2 start ecosystem.config.cjs

# Save configuration
pm2 save

# Show status
echo ""
echo "✅ Backend restarted successfully!"
echo ""
pm2 status
echo ""
pm2 logs usdtrain-backend --lines 20

ENDSSH

# Cleanup
rm /tmp/ecosystem.config.cjs

echo ""
echo "✅ Fix applied successfully!"
echo ""
echo "Test the API:"
echo "curl https://usdtrain.ucchain.org/api/v1/health"
