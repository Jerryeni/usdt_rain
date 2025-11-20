#!/bin/bash

# Upload .env file to VPS
# This will upload your backend .env file to the VPS

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   📤 Upload .env File to VPS                                 ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if local .env exists
if [ ! -f backend/.env ]; then
  echo "❌ ERROR: backend/.env file not found locally!"
  echo ""
  echo "Please create backend/.env file first with your production settings."
  echo "You can copy from backend/.env.production.example"
  exit 1
fi

echo "📋 Current .env file content (local):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat backend/.env
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⚠️  IMPORTANT: This will upload your .env file to:"
echo "   /var/www/usdtrain-backend/backend/.env"
echo ""
echo "⚠️  WARNING: This file contains sensitive information!"
echo "   - Private keys"
echo "   - API credentials"
echo ""

read -p "Do you want to upload this .env file? (type 'yes' to continue): " -r
echo

if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Aborted by user."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Uploading .env file to VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Upload .env file
scp backend/.env root@147.93.110.96:/var/www/usdtrain-backend/backend/.env

if [ $? -eq 0 ]; then
  echo "✅ .env file uploaded successfully!"
else
  echo "❌ Failed to upload .env file"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Setting secure permissions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh root@147.93.110.96 << 'ENDSSH'

cd /var/www/usdtrain-backend/backend

# Set secure permissions (only owner can read/write)
chmod 600 .env

echo "✅ Permissions set to 600 (owner read/write only)"

echo ""
echo "Verifying .env file on VPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -la .env
echo ""
echo "Environment variables (keys only, no values):"
grep -v '^#' .env | grep '=' | cut -d'=' -f1

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ .env FILE UPLOADED SUCCESSFULLY!                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. Restart the backend:"
echo "   ssh root@147.93.110.96 'cd /var/www/usdtrain-backend/backend && pm2 restart usdtrain-backend'"
echo ""
echo "2. Or run the nuclear fix again:"
echo "   ./nuclear-fix.sh"
echo ""
echo "3. Check logs:"
echo "   ssh root@147.93.110.96 'pm2 logs usdtrain-backend'"
echo ""
