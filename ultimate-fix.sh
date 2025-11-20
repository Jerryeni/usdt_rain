#!/bin/bash

# Ultimate fix - Handles Node.js version and PM2 issues
# This will completely clean up and restart properly

echo "🔧 Ultimate Backend Fix - Starting..."
echo ""

ssh root@147.93.110.96 << 'ENDSSH'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking Node.js version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NODE_VERSION=$(node --version)
echo "Current Node.js version: $NODE_VERSION"

# Extract major version number
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$NODE_MAJOR" -lt 14 ]; then
  echo "⚠️  Node.js version is too old (need v14+)"
  echo ""
  echo "❌ ERROR: Node.js needs to be updated manually"
  echo "   Current version: $NODE_VERSION"
  echo "   Required: v14 or higher"
  echo ""
  echo "   To update Node.js, run these commands manually:"
  echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
  echo "   apt-get install -y nodejs"
  echo ""
  exit 1
else
  echo "✅ Node.js version is compatible ($NODE_VERSION)"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Stopping ONLY usdtrain-related processes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Current PM2 processes:"
pm2 list

echo ""
echo "Stopping only usdtrain processes (NOT affecting other apps)..."

# Delete only usdtrain-related processes
pm2 delete usdtrain 2>/dev/null || true
pm2 delete usdtrain-backend 2>/dev/null || true

# Wait a moment
sleep 2

echo "✅ Only usdtrain processes stopped (other apps untouched)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Navigating to backend directory..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /var/www/usdtrain-backend/backend
echo "Current directory: $(pwd)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Verifying package.json..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f package.json ]; then
  echo "✅ package.json exists"
  
  # Check for "type": "module"
  if grep -q '"type".*:.*"module"' package.json; then
    echo "✅ package.json has ES module type"
  else
    echo "⚠️  Adding ES module type to package.json"
    # Create a backup
    cp package.json package.json.backup.$(date +%s)
    
    # Add type: module using sed
    if grep -q '"main"' package.json; then
      sed -i '/"main"/a\  "type": "module",' package.json
    else
      sed -i '/"name"/a\  "type": "module",' package.json
    fi
    
    echo "✅ package.json updated"
  fi
  
  echo ""
  echo "Current package.json (first 15 lines):"
  head -15 package.json
else
  echo "❌ package.json not found!"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Creating PM2 ecosystem config..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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
    merge_logs: true,
    exp_backoff_restart_delay: 100
  }]
};
EOF

echo "✅ Ecosystem config created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Creating logs directory..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p logs
echo "✅ Logs directory ready"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Checking .env file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f .env ]; then
  echo "✅ .env file exists"
else
  echo "⚠️  .env file not found! You'll need to create it."
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Starting backend with PM2..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 start ecosystem.config.cjs

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Saving PM2 configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Setting up PM2 startup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current PM2 Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Waiting 5 seconds for backend to start..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Recent Logs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs usdtrain-backend --lines 50 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing backend locally..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 2
curl -s http://localhost:3001/api/v1/health || echo "⚠️  Backend not responding yet"

ENDSSH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fix completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
echo "⚠️  If still having issues, check:"
echo "   ssh root@147.93.110.96 'cd /var/www/usdtrain-backend/backend && cat package.json | grep type'"
echo ""
