# Deploying USDT Rain Backend to Render

Complete guide for deploying the backend to Render.com

## Prerequisites

- GitHub account
- Render account (free tier works)
- Manager wallet private key
- Backend code pushed to GitHub

---

## Option 1: Deploy Backend Only (Recommended)

### Step 1: Create Separate Backend Repository

Since your backend is in a subdirectory, you have two options:

**Option A: Create a separate backend repo**

```bash
# On your local machine
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/yourusername/usdtrain-backend.git
git push -u origin main
```

**Option B: Use the monorepo with root directory setting**

Keep your current repo structure and configure Render to use the `backend` directory as root.

---

### Step 2: Connect to Render

1. Go to [https://render.com](https://render.com)
2. Sign up or log in
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select your repository (usdtrain-backend or usdt_rain)

---

### Step 3: Configure Service

**Basic Settings:**
- **Name**: `usdtrain-backend`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend` (if using monorepo, leave empty if separate repo)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Free tier works fine for testing
- Upgrade to paid for production (no sleep, better performance)

---

### Step 4: Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
NODE_ENV=production
PORT=3001
RPC_URL=https://rpc.mainnet.ucchain.org
CHAIN_ID=1137
NETWORK_NAME=ucchain-mainnet
CONTRACT_ADDRESS=0x9b7f2CF537F81f2fCfd3252B993b7B12a47648d1
USDT_CONTRACT_ADDRESS=0x45643aB553621e611984Ff34633adf8E18dA2d55
MANAGER_PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY_HERE
API_PREFIX=/api/v1
CORS_ORIGIN=https://your-frontend-domain.com
API_KEY=generate-a-strong-key-here
MIN_REFERRALS_FOR_ELIGIBILITY=10
LOG_LEVEL=info
```

**Generate API Key:**
```bash
openssl rand -hex 32
```

---

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your backend
3. Wait for deployment (usually 2-5 minutes)

---

### Step 6: Get Your Backend URL

After deployment, Render gives you a URL like:
```
https://usdtrain-backend.onrender.com
```

Update your frontend `.env`:
```env
NEXT_PUBLIC_BACKEND_URL=https://usdtrain-backend.onrender.com
```

---

### Step 7: Update CORS

Update the `CORS_ORIGIN` environment variable in Render dashboard to match your frontend domain.

---

### Step 8: Test Deployment

```bash
# Test health endpoint
curl https://usdtrain-backend.onrender.com/api/v1/health

# Expected response:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}

# Test status
curl https://usdtrain-backend.onrender.com/api/v1/status
```

---

## Option 2: Using render.yaml (Infrastructure as Code)

### Step 1: Add render.yaml to Backend

The `render.yaml` file is already created in your backend directory.

### Step 2: Deploy from Dashboard

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will detect `render.yaml` and configure automatically
5. Add secret environment variables:
   - `MANAGER_PRIVATE_KEY`
   - `CORS_ORIGIN`

---

## Troubleshooting

### Build Failed: Missing Script

**Error:**
```
ERR_PNPM_NO_SCRIPT  Missing script: build
```

**Solution:**
The backend doesn't need a build step. Update package.json:
```json
"scripts": {
  "build": "echo 'No build step required'"
}
```

Or change Build Command in Render to:
```
npm install
```

---

### Port Issues

**Error:**
```
Error: listen EADDRINUSE: address already in use
```

**Solution:**
Render automatically sets the `PORT` environment variable. Update your server to use it:

```javascript
const PORT = process.env.PORT || 3001;
```

This is already configured in `src/server.js`.

---

### Module Not Found

**Error:**
```
Cannot find module 'express'
```

**Solution:**
1. Ensure `package.json` is in the root directory (or backend directory if using monorepo)
2. Build Command should be: `npm install`
3. Check that all dependencies are in `dependencies`, not `devDependencies`

---

### Connection Timeout

**Error:**
```
Error: connect ETIMEDOUT
```

**Solution:**
1. Check RPC_URL is correct
2. Verify blockchain is accessible from Render's servers
3. Check firewall settings

---

### CORS Errors

**Error:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
Update `CORS_ORIGIN` environment variable in Render dashboard to match your frontend domain.

---

## Free Tier Limitations

Render's free tier has some limitations:

1. **Service Sleeps**: After 15 minutes of inactivity, service goes to sleep
   - First request after sleep takes 30-60 seconds
   - Solution: Upgrade to paid tier ($7/month) or use a ping service

2. **750 Hours/Month**: Free tier gives 750 hours per month
   - Enough for one service running 24/7
   - Multiple services share this limit

3. **No Custom Domains**: Free tier uses `.onrender.com` subdomain
   - Paid tier allows custom domains

---

## Keeping Free Tier Awake

### Option 1: Cron Job Ping Service

Use a service like [cron-job.org](https://cron-job.org):

1. Create account
2. Add new cron job
3. URL: `https://usdtrain-backend.onrender.com/api/v1/health`
4. Schedule: Every 10 minutes
5. This keeps your service awake

### Option 2: UptimeRobot

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor
3. Monitor Type: HTTP(s)
4. URL: `https://usdtrain-backend.onrender.com/api/v1/health`
5. Monitoring Interval: 5 minutes

---

## Monitoring

### View Logs

1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. View real-time logs

### Metrics

1. Click **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## Updating Deployment

### Auto-Deploy (Recommended)

Render automatically deploys when you push to your branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render detects the push and redeploys automatically.

### Manual Deploy

1. Go to Render Dashboard
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Environment Variables Management

### Update Variables

1. Go to service settings
2. Click **"Environment"** tab
3. Update variables
4. Click **"Save Changes"**
5. Service automatically redeploys

### Secret Variables

For sensitive data like `MANAGER_PRIVATE_KEY`:
1. Mark as **"Secret"** when adding
2. Value is hidden in dashboard
3. Only visible during initial creation

---

## Custom Domain (Paid Tier)

### Step 1: Add Custom Domain

1. Go to service settings
2. Click **"Custom Domains"**
3. Add your domain: `api.yourdomain.com`

### Step 2: Configure DNS

Add CNAME record in your DNS:
```
Type: CNAME
Name: api
Value: usdtrain-backend.onrender.com
```

### Step 3: SSL Certificate

Render automatically provisions SSL certificate (Let's Encrypt).

---

## Scaling (Paid Tier)

### Horizontal Scaling

1. Go to service settings
2. Increase **"Number of Instances"**
3. Render load balances automatically

### Vertical Scaling

1. Change **"Instance Type"**
2. Options: Starter, Standard, Pro, Pro Plus

---

## Cost Estimation

**Free Tier:**
- $0/month
- 750 hours/month
- Service sleeps after 15 min inactivity

**Starter ($7/month):**
- Always on
- 0.5 GB RAM
- 0.5 CPU
- Good for production

**Standard ($25/month):**
- 2 GB RAM
- 1 CPU
- Better performance

---

## Backup Strategy

### Database Backup

Backend doesn't use a database (all data on blockchain), but backup:

1. **Environment Variables**: Export from Render dashboard
2. **Code**: Keep in Git repository
3. **Logs**: Download periodically from Render

---

## Migration from Render

If you need to migrate:

1. Export environment variables
2. Clone repository
3. Deploy to new platform
4. Update frontend `NEXT_PUBLIC_BACKEND_URL`

---

## Support

**Render Support:**
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Email: support@render.com

**Backend Issues:**
- Check logs in Render dashboard
- Test locally: `npm start`
- Verify environment variables

---

## Quick Reference

```bash
# Test deployment
curl https://your-backend.onrender.com/api/v1/health

# View logs
# Go to Render Dashboard → Logs

# Redeploy
git push origin main

# Update environment variable
# Render Dashboard → Environment → Update → Save
```

---

## Checklist

Before going live:

- [ ] Backend deployed successfully
- [ ] Health endpoint responding
- [ ] Environment variables configured
- [ ] CORS configured for frontend domain
- [ ] Manager wallet has UCH for gas
- [ ] API key generated and secure
- [ ] Frontend updated with backend URL
- [ ] Monitoring set up (UptimeRobot/cron-job)
- [ ] Logs reviewed for errors
- [ ] Test all API endpoints

---

**Your backend is now live on Render! 🚀**
