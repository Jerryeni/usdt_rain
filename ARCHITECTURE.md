# USDT RAIN - Architecture & Flow Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (Next.js 14 App Router + React + Tailwind CSS)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Hooks      │  │  Components  │  │   Providers  │     │
│  │  (Custom)    │  │   (UI/UX)    │  │   (Context)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Ethers.js   │  │ React Query  │  │ Error Handler│     │
│  │   (Web3)     │  │  (Caching)   │  │  (Utilities) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Blockchain Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  USDTRain    │  │     USDT     │  │  BSC Network │     │
│  │  Contract    │  │   Contract   │  │   (RPC)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Provider Hierarchy

The application uses a nested provider structure for proper context management:

```jsx
<ErrorBoundary>
  <QueryProvider>           // React Query for data fetching
    <ToastProvider>         // Toast notifications
      <WalletProvider>      // Web3 wallet connection
        <PresaleProvider>   // Legacy provider (can be removed)
          {children}
        </PresaleProvider>
      </WalletProvider>
    </ToastProvider>
  </QueryProvider>
</ErrorBoundary>
```

### Provider Responsibilities

1. **ErrorBoundary**: Catches and handles React errors gracefully
2. **QueryProvider**: Manages data fetching, caching, and synchronization
3. **ToastProvider**: Provides toast notification system
4. **WalletProvider**: Manages Web3 wallet connection and state
5. **PresaleProvider**: Legacy provider (to be deprecated)

## Data Flow

### 1. User Connection Flow

```
User clicks "Connect"
       ↓
WalletProvider.connect()
       ↓
Request MetaMask connection
       ↓
Get signer and address
       ↓
Update wallet state
       ↓
Trigger useUserInfo hook
       ↓
Fetch user data from contract
       ↓
Cache in React Query
       ↓
Display in UI
```

### 2. Registration Flow

```
User enters sponsor ID
       ↓
Validate sponsor exists
       ↓
User clicks "Register"
       ↓
useRegisterUser mutation
       ↓
Call contract.registerUser()
       ↓
Wait for transaction
       ↓
Listen for UserRegistered event
       ↓
Show success toast
       ↓
Invalidate queries
       ↓
Redirect to activation
```

### 3. Income Distribution Flow

```
Referral activates account
       ↓
Contract distributes income
       ↓
LevelIncomePaid event emitted
       ↓
useContractEvents catches event
       ↓
Invalidate levelIncome query
       ↓
Refetch income data
       ↓
Show toast notification
       ↓
Update UI automatically
```

### 4. Withdrawal Flow

```
User clicks "Claim"
       ↓
useWithdraw mutation
       ↓
Estimate gas
       ↓
Show transaction modal
       ↓
User confirms in wallet
       ↓
Call contract.withdrawEarnings()
       ↓
Wait for confirmation
       ↓
Show success toast
       ↓
Invalidate queries
       ↓
Update balances
```

## Hook Architecture

### Core Hooks

#### 1. useWallet
**Purpose**: Manage Web3 wallet connection
**State**:
- provider: Ethers provider instance
- signer: Ethers signer instance
- address: Connected wallet address
- chainId: Current network chain ID
- isConnecting: Connection status

**Methods**:
- connect(): Connect to wallet
- disconnect(): Disconnect wallet

#### 2. useUserInfo
**Purpose**: Fetch user data from contract
**Returns**:
- userId: User's unique ID
- sponsorId: Sponsor's ID
- isActive: Activation status
- totalEarned: Total earnings
- totalWithdrawn: Total withdrawn
- directReferrals: Number of direct referrals
- userName: User's name
- contactNumber: Contact number

#### 3. useLevelIncome
**Purpose**: Fetch level-based income data
**Returns**:
- levels: Array of 10 levels with:
  - level: Level number (1-10)
  - percentage: Income percentage
  - earned: Total earned
  - withdrawn: Total withdrawn
  - available: Available to claim
- totals: Aggregated totals

#### 4. useReferrals
**Purpose**: Fetch referral network data
**Returns**:
- direct: Direct referrals list
- byLevel: Referrals organized by level
- teamStats: Team statistics

#### 5. useTransactions
**Purpose**: Fetch transaction history
**Parameters**:
- userId: User ID
- page: Page number
- pageSize: Items per page

**Returns**:
- transactions: Array of transactions
- pagination: Pagination info

#### 6. useWithdraw
**Purpose**: Handle withdrawal mutations
**Variants**:
- useWithdrawAll(): Claim all earnings
- useWithdrawLevel(level): Claim specific level
- useWithdrawNonWorking(): Claim non-working income

#### 7. useUpdateProfile
**Purpose**: Update user profile
**Parameters**:
- userName: New username
- contactNumber: New contact number

#### 8. useContractEvents
**Purpose**: Listen to blockchain events
**Events**:
- UserRegistered
- UserActivated
- LevelIncomePaid
- ProfileUpdated
- GlobalPoolDistributed
- NonWorkingIncomeClaimed

**Actions**:
- Invalidate React Query cache
- Show toast notifications
- Trigger UI updates

## State Management

### React Query Configuration

```typescript
{
  queries: {
    staleTime: 30 * 1000,        // 30 seconds
    gcTime: 5 * 60 * 1000,       // 5 minutes
    refetchOnWindowFocus: false,  // Disabled
    retry: 2,                     // 2 retries
    retryDelay: exponential       // Exponential backoff
  },
  mutations: {
    retry: 1                      // 1 retry
  }
}
```

### Query Keys Structure

```typescript
queryKeys = {
  usdtrain: {
    all: ['usdtrain'],
    userInfo: (address) => ['usdtrain', 'userInfo', address],
    levelIncome: (address) => ['usdtrain', 'levelIncome', address],
    referrals: (userId) => ['usdtrain', 'referrals', userId],
    transactions: (userId, page) => ['usdtrain', 'transactions', userId, page],
    contractStats: () => ['usdtrain', 'contractStats']
  }
}
```

## Error Handling

### Error Flow

```
Error occurs
       ↓
Caught by try/catch or ErrorBoundary
       ↓
handleError() processes error
       ↓
Map to user-friendly message
       ↓
Determine if retryable
       ↓
Show error toast or modal
       ↓
Provide action button if applicable
       ↓
Log to console for debugging
```

### Error Categories

1. **Wallet Errors**
   - Not installed
   - Locked
   - Wrong network
   - User rejection

2. **Contract Errors**
   - Not registered
   - Not activated
   - Insufficient balance
   - Invalid parameters

3. **Network Errors**
   - RPC timeout
   - Rate limiting
   - Connection failed

4. **Transaction Errors**
   - Gas estimation failed
   - Transaction reverted
   - Nonce conflict

## Event System

### Event Listener Setup

```typescript
useContractEvents(address) {
  // Set up listeners
  contract.on('LevelIncomePaid', handler)
  contract.on('UserRegistered', handler)
  // ... more events
  
  // Cleanup on unmount
  return () => {
    contract.off('LevelIncomePaid', handler)
    // ... remove all listeners
  }
}
```

### Event Handler Pattern

```typescript
onEvent(eventData) {
  // 1. Log event
  console.log('Event:', eventData)
  
  // 2. Invalidate queries
  queryClient.invalidateQueries(['usdtrain'])
  
  // 3. Show notification
  toast({ title: 'Event occurred', variant: 'success' })
  
  // 4. Call custom handler
  customHandler?.(eventData)
}
```

## Performance Optimizations

### 1. React Query Caching
- Stale time: 30 seconds
- Cache time: 5 minutes
- Prevents unnecessary refetches

### 2. Event Listener Optimization
- Single listener per event type
- Proper cleanup on unmount
- Filtered by user address

### 3. Component Optimization
- Skeleton loaders for perceived performance
- Lazy loading for heavy components
- Memoization where appropriate

### 4. Network Optimization
- Batch contract calls where possible
- Use multicall for multiple reads
- Exponential backoff for retries

## Security Considerations

### 1. Environment Variables
- All sensitive data in .env.local
- Never commit .env.local to git
- Validate on app startup

### 2. Contract Interactions
- Always validate addresses
- Check user permissions
- Estimate gas before transactions
- Handle transaction failures

### 3. User Input
- Validate all inputs
- Sanitize before display
- Check bounds and limits
- Prevent injection attacks

### 4. Error Messages
- Don't expose sensitive data
- User-friendly messages
- Log details for debugging
- Provide actionable feedback

## Testing Strategy

### 1. Unit Tests
- Test individual hooks
- Test utility functions
- Test error handlers
- Mock contract calls

### 2. Integration Tests
- Test hook combinations
- Test provider interactions
- Test event handling
- Test state updates

### 3. E2E Tests
- Test complete user flows
- Test wallet connection
- Test transactions
- Test error scenarios

### 4. Manual Testing
- Test on testnet first
- Verify all features
- Test edge cases
- Test mobile responsiveness

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Contract addresses verified
- [ ] Network configuration correct
- [ ] Build successful
- [ ] No console errors
- [ ] All features tested
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] Security reviewed

## Monitoring & Maintenance

### Metrics to Track
- Transaction success rate
- Error frequency
- Page load times
- User engagement
- Contract interactions

### Regular Tasks
- Monitor error logs
- Update dependencies
- Review security advisories
- Test critical flows
- Backup configurations

## Future Improvements

### Potential Enhancements
1. Add transaction history export
2. Implement advanced analytics
3. Add multi-language support
4. Optimize gas usage
5. Add more payment methods
6. Implement notifications system
7. Add social features
8. Improve mobile UX

### Technical Debt
1. Remove PresaleProvider (legacy)
2. Add comprehensive tests
3. Improve type safety
4. Add API documentation
5. Optimize bundle size
6. Add performance monitoring
7. Implement CI/CD pipeline
