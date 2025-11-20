# 🔧 Fix VPS Deployment Error - ES Module Issue

## ❌ The Problem

Your backend is using ES Modules (`import/export`) but PM2 was trying to load it as CommonJS (`require`).

## ✅ The Solution

I've created a fix script that will:
1. Upload the correct PM2 configuration
2. Restart your backend properly
3. Show you the status

---

## 🚀 Quick Fix (Run This Now)

```bash
./fix-vps-deployment.sh
```

This will automatically fix the issue on your VPS.

---

## 📋 Manual Fix (If Script Doesn't Work)

### Option 1: SSH and Fix Manually

```bash
# 1. SSH to your VPS
ssh root@147.93.110.96

# 2. Navigate to backend
cd /var/www/usdtrain-backend/backend

# 3. Create ecosystem config
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'usdtrain-backend',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--experimental-modules',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    autorestart: true,
    watch: false
  }]
};
EOF

# 4. Stop old process
pm2 delete usdtrain-backend

# 5. Start with new config
pm2 start ecosystem.config.cjs

# 6. Save configuration
pm2 save

# 7. Check status
pm2 status
pm2 logs usdtrain-backend --lines 20
```

### Option 2: Upload ecosystem.config.cjs

```bash
# From your local machine
cd backend
scp ecosystem.config.cjs root@147.93.110.96:/var/www/usdtrain-backend/backend/

# Then SSH and restart
ssh root@147.93.110.96
cd /var/www/usdtrain-backend/backend
pm2 delete usdtrain-backend
pm2 start ecosystem.config.cjs
pm2 save
```

---

## ✅ Verify It's Working

```bash
# Test locally on VPS
ssh root@147.93.110.96 "curl http://localhost:3001/api/v1/health"

# Test from outside
curl https://usdtrain.ucchain.org/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123.45
}
```

---

## 📊 Check Logs

```bash
# View real-time logs
ssh root@147.93.110.96 "pm2 logs usdtrain-backend"

# View last 50 lines
ssh root@147.93.110.96 "pm2 logs usdtrain-backend --lines 50"

# Check status
ssh root@147.93.110.96 "pm2 status"
```

---

## 🔄 Future Deployments

The updated `deploy-backend-vps.sh` script now includes the ecosystem config, so future deployments will work correctly:

```bash
./deploy-backend-vps.sh
```

---

## 🐛 Still Having Issues?

### Check Node.js Version
```bash
ssh root@147.93.110.96 "node --version"
```

Should be v14+ (preferably v18+)

### Update Node.js if Needed
```bash
ssh root@147.93.110.96 << 'EOF'
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version
EOF
```

### Check Package.json
Make sure `backend/package.json` has:
```json
{
  "type": "module"
}
```

---

## 📞 Quick Commands

```bash
# Fix deployment
./fix-vps-deployment.sh

# Check status
ssh root@147.93.110.96 "pm2 status"

# View logs
ssh root@147.93.110.96 "pm2 logs usdtrain-backend"

# Restart
ssh root@147.93.110.96 "pm2 restart usdtrain-backend"

# Test API
curl https://usdtrain.ucchain.org/api/v1/health
```

---

## ✨ What Changed

1. **Created**: `backend/ecosystem.config.cjs` - PM2 configuration for ES modules
2. **Updated**: `deploy-backend-vps.sh` - Now includes ecosystem config
3. **Created**: `fix-vps-deployment.sh` - Quick fix script

---

## 🎯 Next Steps

1. Run `./fix-vps-deployment.sh` to fix the current deployment
2. Verify the API is working
3. Future deployments will use the updated script automatically

Good luck! 🚀
