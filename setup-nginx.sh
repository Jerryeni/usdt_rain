#!/bin/bash

# Setup Nginx to proxy requests to backend

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🌐 SETUP NGINX FOR BACKEND                                 ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "This will configure Nginx to forward /api/ requests to your backend."
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
echo "Step 1: Testing backend locally..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
  echo "✅ Backend is responding on port 3001"
  echo ""
  echo "Response:"
  curl -s http://localhost:3001/api/v1/health
else
  echo "❌ Backend is NOT responding on port 3001"
  echo "   Please make sure backend is running first"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Checking if Nginx is installed..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v nginx &> /dev/null; then
  echo "✅ Nginx is installed"
  nginx -v
else
  echo "⚠️  Nginx not found. Installing..."
  apt-get update
  apt-get install -y nginx
  echo "✅ Nginx installed"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Checking current Nginx configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Existing sites:"
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "No sites found"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Backing up existing configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backup existing config if it exists
if [ -f /etc/nginx/sites-available/usdtrain ]; then
  cp /etc/nginx/sites-available/usdtrain /etc/nginx/sites-available/usdtrain.backup.$(date +%s)
  echo "✅ Existing config backed up"
else
  echo "ℹ️  No existing config to backup"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Creating Nginx configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > /etc/nginx/sites-available/usdtrain << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name usdtrain.ucchain.org;

    # Increase timeouts for backend
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers (if needed)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }

    # Root endpoint for testing
    location = / {
        return 200 'USDT Rain Backend - API available at /api/v1/';
        add_header Content-Type text/plain;
    }

    # Health check
    location = /health {
        proxy_pass http://localhost:3001/api/v1/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

echo "✅ Nginx config created"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Enabling the site..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove old symlink if exists
rm -f /etc/nginx/sites-enabled/usdtrain

# Create new symlink
ln -s /etc/nginx/sites-available/usdtrain /etc/nginx/sites-enabled/

echo "✅ Site enabled"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Testing Nginx configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

nginx -t

if [ $? -eq 0 ]; then
  echo "✅ Nginx configuration is valid"
else
  echo "❌ Nginx configuration has errors"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Reloading Nginx..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

systemctl reload nginx

if [ $? -eq 0 ]; then
  echo "✅ Nginx reloaded successfully"
else
  echo "⚠️  Trying to restart Nginx..."
  systemctl restart nginx
  echo "✅ Nginx restarted"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Checking Nginx status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

systemctl status nginx --no-pager | head -20

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Testing the API through Nginx..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sleep 2

echo "Testing: http://localhost/api/v1/health"
curl -s http://localhost/api/v1/health || echo "⚠️  Not responding yet"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NGINX CONFIGURATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ NGINX SETUP COMPLETE!                                   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🧪 Test the API now:"
echo ""
echo "   curl http://usdtrain.ucchain.org/api/v1/health"
echo ""
echo "   Or in browser:"
echo "   http://usdtrain.ucchain.org/api/v1/health"
echo ""

echo "📋 If you have SSL/HTTPS:"
echo "   curl https://usdtrain.ucchain.org/api/v1/health"
echo ""

echo "🔍 Check Nginx logs if issues:"
echo "   ssh root@147.93.110.96 'tail -f /var/log/nginx/error.log'"
echo ""

echo "📊 Check Nginx status:"
echo "   ssh root@147.93.110.96 'systemctl status nginx'"
echo ""
