#!/bin/bash

# Use airdrop.ucchain.org for backend API

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🔄 USE airdrop.ucchain.org FOR BACKEND                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "This will add /api/ routes to airdrop.ucchain.org"
echo "Your existing site will still work on other paths"
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
echo "Step 1: Finding airdrop.ucchain.org config..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find the config file
CONFIG_FILE=$(grep -rl "airdrop.ucchain.org" /etc/nginx/sites-available/ /etc/apache2/sites-available/ 2>/dev/null | head -1)

if [ -z "$CONFIG_FILE" ]; then
  echo "❌ Could not find airdrop.ucchain.org config"
  echo "   Available configs:"
  ls -la /etc/nginx/sites-available/ 2>/dev/null || ls -la /etc/apache2/sites-available/ 2>/dev/null
  exit 1
fi

echo "✅ Found config: $CONFIG_FILE"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Backing up existing config..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%s)"
echo "✅ Backup created"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Checking if it's Nginx or Apache..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if echo "$CONFIG_FILE" | grep -q "nginx"; then
  echo "✅ Using Nginx"
  
  # Check if /api/ location already exists
  if grep -q "location /api/" "$CONFIG_FILE"; then
    echo "⚠️  /api/ location already exists in config"
    echo "   Skipping modification"
  else
    echo "Adding /api/ location to Nginx config..."
    
    # Add the location block before the last closing brace
    sed -i '/^}$/i \
    # Backend API\
    location /api/ {\
        proxy_pass http://127.0.0.1:3001;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        add_header Access-Control-Allow-Origin * always;\
    }\
' "$CONFIG_FILE"
    
    echo "✅ Added /api/ location"
  fi
  
  # Test and reload
  nginx -t && systemctl reload nginx
  echo "✅ Nginx reloaded"
  
elif echo "$CONFIG_FILE" | grep -q "apache"; then
  echo "✅ Using Apache"
  
  # Check if ProxyPass already exists
  if grep -q "ProxyPass /api/" "$CONFIG_FILE"; then
    echo "⚠️  /api/ proxy already exists in config"
    echo "   Skipping modification"
  else
    echo "Adding /api/ proxy to Apache config..."
    
    # Add ProxyPass before </VirtualHost>
    sed -i '/<\/VirtualHost>/i \
    # Backend API\
    ProxyPass /api/ http://127.0.0.1:3001/api/\
    ProxyPassReverse /api/ http://127.0.0.1:3001/api/\
    Header always set Access-Control-Allow-Origin "*"\
' "$CONFIG_FILE"
    
    echo "✅ Added /api/ proxy"
  fi
  
  # Enable modules if needed
  a2enmod proxy 2>/dev/null || true
  a2enmod proxy_http 2>/dev/null || true
  a2enmod headers 2>/dev/null || true
  
  # Test and reload
  apachectl configtest && (systemctl reload apache2 2>/dev/null || systemctl reload httpd 2>/dev/null)
  echo "✅ Apache reloaded"
  
else
  echo "❌ Unknown web server type"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Testing API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sleep 2

curl -s -H "Host: airdrop.ucchain.org" http://localhost/api/v1/health && echo "" || echo "⚠️  Not responding yet"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ BACKEND ADDED TO airdrop.ucchain.org!                   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🧪 Test the API now:"
echo ""
echo "   curl http://airdrop.ucchain.org/api/v1/health"
echo ""
echo "   Or in browser:"
echo "   http://airdrop.ucchain.org/api/v1/health"
echo ""

echo "📋 Your frontend should use:"
echo "   NEXT_PUBLIC_BACKEND_URL=https://airdrop.ucchain.org/api/v1"
echo ""
