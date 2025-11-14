#!/bin/bash

# USDT Rain Backend - Deployment Package Creator
# This script creates a clean deployment package ready for cPanel VPS

echo "🎁 Creating deployment package for USDT Rain Backend..."

# Create deployment directory
DEPLOY_DIR="usdtrain-backend-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files
echo "📦 Copying files..."
cp -r src $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp .env.example $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/
cp CPANEL_DEPLOYMENT_GUIDE.md $DEPLOY_DIR/
cp ARCHITECTURE.md $DEPLOY_DIR/
cp SETUP_GUIDE.md $DEPLOY_DIR/
cp .gitignore $DEPLOY_DIR/

# Create logs directory
mkdir -p $DEPLOY_DIR/logs

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOY.txt << 'EOF'
USDT RAIN BACKEND - DEPLOYMENT PACKAGE
======================================

This package contains everything needed to deploy the backend to your cPanel VPS.

QUICK START:
1. Upload this entire folder to your server: /home/username/usdtrain-backend/
2. SSH into your server
3. cd /home/username/usdtrain-backend/
4. cp .env.example .env
5. nano .env (configure your settings)
6. npm install --production
7. npm test
8. pm2 start src/server.js --name usdtrain-backend
9. pm2 save

DETAILED INSTRUCTIONS:
See CPANEL_DEPLOYMENT_GUIDE.md for complete step-by-step instructions.

SUPPORT:
- README.md - API documentation
- ARCHITECTURE.md - Technical details
- SETUP_GUIDE.md - Troubleshooting

EOF

# Create archive
echo "🗜️  Creating archive..."
tar -czf usdtrain-backend-deploy.tar.gz $DEPLOY_DIR

# Create zip for Windows users
if command -v zip &> /dev/null; then
    zip -r usdtrain-backend-deploy.zip $DEPLOY_DIR
    echo "✅ Created: usdtrain-backend-deploy.zip"
fi

echo "✅ Created: usdtrain-backend-deploy.tar.gz"
echo ""
echo "📦 Deployment package ready!"
echo ""
echo "Next steps:"
echo "1. Upload usdtrain-backend-deploy.tar.gz to your server"
echo "2. Extract: tar -xzf usdtrain-backend-deploy.tar.gz"
echo "3. Follow instructions in CPANEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "Package contents:"
ls -lh usdtrain-backend-deploy.tar.gz
echo ""
