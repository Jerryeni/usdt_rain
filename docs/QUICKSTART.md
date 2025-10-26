# USDT RAIN - Quick Start Guide

Get up and running with USDT RAIN in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MetaMask wallet installed
- Test BNB and USDT (for testnet)

## Installation

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd usdt-rain

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local`:

```env
# For BSC Testnet (recommended for testing)
NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=BSC Testnet
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://testnet.bscscan.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Time Setup

### 1. Get Test Tokens

**Get Test BNB:**
- Visit [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- Enter your wallet address
- Receive 0.1 BNB

**Get Test USDT:**
- Use a testnet DEX to swap BNB for USDT
- Or use a USDT faucet if available

### 2. Add BSC Testnet to MetaMask

Click "Add Network" in MetaMask:
- **Network Name**: BSC Testnet
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Chain ID**: 97
- **Currency Symbol**: BNB
- **Block Explorer**: https://testnet.bscscan.com

### 3. Connect Wallet

1. Open the app
2. Click "Connect" button
3. Approve in MetaMask
4. Ensure you're on BSC Testnet

### 4. Register

1. Get a sponsor referral link (or use ID 1 for testing)
2. Navigate to `/register?ref=1`
3. Accept terms
4. Confirm transaction
5. Wait for confirmation

### 5. Activate Account

1. Navigate to activation page
2. Approve USDT spending
3. Confirm activation (10 USDT)
4. Wait for confirmation
5. Account is now active!

## Quick Feature Tour

### Dashboard (`/`)
- View total earnings
- See referral count
- Check platform statistics
- Quick action buttons

### Income (`/income`)
- View 10-level income breakdown
- Claim individual levels
- Claim all earnings
- See income history

### Referrals (`/referrals`)
- View referral network
- See team statistics
- Track direct referrals
- Monitor team performance

### Transactions (`/transactions`)
- Complete transaction history
- Filter by type
- View on BSCScan
- Pagination support

### Profile (`/profile`)
- View account details
- Update username
- Update contact number
- See account statistics

### Share (`/share`)
- Get referral link
- Generate QR code
- Share on social media
- Track referral stats

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code

# Testing
npm test             # Run tests (when implemented)
```

## Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed
- Check you're on BSC Testnet
- Try refreshing the page
- Clear browser cache

### Transaction Fails
- Check you have enough BNB for gas
- Verify contract addresses are correct
- Ensure you're registered and activated
- Check network connection

### Data Not Loading
- Verify RPC URL is working
- Check contract addresses in .env.local
- Look for errors in browser console
- Try refreshing the page

### Wrong Network Error
- Click "Switch Network" button
- Or manually switch in MetaMask
- Verify chain ID is 97 (testnet) or 56 (mainnet)

## Next Steps

1. **Test All Features**
   - Follow the testing guide in TESTING.md
   - Test wallet connection
   - Test registration and activation
   - Test income claiming
   - Test referral system

2. **Read Documentation**
   - README.md - Complete setup guide
   - ARCHITECTURE.md - System design
   - DEPLOYMENT.md - Deployment guide
   - TESTING.md - Testing procedures

3. **Deploy to Production**
   - Update environment variables for mainnet
   - Deploy to Vercel or your hosting
   - Test on mainnet
   - Monitor for issues

## Quick Reference

### Important URLs
- Dashboard: `/`
- Income: `/income`
- Referrals: `/referrals`
- Transactions: `/transactions`
- Profile: `/profile`
- Share: `/share`
- Register: `/register?ref=SPONSOR_ID`
- Wallet: `/wallet`

### Contract Functions
- Register: `registerUser(sponsorId)`
- Activate: `activateUser()`
- Withdraw All: `withdrawEarnings()`
- Withdraw Level: `withdrawLevelEarnings(level)`
- Update Profile: `updateProfile(name, contact)`

### Environment Variables
```env
NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS  # Required
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS      # Required
NEXT_PUBLIC_CHAIN_ID                   # Required
NEXT_PUBLIC_NETWORK_NAME               # Required
NEXT_PUBLIC_RPC_URL                    # Required
NEXT_PUBLIC_BLOCK_EXPLORER_URL         # Required
NEXT_PUBLIC_APP_URL                    # Required
```

### Network Configuration

**BSC Testnet:**
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
- Explorer: https://testnet.bscscan.com
- USDT: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd

**BSC Mainnet:**
- Chain ID: 56
- RPC: https://bsc-dataseed.binance.org/
- Explorer: https://bscscan.com
- USDT: 0x55d398326f99059fF775485246999027B3197955

## Support

Need help?
1. Check TROUBLESHOOTING section in README.md
2. Review TESTING.md for testing procedures
3. Check ARCHITECTURE.md for system design
4. Open an issue on GitHub

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Ethers.js Docs](https://docs.ethers.org/)
- [BSC Docs](https://docs.bnbchain.org/)
- [MetaMask Docs](https://docs.metamask.io/)

---

**Ready to go!** 🚀

Start by connecting your wallet and exploring the platform.
