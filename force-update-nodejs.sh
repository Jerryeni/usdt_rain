#!/bin/bash

# Force Update Node.js - Properly update to v18

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🔄 FORCE UPDATE NODE.JS TO V18                             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "This will update Node.js from v12 to v18 on your VPS."
echo ""

read -p "Do you want to proceed? (type 'yes' to continue): " -r
echo

if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Aborted by user."
    exit 1
fi

echo ""

ssh root@147.93.110.96 << 'ENDSSH'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Current Node.js version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Current Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo "Current npm: $(npm --version 2>/dev/null || echo 'Not found')"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Removing old Node.js..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove old nodejs packages
apt-get remove -y nodejs npm 2>/dev/null || true
apt-get purge -y nodejs npm 2>/dev/null || true
apt-get autoremove -y

echo "✅ Old Node.js removed"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Updating system packages..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

apt-get update

echo "✅ System packages updated"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Installing required dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https

echo "✅ Dependencies installed"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Adding NodeSource repository for Node.js 18..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Download and run NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

if [ $? -eq 0 ]; then
  echo "✅ NodeSource repository added"
else
  echo "❌ Failed to add NodeSource repository"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Installing Node.js 18..."
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
echo "Step 7: Verifying installation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "New Node.js version: $(node --version)"
echo "New npm version: $(npm --version)"

NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$NODE_MAJOR" -ge 18 ]; then
  echo ""
  echo "✅ SUCCESS! Node.js updated to $NODE_VERSION"
elif [ "$NODE_MAJOR" -ge 14 ]; then
  echo ""
  echo "✅ Node.js updated to $NODE_VERSION (minimum requirement met)"
else
  echo ""
  echo "❌ ERROR: Node.js is still version $NODE_VERSION"
  echo "   Something went wrong with the update"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Checking which node binary is being used..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

which node
which npm

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Updating npm to latest version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm install -g npm@latest

echo "✅ npm updated to: $(npm --version)"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Updating PM2 to work with new Node.js..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm install -g pm2@latest

echo "✅ PM2 updated"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NODE.JS UPDATE COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Summary:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  PM2: $(pm2 --version)"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ NODE.JS SUCCESSFULLY UPDATED!                           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. Kill zombie processes and start backend:"
echo "   ./kill-zombie-process.sh"
echo ""
echo "2. Or verify Node.js version:"
echo "   ssh root@147.93.110.96 'node --version'"
echo ""
