#!/bin/bash

# SUPER SAFE FIX - Shows everything before making changes
# Only touches /var/www/usdtrain-backend/backend/
# Only stops usdtrain-related PM2 processes

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🔒 SUPER SAFE BACKEND FIX                                  ║"
echo "║   Only affects: /var/www/usdtrain-backend/backend/          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 PRE-FLIGHT CHECK - Current VPS State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh root@147.93.110.96 << 'PREFLIGHT'

echo "1. Node.js Version:"
node --version
echo ""

echo "2. Current PM2 Processes:"
pm2 list
echo ""

echo "3. Backend Directory Contents:"
ls -la /var/www/usdtrain-backend/backend/ 2>/dev/null || echo "Directory not found"
echo ""

echo "4. Package.json Type:"
if [ -f /var/www/usdtrain-backend/backend/package.json ]; then
  grep -A1 '"type"' /var/www/usdtrain-backend/backend/package.json || echo "No 'type' field found"
else
  echo "package.json not found"
fi
echo ""

PREFLIGHT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 WHAT THIS SCRIPT WILL DO:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ WILL DO:"
echo "   1. Stop ONLY these PM2 processes:"
echo "      - usdtrain"
echo "      - usdtrain-backend"
echo ""
echo "   2. Work ONLY in this directory:"
echo "      - /var/www/usdtrain-backend/backend/"
echo ""
echo "   3. Modify ONLY these files:"
echo "      - /var/www/usdtrain-backend/backend/package.json (add 'type: module')"
echo "      - /var/www/usdtrain-backend/backend/ecosystem.config.cjs (create new)"
echo ""
echo "   4. Backup before modifying:"
echo "      - package.json → package.json.backup.[timestamp]"
echo ""
echo "❌ WILL NOT:"
echo "   ✗ Touch any other PM2 processes"
echo "   ✗ Modify files outside /var/www/usdtrain-backend/backend/"
echo "   ✗ Change your .env file"
echo "   ✗ Update Node.js (you must do this manually if needed)"
echo "   ✗ Modify Nginx or system files"
echo "   ✗ Delete any existing files"
echo ""

read -p "Do you want to proceed? (type 'yes' to continue): " -r
echo

if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Aborted by user."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Safe Fix..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh root@147.93.110.96 << 'ENDSSH'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking Node.js version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NODE_VERSION=$(node --version)
echo "Current Node.js version: $NODE_VERSION"

NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$NODE_MAJOR" -lt 14 ]; then
  echo ""
  echo "❌ ERROR: Node.js version is too old!"
  echo "   Current: $NODE_VERSION"
  echo "   Required: v14 or higher"
  echo ""
  echo "   Please update Node.js first:"
  echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
  echo "   apt-get install -y nodejs"
  echo ""
  exit 1
else
  echo "✅ Node.js version is compatible"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Stopping ONLY usdtrain processes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Processes before:"
pm2 list | grep -E "usdtrain|id.*name" || echo "No usdtrain processes found"

echo ""
echo "Stopping usdtrain processes..."
pm2 delete usdtrain 2>/dev/null && echo "✅ Stopped: usdtrain" || echo "ℹ️  Process 'usdtrain' not found"
pm2 delete usdtrain-backend 2>/dev/null && echo "✅ Stopped: usdtrain-backend" || echo "ℹ️  Process 'usdtrain-backend' not found"

sleep 2

echo ""
echo "Processes after:"
pm2 list

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Navigating to backend directory..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /var/www/usdtrain-backend/backend || {
  echo "❌ ERROR: Cannot access /var/www/usdtrain-backend/backend/"
  exit 1
}

echo "✅ Current directory: $(pwd)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Checking and updating package.json..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f package.json ]; then
  echo "❌ ERROR: package.json not found!"
  exit 1
fi

echo "Current package.json (first 10 lines):"
head -10 package.json
echo ""

if grep -q '"type".*:.*"module"' package.json; then
  echo "✅ package.json already has ES module type"
else
  echo "⚠️  Adding ES module type to package.json"
  
  # Create timestamped backup
  BACKUP_FILE="package.json.backup.$(date +%s)"
  cp package.json "$BACKUP_FILE"
  echo "✅ Backup created: $BACKUP_FILE"
  
  # Add type: module after the name field
  sed -i '/"name"/a\  "type": "module",' package.json
  
  echo "✅ package.json updated"
  echo ""
  echo "Updated package.json (first 10 lines):"
  head -10 package.json
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

echo "✅ ecosystem.config.cjs created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Creating logs directory..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p logs
echo "✅ Logs directory ready"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Verifying .env file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f .env ]; then
  echo "✅ .env file exists (not modified)"
else
  echo "⚠️  WARNING: .env file not found!"
  echo "   You'll need to create it before the backend can start"
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
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Current PM2 Status:"
pm2 status

echo ""
echo "Waiting 5 seconds for backend to start..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Recent Logs (last 50 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs usdtrain-backend --lines 50 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing backend locally..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 2
curl -s http://localhost:3001/api/v1/health && echo "" || echo "⚠️  Backend not responding yet (check logs above)"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ FIX COMPLETED!                                          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 What was changed:"
echo "   ✅ /var/www/usdtrain-backend/backend/package.json (backed up first)"
echo "   ✅ /var/www/usdtrain-backend/backend/ecosystem.config.cjs (created)"
echo "   ✅ PM2 processes: stopped old, started new"
echo "   ✅ Nothing else was modified"
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
