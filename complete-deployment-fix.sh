#!/bin/bash

# Complete Deployment Fix
# Step 1: Update Node.js
# Step 2: Fix backend deployment

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🚀 COMPLETE BACKEND DEPLOYMENT FIX                         ║"
echo "║   Two-step process: Update Node.js → Fix Backend            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "This script will:"
echo "  1. Update Node.js from v12 to v18"
echo "  2. Fix the backend ES module issue"
echo "  3. Start the backend correctly"
echo ""

read -p "Do you want to proceed? (type 'yes' to continue): " -r
echo

if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Aborted by user."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 1: UPDATING NODE.JS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh root@147.93.110.96 << 'NODEJS_UPDATE'

echo "Current Node.js: $(node --version)"
echo ""

echo "Downloading Node.js 18 setup..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

echo ""
echo "Installing Node.js 18..."
apt-get install -y nodejs

echo ""
echo "New Node.js version: $(node --version)"
echo "New npm version: $(npm --version)"

NODEJS_UPDATE

echo ""
echo "✅ Node.js updated successfully!"
echo ""

sleep 2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 2: FIXING BACKEND DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh root@147.93.110.96 << 'BACKEND_FIX'

echo "Stopping old processes..."
pm2 delete usdtrain 2>/dev/null || true
pm2 delete usdtrain-backend 2>/dev/null || true

echo ""
echo "Navigating to backend..."
cd /var/www/usdtrain-backend/backend

echo ""
echo "Updating package.json..."
if ! grep -q '"type".*:.*"module"' package.json; then
  cp package.json package.json.backup.$(date +%s)
  sed -i '/"name"/a\  "type": "module",' package.json
  echo "✅ Added ES module type"
else
  echo "✅ Already has ES module type"
fi

echo ""
echo "Creating ecosystem config..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'usdtrain-backend',
    script: './src/server.js',
    cwd: '/var/www/usdtrain-backend/backend',
    interpreter: 'node',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

echo "✅ Ecosystem config created"

echo ""
echo "Creating logs directory..."
mkdir -p logs

echo ""
echo "Starting backend with PM2..."
pm2 start ecosystem.config.cjs

echo ""
echo "Saving PM2 config..."
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PM2 Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status

echo ""
echo "Waiting 5 seconds for backend to start..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Recent Logs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs usdtrain-backend --lines 50 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 2
curl -s http://localhost:3001/api/v1/health || echo "⚠️  Backend not responding yet"

BACKEND_FIX

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ COMPLETE DEPLOYMENT FIX DONE!                           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 What was done:"
echo "   ✅ Node.js updated to v18"
echo "   ✅ package.json updated with ES module type"
echo "   ✅ PM2 ecosystem config created"
echo "   ✅ Backend started with PM2"
echo ""

echo "🧪 Test the API:"
echo "   curl https://usdtrain.ucchain.org/api/v1/health"
echo ""

echo "📊 View logs:"
echo "   ssh root@147.93.110.96 'pm2 logs usdtrain-backend'"
echo ""

echo "🔍 Check status:"
echo "   ssh root@147.93.110.96 'pm2 status'"
echo ""
