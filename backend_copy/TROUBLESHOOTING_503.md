# Fixing 503 Service Unavailable Error

## Common Causes & Solutions

### 1. Backend Not Running

**Check if PM2 process is running:**
```bash
pm2 status
```

**If not running, start it:**
```bash
cd /home/username/usdtrain-backend
pm2 start src/server.js --name usdtrain-backend
pm2 save
```

**Check logs for errors:**
```bash
pm2 logs usdtrain-backend --lines 50
```

---

### 2. Port Already in Use

**Check what's using port 3001:**
```bash
netstat -tulpn | grep 3001
# or
lsof -i :3001
```

**Kill the process:**
```bash
kill -9 $(lsof -t -i:3001)
```

**Then restart:**
```bash
pm2 restart usdtrain-backend
```

---

### 3. Missing Dependencies

**Reinstall dependencies:**
```bash
cd /home/username/usdtrain-backend
rm -rf node_modules
npm install --production
pm2 restart usdtrain-backend
```

---

### 4. .env File Issues

**Check if .env exists:**
```bash
ls -la /home/username/usdtrain-backend/.env
```

**If missing, create it:**
```bash
cp .env.example .env
nano .env
```

**Required variables:**
```env
RPC_URL=https://rpc.mainnet.ucchain.org
CHAIN_ID=1137
CONTRACT_ADDRESS=0x9b7f2CF537F81f2fCfd3252B993b7B12a47648d1
MANAGER_PRIVATE_KEY=0xYOUR_KEY_HERE
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

---

### 5. Reverse Proxy Not Configured

**Check Apache/Nginx configuration:**

For cPanel with Apache, create `.htaccess`:
```bash
cd /home/username/public_html
nano .htaccess
```

Add:
```apache
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
</IfModule>
```

**Enable proxy modules:**
```bash
# As root
a2enmod proxy
a2enmod proxy_http
systemctl restart httpd
```

---

### 6. Firewall Blocking Port

**Allow port 3001:**
```bash
# For firewalld
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload

# For iptables
iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
service iptables save
```

---

### 7. Node.js Not Installed or Wrong Version

**Check Node.js version:**
```bash
node --version  # Should be v18.x.x or higher
```

**If wrong version, install Node.js 18:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
```

---

### 8. Permission Issues

**Fix permissions:**
```bash
cd /home/username/usdtrain-backend
chmod -R 755 src/
chmod 600 .env
chown -R username:username .
```

---

### 9. Application Crashing on Start

**Check for errors:**
```bash
# Try running directly (not with PM2)
cd /home/username/usdtrain-backend
node src/server.js
```

**Common errors:**

**a) Module not found:**
```bash
npm install --production
```

**b) Port in use:**
```bash
PORT=3002 node src/server.js
```

**c) Invalid private key:**
```bash
# Check .env file
nano .env
# Ensure MANAGER_PRIVATE_KEY starts with 0x
```

---

### 10. cPanel Application Manager Issues

**If using cPanel App Manager:**

1. Login to cPanel
2. Go to: Software → Setup Node.js App
3. Check application status
4. Click "Restart" if needed
5. Check "Application URL" matches your domain

**Common cPanel issues:**
- Wrong Node.js version selected
- Wrong application root path
- Wrong startup file
- Port conflict

---

## Step-by-Step Debugging

### Step 1: Test Backend Locally

```bash
cd /home/username/usdtrain-backend
node src/server.js
```

**Expected output:**
```
🚀 USDT Rain Backend Server
📡 Server running on: http://localhost:3001
```

**If you see errors, fix them before proceeding.**

### Step 2: Test with curl

```bash
curl http://localhost:3001/api/v1/health
```

**Expected response:**
```json
{"status":"healthy","timestamp":"..."}
```

### Step 3: Start with PM2

```bash
pm2 start src/server.js --name usdtrain-backend
pm2 logs usdtrain-backend
```

### Step 4: Test from outside

```bash
curl https://usdtrain.senbags.co/api/v1/health
```

---

## Quick Fix Script

Create this script to automatically fix common issues:

```bash
nano /home/username/fix-backend.sh
```

```bash
#!/bin/bash

echo "🔧 Fixing USDT Rain Backend..."

# Navigate to backend directory
cd /home/username/usdtrain-backend || exit 1

# Stop any running instances
pm2 delete usdtrain-backend 2>/dev/null

# Kill any process on port 3001
kill -9 $(lsof -t -i:3001) 2>/dev/null

# Reinstall dependencies
echo "📦 Installing dependencies..."
npm install --production

# Check .env exists
if [ ! -f .env ]; then
    echo "❌ .env file missing! Creating from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your MANAGER_PRIVATE_KEY"
    exit 1
fi

# Test connection
echo "🧪 Testing connection..."
npm test

# Start with PM2
echo "🚀 Starting backend..."
pm2 start src/server.js --name usdtrain-backend
pm2 save

# Show status
pm2 status

# Test API
sleep 2
echo "🔍 Testing API..."
curl http://localhost:3001/api/v1/health

echo "✅ Done! Check logs with: pm2 logs usdtrain-backend"
```

```bash
chmod +x /home/username/fix-backend.sh
./fix-backend.sh
```

---

## Alternative: Use Different Port

If port 3001 is problematic, use a different port:

**Update .env:**
```env
PORT=8080
```

**Update reverse proxy:**
```apache
RewriteRule ^(.*)$ http://localhost:8080/$1 [P,L]
```

**Restart:**
```bash
pm2 restart usdtrain-backend
```

---

## Contact Support Checklist

If still not working, gather this info before contacting support:

```bash
# System info
uname -a
node --version
npm --version
pm2 --version

# Backend status
pm2 status
pm2 logs usdtrain-backend --lines 100

# Port check
netstat -tulpn | grep 3001

# Process check
ps aux | grep node

# Permissions
ls -la /home/username/usdtrain-backend/

# Test
curl http://localhost:3001/api/v1/health
```

---

## Most Common Solution

**90% of 503 errors are fixed by:**

```bash
cd /home/username/usdtrain-backend
pm2 delete usdtrain-backend
npm install --production
pm2 start src/server.js --name usdtrain-backend
pm2 save
pm2 logs usdtrain-backend
```

---

## Need Help?

1. Check PM2 logs: `pm2 logs usdtrain-backend`
2. Check application logs: `tail -f logs/error.log`
3. Test locally: `curl http://localhost:3001/api/v1/health`
4. Check firewall: `firewall-cmd --list-all`
5. Check Apache: `systemctl status httpd`
