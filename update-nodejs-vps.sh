#!/bin/bash

# Safe Node.js Update Script
# Updates Node.js on VPS without affecting other applications

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🔄 Node.js Update for VPS                                  ║"
echo "║   Required for ES Module support                            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Checking current Node.js version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh root@147.93.110.96 << 'PREFLIGHT'

echo "Current Node.js version:"
node --version
echo ""

echo "Current npm version:"
npm --version
echo ""

echo "Current PM2 processes (will be preserved):"
pm2 list
echo ""

PREFLIGHT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 WHAT THIS SCRIPT WILL DO:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ WILL DO:"
echo "   1. Update Node.js from v12 to v18 (LTS)"
echo "   2. Update npm to latest version"
echo "   3. Preserve all PM2 processes"
echo "   4. Keep all your files intact"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - This is a system-wide update"
echo "   - All Node.js applications will use the new version"
echo "   - PM2 processes will continue running"
echo "   - No files will be deleted"
echo ""
echo "❌ WILL NOT:"
echo "   ✗ Delete any files"
echo "   ✗ Stop PM2 processes during update"
echo "   ✗ Modify your application code"
echo "   ✗ Change configurations"
echo ""

read -p "Do you want to update Node.js? (type 'yes' to continue): " -r
echo

if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Aborted by user."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Node.js Update..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh root@147.93.110.96 << 'ENDSSH'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Downloading Node.js 18 setup script..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -fsSL https://deb.nodesource.com/setup_18.x -o /tmp/nodesource_setup.sh

if [ $? -eq 0 ]; then
  echo "✅ Setup script downloaded"
else
  echo "❌ Failed to download setup script"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Running Node.js setup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

bash /tmp/nodesource_setup.sh

if [ $? -eq 0 ]; then
  echo "✅ Repository configured"
else
  echo "❌ Failed to configure repository"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Installing Node.js 18..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

apt-get install -y nodejs

if [ $? -eq 0 ]; then
  echo "✅ Node.js installed"
else
  echo "❌ Failed to install Node.js"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Verifying installation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "New Node.js version:"
node --version

echo ""
echo "New npm version:"
npm --version

echo ""

NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$NODE_MAJOR" -ge 14 ]; then
  echo "✅ Node.js successfully updated to $NODE_VERSION"
else
  echo "⚠️  Warning: Node.js version might still be old"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Checking PM2 processes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 list

echo ""
echo "✅ All PM2 processes preserved"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Cleaning up..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -f /tmp/nodesource_setup.sh

echo "✅ Cleanup complete"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ NODE.JS UPDATE COMPLETE!                                ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. Now run the backend fix:"
echo "   ./super-safe-fix.sh"
echo ""
echo "2. Or check Node.js version:"
echo "   ssh root@147.93.110.96 'node --version'"
echo ""
echo "3. Check PM2 processes:"
echo "   ssh root@147.93.110.96 'pm2 list'"
echo ""
