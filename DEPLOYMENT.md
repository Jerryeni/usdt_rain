# USDT RAIN - Deployment Guide

This guide walks you through deploying the USDT Rain platform to production.

## Pre-Deployment Checklist

### 1. Smart Contract Deployment
- [ ] Deploy USDTRain contract to BSC Mainnet
- [ ] Verify contract on BSCScan
- [ ] Test all contract functions
- [ ] Note down contract address
- [ ] Ensure contract is properly initialized

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update all contract addresses
- [ ] Set correct chain ID (56 for mainnet)
- [ ] Configure mainnet RPC URL
- [ ] Set production app URL
- [ ] Verify all addresses are correct

### 3. Testing
- [ ] Test on BSC Testnet first
- [ ] Verify wallet connection
- [ ] Test registration flow
- [ ] Test activation with USDT
- [ ] Test income distribution
- [ ] Test withdrawals
- [ ] Test profile updates
- [ ] Test referral system
- [ ] Test on mobile devices
- [ ] Test error scenarios

### 4. Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Check for console errors
- [ ] Verify all TypeScript types
- [ ] Review security considerations

## Deployment Steps

### Option 1: Vercel Deployment (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

#### Step 3: Configure Project
1. **Framework Preset**: Next.js
2. **Root Directory**: ./
3. **Build Command**: `npm run build`
4. **Output Directory**: .next
5. **Install Command**: `npm install`

#### Step 4: Environment Variables
Add all environment variables from `.env.local`:

```env
NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS=0xYourMainnetAddress
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_NETWORK_NAME=BSC Mainnet
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://bscscan.com
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=false
```

#### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployment URL

#### Step 6: Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Option 2: Self-Hosted Deployment

#### Step 1: Build Application
```bash
npm run build
```

#### Step 2: Start Production Server
```bash
npm start
```

#### Step 3: Use Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "usdt-rain" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 4: Configure Nginx (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 5: SSL Certificate
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment

### 1. Verification
- [ ] Visit production URL
- [ ] Test wallet connection
- [ ] Verify contract interactions
- [ ] Check all pages load correctly
- [ ] Test on mobile devices
- [ ] Verify referral links work
- [ ] Check transaction history
- [ ] Test error handling

### 2. Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor server logs
- [ ] Track transaction success rates
- [ ] Monitor RPC endpoint health
- [ ] Set up uptime monitoring

### 3. Security
- [ ] Enable HTTPS
- [ ] Configure CORS if needed
- [ ] Review security headers
- [ ] Set up rate limiting
- [ ] Monitor for suspicious activity

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://testnet.bscscan.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=true
```

### Staging/Testing
```env
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://testnet.bscscan.com
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=false
```

### Production
```env
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://bscscan.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=false
```

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Environment Variables Not Working
- Ensure all variables start with `NEXT_PUBLIC_`
- Restart development server after changes
- Rebuild application for production
- Check Vercel environment variable settings

### Contract Interaction Fails
- Verify contract addresses are correct
- Check network configuration
- Ensure RPC URL is accessible
- Verify contract is deployed and verified

### Wallet Connection Issues
- Check MetaMask is installed
- Verify network configuration
- Ensure correct chain ID
- Check browser console for errors

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." menu
4. Select "Promote to Production"

### Self-Hosted
```bash
# Using PM2
pm2 stop usdt-rain
git checkout <previous-commit>
npm install
npm run build
pm2 restart usdt-rain
```

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Check transaction success rates
- Update dependencies monthly
- Review security advisories
- Backup configuration files
- Test critical flows weekly

### Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Support

For deployment issues:
1. Check this guide
2. Review error logs
3. Check Vercel/hosting provider docs
4. Review Next.js deployment docs
5. Open an issue on GitHub

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [BSC Documentation](https://docs.bnbchain.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)
