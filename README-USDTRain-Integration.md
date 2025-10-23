# USDTRain Contract Integration

This document outlines the complete Web3 integration for the USDTRain contract using ethers.js v6 and direct provider connections.

## 🚀 Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# USDTRain Contract Configuration
NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS=0xc12610a8e2b4F94Ee4A7B7bBFE27Cf9323502a17
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
NEXT_PUBLIC_CHAIN_ID=97
```

### 2. Installation

```bash
npm install ethers@^6.0.0 @tanstack/react-query
```

### 3. Usage

```tsx
import { WalletProvider, useWallet } from '@/lib/wallet';
import { WalletButton } from '@/components/WalletButton';
import { useUserInfo, useRegisterUser } from '@/lib/hooks';

function App() {
  return (
    <WalletProvider>
      <YourAppComponents />
    </WalletProvider>
  );
}

function Dashboard() {
  const { address, connect, disconnect } = useWallet();
  const { data: userInfo } = useUserInfo(address);
  const registerUser = useRegisterUser();

  return (
    <div>
      <WalletButton />
      {address && (
        <div>
          <p>Connected: {address}</p>
          {userInfo && (
            <div>
              <p>User ID: {userInfo.userId.toString()}</p>
              <p>Total Earned: {userInfo.totalEarned.toString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## 📁 File Structure

```
lib/
├── wallet.tsx                    # Wallet context with direct provider
├── contracts/
│   ├── USDTRain.ts              # Contract helpers and types
│   └── abi/
│       └── USDTRain.json        # Contract ABI
└── hooks/
    ├── useUserInfo.ts           # User info hook
    ├── useRegisterUser.ts       # Registration hook
    ├── useContractStats.ts      # Contract statistics hook
    ├── useActivateAccount.ts    # Account activation hook
    └── useUSDTRainEvents.ts     # Event listeners hook

components/
└── WalletButton.tsx             # Wallet connection UI component
```

## 🔧 Core Components

### Wallet Context (`lib/wallet.tsx`)

Provides wallet state management with:
- **Injected Provider Detection**: Uses `window.ethereum` (MetaMask)
- **Read-only Fallback**: JSON-RPC provider for non-connected users
- **Event Listeners**: `accountsChanged`, `chainChanged` events
- **Type Safety**: Full TypeScript support with ethers v6

```tsx
const { provider, signer, address, chainId, connect, disconnect, isInjected, isConnecting } = useWallet();
```

### Contract Helpers (`lib/contracts/USDTRain.ts`)

Type-safe contract interaction helpers:

```tsx
// Read-only operations
const contract = getReadContract(provider);
const userInfo = await contract.getUserInfo(address);

// Write operations
const writeContract = getWriteContract(signer);
const tx = await writeContract.registerUser(sponsorId);
```

### Typed Hooks

#### `useUserInfo`
```tsx
const { data: userInfo, isLoading, error } = useUserInfo(address);
```

#### `useRegisterUser`
```tsx
const registerMutation = useRegisterUser();

await registerMutation.mutateAsync(sponsorId);
```

#### `useContractStats`
```tsx
const { data: stats } = useContractStats();
// Returns: totalUsers, totalActivatedUsers, globalPoolBalance, etc.
```

## 🎯 Contract Functions Available

### View Functions
- `getUserInfo(address)` - Complete user information
- `getUserLevelIncome(address)` - Level-based earnings
- `getUserTotalAvailable(address)` - Total available earnings
- `getContractStats()` - Contract statistics
- `totalUsers()` - Total registered users
- `ACTIVATION_FEE()` - Account activation cost

### Write Functions
- `registerUser(sponsorId)` - Register new user
- `activateAccount()` - Activate user account
- `setProfile(userName, contactNumber)` - Update profile
- `withdrawEarnings()` - Withdraw all earnings
- `withdrawLevelEarnings(level)` - Withdraw level-specific earnings
- `claimNonWorkingIncome()` - Claim non-working income

### Events
- `UserRegistered` - New user registration
- `UserActivated` - Account activation
- `LevelIncomePaid` - Level income distribution
- `ProfileUpdated` - Profile updates

## 🧪 Testing & QA

### Manual Testing Checklist

#### 1. Wallet Connection
- [ ] Open app with MetaMask unlocked
- [ ] Click "Connect Wallet" button
- [ ] Verify address displays correctly
- [ ] Verify wallet balance shows in UI

#### 2. Network Switching
- [ ] Switch network in MetaMask to BSC Testnet
- [ ] Verify app detects network change
- [ ] Verify read operations work on correct network

#### 3. Read Operations
- [ ] Call `getUserInfo` while connected
- [ ] Call `getContractStats` for overview
- [ ] Verify data displays correctly in UI

#### 4. Write Operations
- [ ] Call `registerUser` with valid sponsor ID
- [ ] Verify MetaMask transaction popup appears
- [ ] Confirm gas estimate shown in UI
- [ ] Wait for transaction confirmation
- [ ] Verify success state and UI updates

#### 5. Event Listeners
- [ ] Trigger contract events via Hardhat scripts
- [ ] Verify UI updates in real-time
- [ ] Check event logs in browser console

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS` | Contract address | `0xc12610a8e2b4F94Ee4A7B7bBFE27Cf9323502a17` |
| `NEXT_PUBLIC_RPC_URL` | BSC RPC endpoint | `https://data-seed-prebsc-1-s1.bnbchain.org:8545/` |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID | `97` (testnet) |

### Network Configuration

**BSC Testnet (Chain ID: 97)**
- RPC: `https://data-seed-prebsc-1-s1.bnbchain.org:8545/`
- Explorer: `https://testnet.bscscan.com/`

**BSC Mainnet (Chain ID: 56)**
- RPC: `https://bsc-dataseed.binance.org/`
- Explorer: `https://bscscan.com/`

## 🔒 Security Considerations

1. **Input Validation**: All user inputs validated before contract calls
2. **Gas Estimation**: Gas estimated before all transactions
3. **Error Handling**: Comprehensive error handling with user feedback
4. **Event Validation**: Event listeners validate data before UI updates
5. **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🚨 Troubleshooting

### Common Issues

**"No injected wallet found"**
- Ensure MetaMask is installed and unlocked
- Check if app is running on HTTPS in production

**"Transaction failed"**
- Verify correct network (BSC Testnet/Mainnet)
- Check gas price and limits
- Ensure sufficient BNB for gas fees

**"Provider not found"**
- Check `NEXT_PUBLIC_RPC_URL` environment variable
- Verify RPC endpoint is accessible

### Debug Mode

Enable debug logging:
```tsx
// In development
console.log('Wallet state:', { address, chainId, isInjected });
console.log('Contract call:', { function: 'getUserInfo', address });
```

## 📊 Performance Optimizations

1. **React Query Caching**: Automatic caching and background refetching
2. **Gas Estimation**: Pre-transaction gas estimation
3. **Event-Driven Updates**: Real-time UI updates via event listeners
4. **Optimistic Updates**: Immediate UI feedback for better UX

## 🔄 Migration from Existing Code

If migrating from wagmi or other libraries:

1. Replace `useAccount()` with `useWallet()`
2. Replace `useContractRead()` with custom hooks
3. Replace `useContractWrite()` with mutation hooks
4. Update wallet connection logic to use direct provider

## 📚 Additional Resources

- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [BSC Documentation](https://docs.bnbchain.org/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Status**: ✅ Ready for production deployment
**Last Updated**: $(date)
**Version**: 1.0.0