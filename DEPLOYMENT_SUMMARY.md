# 🚀 USDT Rain Backend - VPS Deployment Summary

## 📋 What You Have

I've created a complete deployment setup for your VPS with the following files:

### 1. **Automated Deployment Script** 
   - `deploy-backend-vps.sh` - One-command deployment

### 2. **Detailed Guides**
   - `.kiro/VPS_DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
   - `.kiro/QUICK_VPS_DEPLOY.md` - Quick reference guide

### 3. **Configuration Template**
   - `backend/.env.production.example` - Production environment template

---

## 🎯 Quick Start (Recommended)

### Option 1: Automated Deployment (Easiest)

```bash
# From your project root directory
./deploy-backend-vps.sh
```

This will automatically:
- Package your backend
- Upload to VPS
- Install dependencies
- Start/restart the service

### Option 2: Manual Deployment

Follow the guide in `.kiro/QUICK_VPS_DEPLOY.md`

---

## 🔐 Before You Deploy

### 1. Update Your Production Private Key

On the VPS, you'll need to create a `.env` file with your **production** private key:

```bash
# SSH to VPS
ssh root@147.93.110.96

# Navigate to backend directory
cd /var/www/usdtrain-backend/backend

# Create .env file
nano .env
```

Copy from `backend/.env.production.example` and update:
- `MANAGER_PRIVATE_KEY` - Your production wallet private key
- `CORS_ORIGIN` - Your production domain

### 2. Ensure Your Wallet Has Manager Role

The wallet you use must have the `MANAGER_ROLE` in your smart contract to add/remove eligible users.

---

## 📁 VPS Directory Structure

After deployment, your VPS will have:

```
/var/www/usdtrain-backend/
└── backend/
    ├── src/
    │   ├── server.js
    │   ├── config/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── middleware/
    │   └── utils/
    ├── logs/
    ├── package.json
    ├── .env (you create this)
    └── node_modules/
```

---

## ✅ Verification Steps

After deployment, verify everything works:

### 1. Check Backend Status
```bash
ssh root@147.93.110.96 "pm2 status"
```

### 2. Test API Health
```bash
curl https://usdtrain.ucchain.org/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": 123.45
}
```

### 3. View Logs
```bash
ssh root@147.93.110.96 "pm2 logs usdtrain-backend --lines 50"
```

---

## 🔄 Updating Backend

When you make changes to the backend:

```bash
# Run the deployment script again
./deploy-backend-vps.sh
```

Or manually:
```bash
# SSH to VPS
ssh root@147.93.110.96

# Navigate to backend
cd /var/www/usdtrain-backend/backend

# Upload new files, then:
npm install --production
pm2 restart usdtrain-backend
```

---

## 🌐 Frontend Integration

Update your frontend `.env` to point to the VPS backend:

```env
# In your frontend .env or .env.production
NEXT_PUBLIC_BACKEND_URL=https://usdtrain.ucchain.org/api/v1
```

Or if you're using the hardcoded URL in your code, update it to:
```javascript
const BACKEND_URL = 'https://usdtrain.ucchain.org';
const API_PREFIX = '/api/v1';
```

---

## 🐛 Common Issues & Solutions

### Issue: "Connection refused"
**Solution:** Check if backend is running
```bash
ssh root@147.93.110.96 "pm2 status"
```

### Issue: "CORS error"
**Solution:** Update CORS_ORIGIN in .env
```bash
CORS_ORIGIN=https://your-frontend-domain.com
```

### Issue: "Not authorized" errors
**Solution:** Ensure your wallet has MANAGER_ROLE in the contract

### Issue: Backend crashes on start
**Solution:** Check logs
```bash
ssh root@147.93.110.96 "pm2 logs usdtrain-backend --lines 100"
```

---

## 📊 Monitoring

### View Real-time Logs
```bash
ssh root@147.93.110.96 "pm2 logs usdtrain-backend"
```

### Check System Resources
```bash
ssh root@147.93.110.96 "pm2 monit"
```

### View Error Logs
```bash
ssh root@147.93.110.96 "tail -f /var/www/usdtrain-backend/backend/logs/error.log"
```

---

## 🔒 Security Checklist

- [ ] Production private key is different from development
- [ ] .env file is not committed to Git
- [ ] Firewall is configured (ports 22, 80, 443)
- [ ] SSL certificate is installed
- [ ] Regular backups are scheduled
- [ ] Logs are monitored regularly

---

## 📞 Need Help?

1. **Check the detailed guide**: `.kiro/VPS_DEPLOYMENT_GUIDE.md`
2. **Quick reference**: `.kiro/QUICK_VPS_DEPLOY.md`
3. **View logs**: `ssh root@147.93.110.96 "pm2 logs usdtrain-backend"`
4. **Check status**: `ssh root@147.93.110.96 "pm2 status"`

---

## 🎉 Next Steps

1. **Deploy the backend** using the automated script
2. **Verify** the API is accessible
3. **Update frontend** to use the production backend URL
4. **Test** the complete flow (registration, activation, claiming)
5. **Monitor** logs for any issues

---

## 📝 Important Commands Reference

```bash
# Deploy
./deploy-backend-vps.sh

# SSH to VPS
ssh root@147.93.110.96

# Check status
ssh root@147.93.110.96 "pm2 status"

# View logs
ssh root@147.93.110.96 "pm2 logs usdtrain-backend"

# Restart backend
ssh root@147.93.110.96 "pm2 restart usdtrain-backend"

# Test API
curl https://usdtrain.ucchain.org/api/v1/health
```

---

## ✨ You're Ready!

Everything is set up for a safe, non-disruptive deployment to your VPS. The deployment script will:
- Create a dedicated directory for your backend
- Preserve existing files
- Install dependencies
- Start the service with PM2
- Show you the status

Just run: `./deploy-backend-vps.sh`

Good luck! 🚀
