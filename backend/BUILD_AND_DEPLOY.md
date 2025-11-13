# How to Build and Deploy the Backend

The backend is a Node.js application that doesn't require a build step - it runs directly from the source code.

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
cd backend
npm install --production
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env
```

Add your settings:
```env
MANAGER_PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY
CONTRACT_ADDRESS=0x9b7f2CF537F81f2fCfd3252B993b7B12a47648d1
CORS_ORIGIN=https://your-frontend-domain.com
API_KEY=generate-with-openssl-rand-hex-32
```

### 3. Start the Backend
```bash
# Test first
npm test

# Start with PM2
pm2 start src/server.js --name usdtrain-backend
pm2 save
```

That's it! No build step needed.

---

## Detailed Deployment Steps

### For Local Development

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
nano .env  # Add your configuration

# 4. Test connection
npm test

# 5. Start in development mode
npm run dev
```

### For Production (cPanel/VPS)

#### Option A: Using the Start Script (Recommended)

```bash
# 1. Upload backend folder to server
scp -r backend/* username@server:/home/username/usdtrain-backend/

# 2. SSH into server
ssh username@server

# 3. Navigate to backend
cd /home/username/usdtrain-backend

# 4. Make start script executable
chmod +x start.sh

# 5. Run start script
./start.sh
```

The start script will:
- Check all requirements
- Install dependencies
- Test configuration
- Start with PM2
- Show status

#### Option B: Manual Deployment

```bash
# 1. SSH into server
ssh username@server

# 2. Navigate to backend directory
cd /home/username/usdtrain-backend

# 3. Install dependencies
npm install --production

# 4. Create .env file
cp .env.example .env
nano .env  # Configure your settings

# 5. Test
npm test

# 6. Start with PM2
pm2 start src/server.js --name usdtrain-backend
pm2 save
pm2 startup  # Follow instructions for auto-start

# 7. Check status
pm2 status
pm2 logs usdtrain-backend
```

---

## What Gets "Built"?

The backend doesn't have a traditional build process because:
- It's written in JavaScript (ES Modules)
- Node.js runs it directly
- No compilation needed
- No bundling required

**What you need:**
1. ✅ Source code (`src/` folder)
2. ✅ Dependencies (`node_modules/` - installed via npm)
3. ✅ Configuration (`.env` file)
4. ✅ Node.js 18+ runtime

---

## File Structure

```
backend/
├── src/                    # Source code (no build needed)
│   ├── server.js          # Main entry point
│   ├── config/            # Configuration
│   ├── controllers/       # Business logic
│   ├── middleware/        # Middleware
│   ├── routes/            # API routes
│   └── utils/             # Utilities
├── node_modules/          # Dependencies (npm install)
├── logs/                  # Log files (auto-created)
├── .env                   # Your configuration
├── package.json           # Dependencies list
└── start.sh              # Start script
```

---

## Deployment Checklist

- [ ] Node.js 18+ installed on server
- [ ] PM2 installed: `npm install -g pm2`
- [ ] Backend files uploaded to server
- [ ] Dependencies installed: `npm install --production`
- [ ] `.env` file created and configured
- [ ] Connection tested: `npm test`
- [ ] Backend started: `pm2 start src/server.js --name usdtrain-backend`
- [ ] PM2 saved: `pm2 save`
- [ ] Auto-start configured: `pm2 startup`
- [ ] Firewall allows port 3001
- [ ] Reverse proxy configured
- [ ] SSL certificate installed
- [ ] Health check passing: `curl http://localhost:3001/api/v1/health`

---

## Common Commands

```bash
# Install dependencies
npm install --production

# Test configuration
npm test

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

# Save PM2 list
pm2 save

# Configure auto-start
pm2 startup
```

---

## Updating the Backend

When you make changes:

```bash
# 1. Upload new files
scp -r backend/src/* username@server:/home/username/usdtrain-backend/src/

# 2. SSH into server
ssh username@server

# 3. Navigate to backend
cd /home/username/usdtrain-backend

# 4. Install any new dependencies
npm install --production

# 5. Test
npm test

# 6. Restart
pm2 restart usdtrain-backend

# 7. Check logs
pm2 logs usdtrain-backend --lines 50
```

---

## Creating a Deployment Package

To create a clean package for deployment:

```bash
# From your local machine
cd backend
./create-deployment-package.sh
```

This creates `usdtrain-backend-deploy.tar.gz` with everything needed.

**Upload and extract:**
```bash
# Upload
scp usdtrain-backend-deploy.tar.gz username@server:/home/username/

# On server
ssh username@server
cd /home/username
tar -xzf usdtrain-backend-deploy.tar.gz
cd usdtrain-backend-deploy
npm install --production
cp .env.example .env
nano .env  # Configure
npm test
pm2 start src/server.js --name usdtrain-backend
pm2 save
```

---

## Troubleshooting

### Backend won't start?

```bash
# Check logs
pm2 logs usdtrain-backend --lines 50

# Try running directly
node src/server.js

# Check .env file
cat .env

# Reinstall dependencies
rm -rf node_modules
npm install --production
```

### Port already in use?

```bash
# Find what's using port 3001
lsof -i :3001

# Kill it
kill -9 $(lsof -t -i:3001)

# Restart
pm2 restart usdtrain-backend
```

### Dependencies missing?

```bash
# Reinstall
npm install --production

# Check Node.js version
node --version  # Should be v18+
```

---

## Production Optimization

### Use Cluster Mode (Multiple CPU Cores)

```bash
# Stop current instance
pm2 delete usdtrain-backend

# Start in cluster mode
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

## Summary

**The backend doesn't need building!** Just:

1. ✅ Install dependencies: `npm install --production`
2. ✅ Configure `.env` file
3. ✅ Start with PM2: `pm2 start src/server.js --name usdtrain-backend`

That's all! The JavaScript code runs directly on Node.js without any build step.
