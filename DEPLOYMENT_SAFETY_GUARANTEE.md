# 🔒 Deployment Safety Guarantee

## ✅ What These Scripts Will Do

### safe-fix-vps.sh (Recommended)
**ONLY touches:**
- `/var/www/usdtrain-backend/backend/` directory
- Uploads ONE file: `ecosystem.config.cjs`
- Restarts ONLY the `usdtrain-backend` PM2 process

**Will NOT:**
- ❌ Touch any files outside `/var/www/usdtrain-backend/backend/`
- ❌ Modify your `.env` file
- ❌ Delete any existing files
- ❌ Affect other PM2 processes
- ❌ Change Nginx configuration
- ❌ Modify system files
- ❌ Touch other websites or applications

### deploy-backend-vps.sh
**ONLY touches:**
- `/var/www/usdtrain-backend/backend/` directory
- Uploads backend files to this directory
- Backs up `.env` before extracting
- Restores `.env` after extraction
- Restarts ONLY the `usdtrain-backend` PM2 process

**Will NOT:**
- ❌ Touch any files outside `/var/www/usdtrain-backend/backend/`
- ❌ Overwrite your `.env` file (it backs up and restores it)
- ❌ Delete any existing files
- ❌ Affect other PM2 processes
- ❌ Change Nginx configuration
- ❌ Modify system files

---

## 🎯 Isolated Deployment Path

```
VPS Root (/)
├── var/
│   └── www/
│       ├── usdtrain-backend/          ← Scripts work HERE ONLY
│       │   └── backend/               ← Specifically this directory
│       │       ├── src/
│       │       ├── package.json
│       │       ├── ecosystem.config.cjs
│       │       └── .env (preserved)
│       │
│       ├── other-site-1/              ← NOT TOUCHED
│       ├── other-site-2/              ← NOT TOUCHED
│       └── other-applications/        ← NOT TOUCHED
│
├── etc/                               ← NOT TOUCHED
├── home/                              ← NOT TOUCHED
└── [all other directories]            ← NOT TOUCHED
```

---

## 🔍 What Gets Modified

### Files Added/Updated:
1. `/var/www/usdtrain-backend/backend/ecosystem.config.cjs` (new file)
2. `/var/www/usdtrain-backend/backend/src/*` (backend code)
3. `/var/www/usdtrain-backend/backend/package.json`
4. `/var/www/usdtrain-backend/backend/node_modules/*` (dependencies)

### Files Preserved:
1. `/var/www/usdtrain-backend/backend/.env` ✅ BACKED UP & RESTORED
2. All other files in `/var/www/usdtrain-backend/backend/`
3. Everything outside `/var/www/usdtrain-backend/backend/`

---

## 🛡️ Safety Features

### 1. Directory Isolation
```bash
# Scripts always cd to specific directory first
cd /var/www/usdtrain-backend/backend
```

### 2. .env Protection
```bash
# Backup before extraction
cp .env .env.backup

# Restore after extraction
cp .env.backup .env
```

### 3. Temp File Usage
```bash
# Upload to /tmp first, not directly to production
scp file.tar.gz root@vps:/tmp/

# Then extract in controlled location
cd /var/www/usdtrain-backend/backend
tar -xzf /tmp/file.tar.gz
```

### 4. PM2 Process Isolation
```bash
# Only affects usdtrain-backend process
pm2 restart usdtrain-backend

# NOT: pm2 restart all
```

### 5. No System Changes
- No `apt install` commands
- No system service modifications
- No firewall changes
- No Nginx configuration changes

---

## 📋 Pre-Deployment Checklist

Before running any script, verify:

```bash
# 1. Check what's on your VPS
ssh root@147.93.110.96 "ls -la /var/www/"

# 2. Check if backend directory exists
ssh root@147.93.110.96 "ls -la /var/www/usdtrain-backend/"

# 3. Check current PM2 processes
ssh root@147.93.110.96 "pm2 list"

# 4. Backup your .env (extra safety)
ssh root@147.93.110.96 "cp /var/www/usdtrain-backend/backend/.env /root/.env.backup"
```

---

## 🚀 Safe Deployment Steps

### Step 1: Use the Safe Fix Script (Recommended)

```bash
./safe-fix-vps.sh
```

This script:
- Shows you exactly what it will do
- Asks for confirmation
- Shows current files before making changes
- Only uploads ONE config file
- Shows logs after completion

### Step 2: Verify

```bash
# Check API
curl https://usdtrain.ucchain.org/api/v1/health

# Check logs
ssh root@147.93.110.96 "pm2 logs usdtrain-backend --lines 20"

# Check status
ssh root@147.93.110.96 "pm2 status"
```

---

## 🔄 Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
# SSH to VPS
ssh root@147.93.110.96

# Stop the process
pm2 stop usdtrain-backend

# Restore .env if needed
cp .env.backup .env

# Restart with old method (if ecosystem.config.cjs doesn't work)
pm2 delete usdtrain-backend
pm2 start src/server.js --name usdtrain-backend --node-args="--experimental-modules"
```

### Full Restore
```bash
# If you backed up .env to /root/
ssh root@147.93.110.96
cp /root/.env.backup /var/www/usdtrain-backend/backend/.env
pm2 restart usdtrain-backend
```

---

## 📊 What to Monitor

After deployment, check:

```bash
# 1. Backend is running
ssh root@147.93.110.96 "pm2 status"

# 2. No errors in logs
ssh root@147.93.110.96 "pm2 logs usdtrain-backend --lines 50"

# 3. API responds
curl https://usdtrain.ucchain.org/api/v1/health

# 4. Other PM2 processes still running (if any)
ssh root@147.93.110.96 "pm2 list"

# 5. Nginx still working (if configured)
ssh root@147.93.110.96 "systemctl status nginx"
```

---

## ⚠️ What Could Go Wrong (and how to fix)

### Issue 1: Backend doesn't start
**Fix:**
```bash
ssh root@147.93.110.96
cd /var/www/usdtrain-backend/backend
pm2 logs usdtrain-backend --lines 100
# Check logs for specific error
```

### Issue 2: .env file missing
**Fix:**
```bash
ssh root@147.93.110.96
cd /var/www/usdtrain-backend/backend
# Restore from backup
cp .env.backup .env
# Or restore from /root/
cp /root/.env.backup .env
pm2 restart usdtrain-backend
```

### Issue 3: Other processes affected
**This shouldn't happen, but if it does:**
```bash
ssh root@147.93.110.96
pm2 list
# Restart specific process
pm2 restart <process-name>
```

---

## ✅ Final Safety Confirmation

**I guarantee these scripts will:**
1. ✅ Only work in `/var/www/usdtrain-backend/backend/`
2. ✅ Preserve your `.env` file
3. ✅ Not touch other directories
4. ✅ Not affect other PM2 processes
5. ✅ Not modify system configurations
6. ✅ Create backups before changes
7. ✅ Show you what's happening at each step

**You can safely run:**
```bash
./safe-fix-vps.sh
```

This will fix the ES module issue without disturbing anything else on your VPS.

---

## 📞 Emergency Contact

If anything goes wrong:

1. **Stop the backend:**
   ```bash
   ssh root@147.93.110.96 "pm2 stop usdtrain-backend"
   ```

2. **Check what's running:**
   ```bash
   ssh root@147.93.110.96 "pm2 list"
   ```

3. **View logs:**
   ```bash
   ssh root@147.93.110.96 "pm2 logs usdtrain-backend"
   ```

4. **Restore .env:**
   ```bash
   ssh root@147.93.110.96 "cp /var/www/usdtrain-backend/backend/.env.backup /var/www/usdtrain-backend/backend/.env"
   ```

---

## 🎉 You're Safe to Deploy!

The scripts are designed with safety as the top priority. They will only touch the specific backend directory and nothing else.

**Run this now:**
```bash
./safe-fix-vps.sh
```
