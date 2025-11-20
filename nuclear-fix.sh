#!/bin/bash

# Nuclear Fix - Complete cleanup and fresh start
# This will stop ALL usdtrain processes and start fresh with new Node.js

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🔥 NUCLEAR FIX - Complete Backend Restart                  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

ssh root@147.93.110.96 << 'ENDSSH'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking Node.js version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

node --version
npm --version

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Showing current PM2 processes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 list

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Stopping ALL usdtrain processes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get all process IDs with 'usdtrain' in the name
pm2 list | grep usdtrain | awk '{print $2}' | while read id; do
  if [ ! -z "$id" ] && [ "$id" != "│" ]; then
    echo "Deleting process ID: $id"
    pm2 delete $id 2>/dev/null || true
  fi
done

# Also try by name
pm2 delete usdtrain 2>/dev/null || true
pm2 delete usdtrain-backend 2>/dev/null || true

echo "✅ All usdtrain processes stopped"

sleep 3

echo ""
echo "Current PM2 processes after cleanup:"
pm2 list

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Navigating to backend directory..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /var/www/usdtrain-backend/backend || {
  echo "❌ Cannot access backend directory"
  exit 1
}

echo "✅ In directory: $(pwd)"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Checking package.json..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f package.json ]; then
  echo "❌ package.json not found!"
  exit 1
fi

echo "Current package.json (first 15 lines):"
head -15 package.json

echo ""

# Check and add type: module
if grep -q '"type".*:.*"module"' package.json; then
  echo "✅ package.json already has ES module type"
else
  echo "Adding ES module type..."
  cp package.json package.json.backup.$(date +%s)
  
  # Use a more reliable method to add type: module
  cat package.json | jq '. + {"type": "module"}' > package.json.tmp && mv package.json.tmp package.json
  
  # If jq is not available, use sed
  if [ $? -ne 0 ]; then
    sed -i '/"name"/a\  "type": "module",' package.json
  fi
  
  echo "✅ Added ES module type"
fi

echo ""
echo "Updated package.json (first 15 lines):"
head -15 package.json

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Creating fresh ecosystem config..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'usdtrain-backend',
    script: './src/server.js',
    cwd: '/var/www/usdtrain-backend/backend',
    interpreter: 'node',
    interpreterArgs: '',
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
    merge_logs: true,
    exp_backoff_restart_delay: 100,
    min_uptime: '10s',
    max_restarts: 10
  }]
};
EOF

echo "✅ Ecosystem config created"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Ensuring logs directory exists..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p logs
echo "✅ Logs directory ready"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Checking .env file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f .env ]; then
  echo "✅ .env file exists"
  echo ""
  echo "Environment variables (without values):"
  grep -v '^#' .env | grep '=' | cut -d'=' -f1 | head -10
else
  echo "❌ WARNING: .env file not found!"
  echo "Backend will not start without .env file"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Checking if src/server.js exists..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f src/server.js ]; then
  echo "✅ src/server.js exists"
  echo ""
  echo "First 5 lines of server.js:"
  head -5 src/server.js
else
  echo "❌ ERROR: src/server.js not found!"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Starting backend with PM2..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 start ecosystem.config.cjs

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 11: Saving PM2 configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 save

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKEND STARTED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Current PM2 Status:"
pm2 status

echo ""
echo "Waiting 10 seconds for backend to initialize..."
sleep 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Recent Logs (last 100 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs usdtrain-backend --lines 100 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing API locally..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sleep 3

if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
  echo "✅ Backend is responding!"
  curl -s http://localhost:3001/api/v1/health | head -20
else
  echo "⚠️  Backend not responding yet. Check logs above for errors."
fi

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ NUCLEAR FIX COMPLETE!                                   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🧪 Test the API from outside:"
echo "   curl https://usdtrain.ucchain.org/api/v1/health"
echo ""

echo "📊 View real-time logs:"
echo "   ssh root@147.93.110.96 'pm2 logs usdtrain-backend'"
echo ""

echo "🔍 Check status:"
echo "   ssh root@147.93.110.96 'pm2 status'"
echo ""

echo "⚠️  If still showing errors, the issue might be:"
echo "   1. Missing .env file"
echo "   2. Wrong environment variables in .env"
echo "   3. Missing dependencies (run: npm install)"
echo ""
