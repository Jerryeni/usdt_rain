#!/bin/bash

# Diagnose Nginx and domain routing issues

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🔍 DIAGNOSE NGINX & DOMAIN ROUTING                         ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

ssh root@147.93.110.96 << 'ENDSSH'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Testing backend directly on port 3001..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Backend not responding"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Checking what's listening on port 80..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

netstat -tulpn | grep :80 || ss -tulpn | grep :80

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Checking if cPanel/Apache is running..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if systemctl is-active --quiet httpd; then
  echo "⚠️  Apache (httpd) is RUNNING"
  systemctl status httpd --no-pager | head -10
elif systemctl is-active --quiet apache2; then
  echo "⚠️  Apache2 is RUNNING"
  systemctl status apache2 --no-pager | head -10
else
  echo "✅ Apache is not running"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Checking Nginx status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if systemctl is-active --quiet nginx; then
  echo "✅ Nginx is RUNNING"
  systemctl status nginx --no-pager | head -10
else
  echo "❌ Nginx is NOT running"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Checking Nginx configurations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Sites available:"
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "No sites-available directory"

echo ""
echo "Sites enabled:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled directory"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Checking for usdtrain.ucchain.org in configs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f /etc/nginx/sites-available/usdtrain.ucchain.org ]; then
  echo "✅ Config file exists"
  echo ""
  echo "Content:"
  cat /etc/nginx/sites-available/usdtrain.ucchain.org
else
  echo "❌ Config file NOT found"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Testing Nginx with Host header..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -H "Host: usdtrain.ucchain.org" http://localhost/api/v1/health && echo "" || echo "❌ Not working through Nginx"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. Checking DNS resolution..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "DNS for usdtrain.ucchain.org:"
nslookup usdtrain.ucchain.org 2>/dev/null || dig usdtrain.ucchain.org +short

echo ""
echo "This server's IP:"
hostname -I

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. Checking Nginx error logs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f /var/log/nginx/error.log ]; then
  echo "Last 20 lines of error log:"
  tail -20 /var/log/nginx/error.log
else
  echo "No error log found"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10. Checking if cPanel is managing this domain..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d /var/cpanel ]; then
  echo "⚠️  cPanel IS installed on this server"
  echo ""
  echo "Checking Apache vhosts:"
  if [ -f /etc/apache2/conf.d/includes/pre_virtualhost_global.conf ]; then
    grep -r "usdtrain.ucchain.org" /etc/apache2/ 2>/dev/null | head -5
  elif [ -f /usr/local/apache/conf/httpd.conf ]; then
    grep -r "usdtrain.ucchain.org" /usr/local/apache/ 2>/dev/null | head -5
  fi
else
  echo "✅ cPanel is NOT installed"
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "11. Testing what responds on port 80..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Response from localhost:80 with usdtrain.ucchain.org host:"
curl -s -H "Host: usdtrain.ucchain.org" http://localhost/ | head -20

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DIAGNOSIS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENDSSH

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   📊 DIAGNOSIS RESULTS ABOVE                                 ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "Based on the results, the issue is likely:"
echo ""
echo "1. ⚠️  If Apache/cPanel is running on port 80:"
echo "   → Apache is intercepting requests before Nginx"
echo "   → Need to configure Apache to proxy to backend"
echo "   → Or stop Apache and use Nginx only"
echo ""
echo "2. ⚠️  If DNS doesn't point to 147.93.110.96:"
echo "   → Update DNS A record for usdtrain.ucchain.org"
echo ""
echo "3. ⚠️  If Nginx config exists but not working:"
echo "   → Nginx might not be on port 80"
echo "   → Apache might be blocking it"
echo ""
