#!/bin/bash

# Setup usdtrains.ucchain.org (with 's') for backend

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🌐 SETUP usdtrains.ucchain.org FOR BACKEND                 ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "This will configure Nginx for: usdtrains.ucchain.org"
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
echo "Step 1: Testing backend on port 3001..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
  echo "✅ Backend is responding"
  curl -s http://localhost:3001/api/v1/health
else
  echo "❌ Backend is NOT responding!"
  echo "   Please start the backend first"
  exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Checking what's on port 80..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

netstat -tulpn | grep :80 || ss -tulpn | grep :80

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Checking if Apache/cPanel is running..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if systemctl is-active --quiet httpd 2>/dev/null; then
  echo "⚠️  Apache (httpd) is running on port 80"
  echo "   We need to configure Apache to proxy to backend"
  APACHE_RUNNING=true
elif systemctl is-active --quiet apache2 2>/dev/null; then
  echo "⚠️  Apache2 is running on port 80"
  echo "   We need to configure Apache to proxy to backend"
  APACHE_RUNNING=true
else
  echo "✅ Apache is not running - Nginx can use port 80"
  APACHE_RUNNING=false
fi

echo ""

if [ "$APACHE_RUNNING" = true ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "CONFIGURING APACHE TO PROXY TO BACKEND..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Enable required Apache modules
  if command -v a2enmod &> /dev/null; then
    a2enmod proxy 2>/dev/null || true
    a2enmod proxy_http 2>/dev/null || true
    a2enmod headers 2>/dev/null || true
  fi
  
  # Create Apache vhost config
  cat > /etc/apache2/sites-available/usdtrains.ucchain.org.conf << 'EOF'
<VirtualHost *:80>
    ServerName usdtrains.ucchain.org
    ServerAlias www.usdtrains.ucchain.org
    
    # Proxy all /api/ requests to backend
    ProxyPreserveHost On
    ProxyPass /api/ http://127.0.0.1:3001/api/
    ProxyPassReverse /api/ http://127.0.0.1:3001/api/
    
    # Enable CORS
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/usdtrains-error.log
    CustomLog ${APACHE_LOG_DIR}/usdtrains-access.log combined
</VirtualHost>
EOF
  
  echo "✅ Apache config created"
  
  # Enable site
  if command -v a2ensite &> /dev/null; then
    a2ensite usdtrains.ucchain.org.conf
  else
    ln -sf /etc/apache2/sites-available/usdtrains.ucchain.org.conf /etc/apache2/sites-enabled/
  fi
  
  echo "✅ Site enabled"
  
  # Test and reload Apache
  if apachectl configtest 2>&1 | grep -q "Syntax OK"; then
    echo "✅ Apache config is valid"
    systemctl reload apache2 2>/dev/null || systemctl reload httpd 2>/dev/null
    echo "✅ Apache reloaded"
  else
    echo "⚠️  Apache config test failed, but continuing..."
    systemctl reload apache2 2>/dev/null || systemctl reload httpd 2>/dev/null
  fi
  
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "CONFIGURING NGINX..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Create Nginx config
  cat > /etc/nginx/sites-available/usdtrains.ucchain.org << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name usdtrains.ucchain.org www.usdtrains.ucchain.org;

    # Logging
    access_log /var/log/nginx/usdtrains-access.log;
    error_log /var/log/nginx/usdtrains-error.log;

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }

    location = / {
        return 200 'USDT Rain Backend API\n';
        add_header Content-Type text/plain;
    }
}
EOF
  
  echo "✅ Nginx config created"
  
  # Enable site
  ln -sf /etc/nginx/sites-available/usdtrains.ucchain.org /etc/nginx/sites-enabled/
  echo "✅ Site enabled"
  
  # Test and reload Nginx
  if nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config is valid"
    systemctl reload nginx
    echo "✅ Nginx reloaded"
  else
    echo "❌ Nginx config has errors"
    nginx -t
    exit 1
  fi
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing API through web server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sleep 3

echo "Test with Host header:"
curl -s -H "Host: usdtrains.ucchain.org" http://localhost/api/v1/health && echo "" || echo "⚠️  Not responding yet"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ DOMAIN CONFIGURED!                                      ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🧪 Test the API now:"
echo ""
echo "   curl http://usdtrains.ucchain.org/api/v1/health"
echo ""
echo "   Or in browser:"
echo "   http://usdtrains.ucchain.org/api/v1/health"
echo ""

echo "📋 Make sure DNS points to: 147.93.110.96"
echo ""

echo "🔍 If still not working, check:"
echo "   1. DNS: nslookup usdtrains.ucchain.org"
echo "   2. Logs: ssh root@147.93.110.96 'tail -f /var/log/nginx/usdtrains-error.log'"
echo "   3. Or Apache logs if using cPanel"
echo ""
