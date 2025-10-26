# USDT RAIN - Web3 MLM Platform

A decentralized multi-level marketing (MLM) platform built on Binance Smart Chain (BSC) that enables users to earn USDT through referrals and level-based income distribution.

## 📚 Documentation

Complete documentation is available in the [`docs/`](./docs) directory:

- **[Admin Documentation](./docs/admin/)** - Complete admin guides and operations manual
- **[User Guides](./docs/guides/)** - Guides for platform users
- **[Technical Docs](./docs/)** - Architecture, deployment, and testing guides

**Quick Links:**
- [Admin Dashboard Guide](./docs/admin/ADMIN_DASHBOARD.md)
- [First User Guide](./docs/guides/FIRST_USER_GUIDE.md)
- [Quick Start](./docs/QUICKSTART.md)
- [Architecture](./docs/ARCHITECTURE.md)

## Features

### Core Functionality
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **User Registration**: Register with a sponsor referral code
- **Account Activation**: Activate account with 10 USDT deposit
- **Level Income System**: Earn from 10 levels of referrals (5% to 0.5%)
- **Real-time Updates**: Live event listeners for income and referral updates
- **Withdrawal System**: Claim earnings directly to your wallet
- **Profile Management**: Update username and contact information
- **Referral Tracking**: View your entire referral network
- **Transaction History**: Complete history of all platform activities
- **Share & Earn**: Generate referral links and QR codes

### Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Ethers.js v6** for blockchain interactions
- **React Query** for efficient data fetching and caching
- **Tailwind CSS** for responsive design
- **Real-time Event Listeners** for blockchain events
- **Error Handling** with user-friendly messages
- **Loading States** with skeleton loaders
- **Toast Notifications** for user feedback

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MetaMask or another Web3 wallet
- BNB for gas fees (BSC Testnet or Mainnet)
- USDT tokens for activation

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd usdt-rain
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file:
```env
# Contract Addresses (BSC Testnet)
NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS=0xYourUSDTAddress

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=BSC Testnet
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Block Explorer
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://testnet.bscscan.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS` | Main contract address | `0x123...` |
| `NEXT_PUBLIC_USDT_CONTRACT_ADDRESS` | USDT token contract | `0x456...` |
| `NEXT_PUBLIC_CHAIN_ID` | Network chain ID | `97` (testnet) or `56` (mainnet) |
| `NEXT_PUBLIC_NETWORK_NAME` | Network display name | `BSC Testnet` |
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint URL | `https://...` |
| `NEXT_PUBLIC_BLOCK_EXPLORER_URL` | Block explorer URL | `https://testnet.bscscan.com` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

### Network Configuration

**BSC Testnet:**
- Chain ID: 97
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
- Explorer: https://testnet.bscscan.com

**BSC Mainnet:**
- Chain ID: 56
- RPC URL: https://bsc-dataseed.binance.org/
- Explorer: https://bscscan.com

## Project Structure

```
usdt-rain/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Dashboard
│   ├── income/              # Income details page
│   ├── referrals/           # Referrals page
│   ├── transactions/        # Transaction history
│   ├── profile/             # User profile
│   ├── share/               # Share referral link
│   ├── register/            # Registration page
│   └── wallet/              # Wallet connection
├── components/              # React components
│   ├── ui/                  # UI components (toast, etc.)
│   ├── skeletons/           # Loading skeletons
│   ├── ErrorBoundary.tsx    # Error boundary
│   ├── TransactionModal.tsx # Transaction modal
│   └── RetryButton.tsx      # Retry component
├── lib/                     # Core libraries
│   ├── contracts/           # Contract ABIs and addresses
│   ├── hooks/               # Custom React hooks
│   │   ├── useUserInfo.ts
│   │   ├── useLevelIncome.ts
│   │   ├── useReferrals.ts
│   │   ├── useTransactions.ts
│   │   ├── useWithdraw.ts
│   │   ├── useUpdateProfile.ts
│   │   └── useContractEvents.ts
│   ├── utils/               # Utility functions
│   │   └── errorHandler.ts
│   ├── config/              # Configuration
│   │   └── env.ts
│   └── wallet.tsx           # Wallet provider
└── .env.local               # Environment variables
```

## Usage Guide

### 1. Connect Wallet
- Click "Connect" button in the header
- Approve the connection in MetaMask
- Ensure you're on BSC Testnet/Mainnet

### 2. Register
- Navigate to `/register` or click "Register" button
- Enter sponsor referral ID (or use URL parameter `?ref=123`)
- Accept terms and conditions
- Confirm transaction in wallet

### 3. Activate Account
- Deposit 10 USDT to activate your account
- Approve USDT spending in wallet
- Confirm activation transaction
- Wait for confirmation

### 4. Earn Income
- Share your referral link from `/share` page
- Earn from 10 levels of referrals:
  - Level 1: 5%
  - Level 2: 4%
  - Level 3: 3%
  - Level 4: 2%
  - Level 5: 1.5%
  - Level 6: 1%
  - Level 7: 1%
  - Level 8: 0.75%
  - Level 9: 0.75%
  - Level 10: 0.5%

### 5. Withdraw Earnings
- Go to `/income` page
- Click "Claim All" or claim individual levels
- Confirm transaction in wallet
- Earnings sent directly to your wallet

## Smart Contract Integration

The platform integrates with two main contracts:

### USDTRain Contract
Main platform contract handling:
- User registration and activation
- Referral tracking
- Income distribution
- Withdrawals
- Profile management

### USDT Contract
Standard ERC-20 token contract for:
- Balance checking
- Approvals
- Transfers

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (via IDE)
- **React Query** for data fetching
- **Error Boundaries** for error handling

## Troubleshooting

### Common Issues

**1. Wallet Not Connecting**
- Ensure MetaMask is installed
- Check you're on the correct network
- Try refreshing the page
- Clear browser cache

**2. Transaction Failing**
- Check you have enough BNB for gas
- Verify contract addresses are correct
- Ensure you're registered and activated
- Check network connection

**3. Data Not Loading**
- Verify RPC URL is working
- Check contract addresses
- Look for errors in browser console
- Try refreshing the page

**4. Wrong Network**
- Click "Switch Network" button
- Or manually switch in MetaMask
- Verify chain ID matches configuration

### Error Messages

The platform provides user-friendly error messages for:
- Wallet errors (not installed, locked, wrong network)
- Contract errors (not registered, insufficient balance)
- Network errors (RPC failed, timeout)
- Transaction errors (rejected, failed, out of gas)

## Security Considerations

- Never share your private keys
- Always verify contract addresses
- Test on testnet before mainnet
- Keep your wallet software updated
- Be cautious of phishing attempts
- Verify transaction details before signing

## Testing

### Manual Testing Checklist

- [ ] Wallet connection flow
- [ ] Registration with sponsor ID
- [ ] Account activation with USDT
- [ ] Viewing income and referrals
- [ ] Withdrawal process
- [ ] Profile updates
- [ ] Referral link sharing
- [ ] Transaction history
- [ ] Error scenarios
- [ ] Mobile responsiveness

### Test Networks

Use BSC Testnet for testing:
- Get test BNB from faucet
- Get test USDT from faucet or swap
- Test all features before mainnet deployment

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in Vercel:
- Use mainnet contract addresses
- Use mainnet RPC URL
- Set production app URL
- Verify all addresses are correct

### Post-Deployment

- Test all features on production
- Monitor for errors
- Check transaction confirmations
- Verify contract interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Open an issue on GitHub
- Check documentation
- Review troubleshooting guide

## Acknowledgments

- Built with Next.js and React
- Powered by Binance Smart Chain
- Uses Ethers.js for Web3 integration
- UI components with Tailwind CSS
