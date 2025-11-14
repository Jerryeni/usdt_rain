#!/bin/bash

# USDT Rain Backend - Safe Start Script
# This script handles common startup issues automatically

set -e

echo "🚀 Starting USDT Rain Backend..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  IMPORTANT: Edit .env and add your MANAGER_PRIVATE_KEY"
        echo "   Run: nano .env"
        exit 1
    else
        echo "❌ Error: .env.example not found!"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install --production
    echo "✅ Dependencies installed"
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required (current: $(node --version))"
    echo "   Install Node.js 18: curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ Error: PM2 not installed"
    echo "   Install PM2: npm install -g pm2"
    exit 1
fi

# Stop existing instance if running
if pm2 list | grep -q "usdtrain-backend"; then
    echo "🛑 Stopping existing instance..."
    pm2 delete usdtrain-backend 2>/dev/null || true
fi

# Kill any process on port 3001
PORT=$(grep "^PORT=" .env | cut -d'=' -f2 || echo "3001")
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is in use, killing process..."
    kill -9 $(lsof -t -i:$PORT) 2>/dev/null || true
    sleep 1
fi

# Test configuration
echo "🧪 Testing configuration..."
if ! npm test; then
    echo "❌ Configuration test failed!"
    echo "   Check your .env file settings"
    exit 1
fi

# Start with PM2
echo "🚀 Starting backend with PM2..."
pm2 start src/server.js --name usdtrain-backend

# Save PM2 process list
pm2 save

# Wait for startup
sleep 2

# Check if running
if pm2 list | grep -q "usdtrain-backend.*online"; then
    echo ""
    echo "✅ Backend started successfully!"
    echo ""
    echo "📊 Status:"
    pm2 status usdtrain-backend
    echo ""
    echo "📝 View logs:"
    echo "   pm2 logs usdtrain-backend"
    echo ""
    echo "🔍 Test API:"
    echo "   curl http://localhost:$PORT/api/v1/health"
    echo ""
else
    echo "❌ Failed to start backend"
    echo "📝 Check logs:"
    pm2 logs usdtrain-backend --lines 50
    exit 1
fi
