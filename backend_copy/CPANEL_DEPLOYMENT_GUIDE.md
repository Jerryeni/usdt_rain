# cPanel VPS Deployment Guide for USDT Rain Backend

Complete step-by-step guide to deploy the Node.js backend on a cPanel VPS server.

## Prerequisites

- cPanel VPS server with root/SSH access
- Node.js 18+ installed on server
- Domain or subdomain for the backend (e.g., api.yourdomain.com)
- Manager wallet private key
- UCH tokens in manager wallet for gas fees

---

## Part 1: Server Preparation

### Step 1: Connect to Your VPS via SSH

```bash
ssh root@your-server-ip
# Or
ssh username@your-server-ip
```

### Step 2: Install Node.js (if not installed)

```bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Step 3: Install PM2 (Process Manager)

```bash
npm install -g pm2

# Verify installation
pm2 --version
```

### Step 4: Create Application Directory

```bash
# Navigate to your web root (adjust path as needed)
cd /home/username/

# Create backend directory
mkdir -p usdtrain-backend
cd usdtrain-backend
```

---

## Part 2: Upload Backend Files

### Option A: Using Git (Recommended)

```bash
# Clone your repository
git clone https://github.com/yourusername/usdtrain.git temp
mv temp/backend/* .
rm -rf temp

# Or if backend is in a separate repo
git clone https://github.com/yourusername/usdtrain-backend.git .
```

### Option B: Using FTP/SFTP

1. Open FileZilla or your FTP client
2. Connect to your server
3. Navigate to `/home/username/usdtrain-backend/`
4. Upload all files from your local `backend/` directory:
   - `src/` folder
   - `package.json`
   - `package-lock.json`
   - `.env.example`
   - All documentation files

### Option C: Using SCP (from your local machine)

```bash
# From your local project directory
scp -r backend/* username@your-server-ip:/home/username/usdtrain-backend/
```

---

## Part 3: Configure Backend

### Step 1: Install Dependencies

```bash
cd /home/username/usdtrain-backend
npm install --production
```

### Step 2: Create Production .env File

```bash
nano .env
```

Add the following configuration:

```env
# UCChain Network
RPC_URL=https://rpc.mainnet.ucchain.org
CHAIN_ID=1137
NETWORK_NAME=ucchain-mainnet

# Contract Configuration
CONTRACT_ADDRESS=0x9b7f2CF537F81f2fCfd3252B993b7B12a47648d1
USDT_CONTRACT_ADDRESS=0x45643aB553621e611984Ff34633adf8E18dA2d55

# Manager Wallet (CRITICAL - Keep Secret!)
MANAGER_PRIVATE_KEY=0xYOUR_ACTUAL_MANAGER_PRIVATE_KEY_HERE

# Server Configuration
PORT=3001
NODE_ENV=production

# API Configuration
API_PREFIX=/api/v1
CORS_ORIGIN=https://your-frontend-domain.com

# Security (REQUIRED for production)
API_KEY=generate-a-strong-random-key-here

# Eligibility Requirements
MIN_REFERRALS_FOR_ELIGIBILITY=10

# Logging
LOG_LEVEL=info
```

**Generate a strong API key:**
```bash
openssl rand -hex 32
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Set Proper Permissions

```bash
chmod 600 .env
chmod -R 755 src/
```

### Step 4: Test the Backend

```bash
npm test
```

Expected output:
```
✅ Connected to ucchain-mainnet
✅ Manager wallet loaded
✅ Contract accessible
✅ Manager permissions verified
```

---

## Part 4: Start Backend with PM2

### Step 1: Start the Application

```bash
pm2 start src/server.js --name usdtrain-backend
```

### Step 2: Configure PM2 Auto-Start

```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions provided by PM2
# It will give you a command to run, something like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username
```

### Step 3: Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs usdtrain-backend

# Test the API
curl http://localhost:3001/api/v1/health
```

Expected response:
```json
{"status":"healthy","timestamp":"...","version":"1.0.0"}
```

---

## Part 5: Configure Reverse Proxy in cPanel

### Option A: Using cPanel Application Manager (Recommended)

1. **Login to cPanel**
2. **Navigate to:** Software → Application Manager (or Setup Node.js App)
3. **Click:** Create Application
4. **Configure:**
   - Node.js version: 18.x
   - Application mode: Production
   - Application root: `/home/username/usdtrain-backend`
   - Application URL: `api.yourdomain.com` or `/api`
   - Application startup file: `src/server.js`
   - Port: 3001

5. **Click:** Create

### Option B: Manual Apache Configuration

1. **Create .htaccess file:**

```bash
cd /home/username/public_html/api
nano .htaccess
```

2. **Add proxy rules:**

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

3. **Enable required Apache modules:**

```bash
# As root
a2enmod proxy
a2enmod proxy_http
systemctl restart httpd
```

---

## Part 6: Configure SSL Certificate

### Using cPanel AutoSSL (Free)

1. **Login to cPanel**
2. **Navigate to:** Security → SSL/TLS Status
3. **Select:** Your domain (api.yourdomain.com)
4. **Click:** Run AutoSSL

### Using Let's Encrypt (Manual)

```bash
# Install certbot
yum install certbot python3-certbot-apache

# Get certificate
certbot --apache -d api.yourdomain.com

# Auto-renewal is configured automatically
```

---

## Part 7: Configure Firewall

### Allow Backend Port

```bash
# For firewalld
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload

# For iptables
iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
service iptables save
```

---

## Part 8: Update Frontend Configuration

### Update Frontend .env.production

```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_BACKEND_API_KEY=your-production-api-key
```

### Rebuild and Deploy Frontend

```bash
npm run build
# Deploy to your hosting
```

---

## Part 9: Monitoring & Maintenance

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs usdtrain-backend
pm2 logs usdtrain-backend --lines 100

# Restart
pm2 restart usdtrain-backend

# Stop
pm2 stop usdtrain-backend

# Delete
pm2 delete usdtrain-backend

# Monitor
pm2 monit
```

### Check Backend Health

```bash
# From server
curl http://localhost:3001/api/v1/health

# From outside
curl https://api.yourdomain.com/api/v1/health
```

### View Application Logs

```bash
# PM2 logs
pm2 logs usdtrain-backend

# Application logs
tail -f /home/username/usdtrain-backend/logs/combined.log
tail -f /home/username/usdtrain-backend/logs/error.log
```

---

## Part 10: Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs usdtrain-backend --lines 50

# Check if port is in use
netstat -tulpn | grep 3001

# Kill process on port
kill -9 $(lsof -t -i:3001)

# Restart
pm2 restart usdtrain-backend
```

### Can't Connect from Frontend

1. **Check CORS settings in .env:**
   ```env
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. **Test from command line:**
   ```bash
   curl -H "Origin: https://your-frontend-domain.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: X-API-Key" \
        -X OPTIONS \
        https://api.yourdomain.com/api/v1/eligible-users/add
   ```

3. **Check firewall:**
   ```bash
   firewall-cmd --list-all
   ```

### SSL Certificate Issues

```bash
# Renew certificate
certbot renew

# Test renewal
certbot renew --dry-run
```

### Manager Wallet Issues

```bash
# Check wallet balance
npm test

# View manager address
grep MANAGER_PRIVATE_KEY .env
```

---

## Part 11: Security Checklist

- [ ] `.env` file has proper permissions (600)
- [ ] Strong API key generated and configured
- [ ] CORS configured for your frontend domain only
- [ ] SSL certificate installed and working
- [ ] Firewall configured properly
- [ ] Manager private key is secure and backed up
- [ ] Regular backups configured
- [ ] Monitoring/alerting set up

---

## Part 12: Backup Strategy

### Create Backup Script

```bash
nano /home/username/backup-backend.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup .env file (encrypted)
gpg -c /home/username/usdtrain-backend/.env -o $BACKUP_DIR/env_$DATE.gpg

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /home/username/usdtrain-backend/logs/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gpg" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /home/username/backup-backend.sh
```

### Schedule Daily Backups

```bash
crontab -e
```

Add:
```
0 2 * * * /home/username/backup-backend.sh
```

---

## Part 13: Update Procedure

### When You Need to Update the Backend

```bash
# 1. Navigate to backend directory
cd /home/username/usdtrain-backend

# 2. Pull latest changes (if using git)
git pull

# 3. Install new dependencies
npm install --production

# 4. Test
npm test

# 5. Restart with PM2
pm2 restart usdtrain-backend

# 6. Check logs
pm2 logs usdtrain-backend --lines 50
```

---

## Part 14: Performance Optimization

### Enable PM2 Cluster Mode

```bash
# Stop current instance
pm2 delete usdtrain-backend

# Start in cluster mode (uses all CPU cores)
pm2 start src/server.js --name usdtrain-backend -i max

# Save
pm2 save
```

### Configure Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Quick Reference Commands

```bash
# Start backend
pm2 start src/server.js --name usdtrain-backend

# Stop backend
pm2 stop usdtrain-backend

# Restart backend
pm2 restart usdtrain-backend

# View logs
pm2 logs usdtrain-backend

# Check status
pm2 status

# Test connection
npm test

# Health check
curl http://localhost:3001/api/v1/health
```

---

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs usdtrain-backend`
2. Check application logs: `tail -f logs/error.log`
3. Test connection: `npm test`
4. Verify .env configuration
5. Check firewall settings
6. Verify SSL certificate

---

## Production Checklist

Before going live:

- [ ] Backend deployed and running
- [ ] PM2 configured for auto-start
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] .env file secured
- [ ] API key configured in frontend
- [ ] CORS configured correctly
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Health checks passing
- [ ] Manager wallet has UCH for gas
- [ ] All tests passing

---

**Your backend is now production-ready on cPanel VPS! 🚀**

For additional support, refer to:
- `README.md` - API documentation
- `ARCHITECTURE.md` - Technical details
- `SETUP_GUIDE.md` - Troubleshooting
