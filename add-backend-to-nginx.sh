#!/bin/bash

# Add backend routes to existing Nginx config safely

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🔧 ADD BACKEND TO EXISTING NGINX CONFIG                    ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "This will add backend API routes to your existing Nginx setup."
echo "It will NOT affect your airdrop.ucchain.org configuration."
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
echo "Step 1: Checking existing Nginx configurations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Sites available:"
ls -la /etc/nginx/sites-available/

echo ""
echo "Sites enabled:"
ls -la /etc/nginx/sites-enabled/

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Looking for usdtrain.ucchain.org config..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if usdtrain config already exists
if grep -r "usdtrain.ucchain.org" /etc/nginx/sites-available/ 2>/dev/null; then
  echo "✅ Found existing usdtrain.ucchain.org configuration"
  echo ""
  echo "Showing the config:"
  grep -r "usdtrain.ucchain.org" /etc/nginx/sites-available/ -A 20
else
  echo "ℹ️  No existing usdtrain.ucchain.org configuration found"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Checking if there's a default or catch-all config..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for default config
if [ -f /etc/nginx/sites-available/default ]; then
  echo "Found default config. Checking if it handles usdtrain.ucchain.org..."
  grep "server_name" /etc/nginx/sites-available/default | head -5
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Creating dedicated config for usdtrain.ucchain.org..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backup if exists
if [ -f /etc/nginx/sites-available/usdtrain.ucchain.org ]; then
  cp /etc/nginx/sites-available/usdtrain.ucchain.org /etc/nginx/sites-available/usdtrain.ucchain.org.backup.$(date +%s)
  echo "✅ Backed up existing config"
fi

# Create new config specifically for usdtrain.ucchain.org
cat > /etc/nginx/sites-available/usdtrain.ucchain.org << 'EOF'
# USDT Rain Backend API Configuration
server {
    listen 80;
    listen [::]:80;
    server_name usdtrain.ucchain.org;

    # Logging
    access_log /var/log/nginx/usdtrain-access.log;
    error_log /var/log/nginx/usdtrain-error.log;

    # Increase timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Backend API - Forward all /api/ requests to port 3001
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        
        # Proxy headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        
        # Handle OPTIONS requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Root endpoint
    location = / {
        return 200 'USDT Rain Backend API\nAPI available at /api/v1/\n';
        add_header Content-Type text/plain;
    }

    # Direct health check endpoint
    location = /health {
        proxy_pass http://127.0.0.1:3001/api/v1/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

echo "✅ Configuration created for usdtrain.ucchain.org"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Enabling the site..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove old symlink if exists
rm -f /etc/nginx/sites-enabled/usdtrain.ucchain.org

# Create new symlink
ln -s /etc/nginx/sites-available/usdtrain.ucchain.org /etc/nginx/sites-enabled/

echo "✅ Site enabled"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Testing Nginx configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

nginx -t

if [ $? -eq 0 ]; then
  echo "✅ Nginx configuration is valid"
else
  echo "❌ Nginx configuration has errors!"
  echo ""
  echo "Showing error details:"
  nginx -t 2>&1
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Reloading Nginx..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

systemctl reload nginx

if [ $? -eq 0 ]; then
  echo "✅ Nginx reloaded successfully"
else
  echo "⚠️  Reload failed, trying restart..."
  systemctl restart nginx
  if [ $? -eq 0 ]; then
    echo "✅ Nginx restarted successfully"
  else
    echo "❌ Nginx restart failed!"
    systemctl status nginx --no-pager
    exit 1
  fi
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Verifying Nginx is running..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

systemctl status nginx --no-pager | head -15

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Testing backend through Nginx..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sleep 2

echo "Test 1: Direct backend (port 3001):"
curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Backend not responding"

echo ""
echo "Test 2: Through Nginx (port 80):"
curl -s -H "Host: usdtrain.ucchain.org" http://localhost/api/v1/health && echo "" || echo "❌ Nginx not forwarding"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Checking all active server blocks..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Active configurations:"
for conf in /etc/nginx/sites-enabled/*; do
  echo ""
  echo "File: $conf"
  grep "server_name" "$conf" | head -3
done

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NGINX CONFIGURATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ BACKEND ADDED TO NGINX!                                 ║"
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

echo "📋 Your configurations:"
echo "   ✅ airdrop.ucchain.org - Still working (untouched)"
echo "   ✅ usdtrain.ucchain.org - Now configured for backend API"
echo ""

echo "🔍 If still showing 404, check:"
echo "   1. DNS points to this VPS: 147.93.110.96"
echo "   2. Nginx logs: ssh root@147.93.110.96 'tail -f /var/log/nginx/usdtrain-error.log'"
echo ""
