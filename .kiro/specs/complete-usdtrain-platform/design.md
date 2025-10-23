# Design Document

## Overview

This design document outlines the technical architecture and implementation approach for completing the USDT Rain Web3 MLM platform. The system will integrate real blockchain data, implement all missing features, and ensure a seamless user experience across all pages.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer                                                │
│  ├─ Dashboard (/)                                           │
│  ├─ Activate (/activate)                                    │
│  ├─ Income (/income)                                        │
│  ├─ Referrals (/referrals)                                  │
│  ├─ Transactions (/transactions)                            │
│  ├─ Profile (/profile)                                      │
│  ├─ Share (/share)                                          │
│  └─ Register (/register)                                    │
├─────────────────────────────────────────────────────────────┤
│  Hooks Layer (React Query + Custom Hooks)                  │
│  ├─ useUserInfo                                             │
│  ├─ useContractStats                                        │
│  ├─ useLevelIncome                                          │
│  ├─ useReferrals                                            │
│  ├─ useTransactions                                         │
│  ├─ useWithdraw                                             │
│  ├─ useRegisterUser                                         │
│  ├─ useActivateAccount                                      │
│  ├─ useUpdateProfile                                        │
│  └─ useContractEvents                                       │
├─────────────────────────────────────────────────────────────┤
│  Contract Layer (ethers.js v6)                             │
│  ├─ USDTRain Contract Wrapper                              │
│  ├─ USDT Token Contract Wrapper                            │
│  └─ Contract Event Listeners                               │
├─────────────────────────────────────────────────────────────┤
│  Wallet Layer                                               │
│  ├─ WalletProvider (Context)                               │
│  ├─ Provider Management                                     │
│  └─ Signer Management                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BSC Blockchain (Testnet/Mainnet)              │
│  ├─ USDTRain Smart Contract                                │
│  └─ USDT Token Contract                                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User connects wallet** → WalletProvider establishes connection → Fetches user data
2. **User performs action** → Hook validates → Calls contract function → Waits for confirmation → Updates UI
3. **Contract emits event** → Event listener catches → Invalidates cache → Refetches data → Updates UI

## Components and Interfaces

### 1. Environment Configuration Module

**Purpose:** Centralize and validate all environment variables

**Location:** `lib/config/env.ts`

```typescript
interface EnvConfig {
  contracts: {
    usdtRain: string;
    usdt: string;
  };
  network: {
    chainId: number;
    rpcUrl: string;
    name: string;
    blockExplorer: string;
  };
  features: {
    enableDevTools: boolean;
  };
}
```

**Key Functions:**

- `validateEnv()` - Validates all required environment variables on app startup
- `getConfig()` - Returns typed configuration object
- `isValidAddress(address: string)` - Validates Ethereum addresses

### 2. Enhanced Contract Hooks

#### useLevelIncome Hook

**Purpose:** Fetch real level income data from contract

**Location:** `lib/hooks/useLevelIncome.ts`

```typescript
interface LevelIncomeData {
  levels: Array<{
    level: number;
    percentage: string;
    earned: bigint;
    withdrawn: bigint;
    available: bigint;
  }>;
  totals: {
    earned: bigint;
    withdrawn: bigint;
    available: bigint;
  };
}

function useLevelIncome(userAddress?: string): UseQueryResult<LevelIncomeData>;
```

**Data Sources:**

- `getUserLevelIncome(address)` - Earned per level
- `getUserLevelWithdrawn(address)` - Withdrawn per level
- `getUserAvailableLevelIncome(address)` - Available per level
- `LEVEL_PERCENTAGES(level)` - Percentage for each level

#### useReferrals Hook

**Purpose:** Fetch referral network data

**Location:** `lib/hooks/useReferrals.ts`

```typescript
interface ReferralData {
  direct: {
    count: number;
    userIds: bigint[];
  };
  byLevel: Array<{
    level: number;
    count: number;
    income: bigint;
  }>;
  teamStats: {
    totalMembers: number;
    activeMembers: number;
    teamVolume: bigint;
  };
}

function useReferrals(userId?: bigint): UseQueryResult<ReferralData>;
```

**Data Sources:**

- `getUserReferrals(userId)` - Direct referral IDs
- `getUsersByIds(userIds)` - Referral details
- Recursive fetching for multi-level data

#### useTransactions Hook

**Purpose:** Fetch and paginate transaction history

**Location:** `lib/hooks/useTransactions.ts`

```typescript
interface Transaction {
  transactionId: bigint;
  userAddress: string;
  transactionType: string;
  amount: bigint;
  level: bigint;
  timestamp: bigint;
}

interface TransactionData {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
}

function useTransactions(
  userId?: bigint,
  page?: number,
  pageSize?: number
): UseQueryResult<TransactionData>;
```

**Data Sources:**

- `getUserTransactions(userId)` - All transactions
- `getUserRecentTransactions(userId, count)` - Recent transactions

#### useWithdraw Hook

**Purpose:** Handle withdrawal operations

**Location:** `lib/hooks/useWithdraw.ts`

```typescript
interface WithdrawParams {
  type: "all" | "level" | "nonWorking";
  level?: number;
}

function useWithdraw(): UseMutationResult<
  { transactionHash: string },
  Error,
  WithdrawParams
>;
```

**Contract Functions:**

- `withdrawEarnings()` - Withdraw all available
- `withdrawLevelEarnings(level)` - Withdraw specific level
- `claimNonWorkingIncome()` - Claim non-working income

#### useUpdateProfile Hook

**Purpose:** Update user profile information

**Location:** `lib/hooks/useUpdateProfile.ts`

```typescript
interface ProfileData {
  userName: string;
  contactNumber: string;
}

function useUpdateProfile(): UseMutationResult<
  { transactionHash: string },
  Error,
  ProfileData
>;
```

**Contract Functions:**

- `updateProfile(userName, contactNumber)` - Update profile

#### useContractEvents Hook

**Purpose:** Listen to contract events and trigger UI updates

**Location:** `lib/hooks/useContractEvents.ts`

```typescript
interface EventHandlers {
  onUserRegistered?: (event: UserRegisteredEvent) => void;
  onUserActivated?: (event: UserActivatedEvent) => void;
  onLevelIncomePaid?: (event: LevelIncomePaidEvent) => void;
  onProfileUpdated?: (event: ProfileUpdatedEvent) => void;
}

function useContractEvents(
  userAddress?: string,
  handlers?: EventHandlers
): void;
```

**Events to Listen:**

- `UserRegistered`
- `UserActivated`
- `LevelIncomePaid`
- `ProfileUpdated`
- `GlobalPoolDistributed`
- `NonWorkingIncomeClaimed`

### 3. Page Components

#### Dashboard Page Enhancements

**Current State:** Partially working with mixed data sources

**Changes Needed:**

1. Remove `usePresale` hook dependency
2. Use only `useWallet` and USDTRain hooks
3. Fetch real contract stats
4. Display actual user earnings
5. Show real referral count

**Data Sources:**

- `useUserInfo(address)` - User data
- `useContractStats()` - Platform stats
- `useLevelIncome(address)` - Total earnings

#### Income Page Redesign

**Current State:** Hardcoded mock data

**Changes Needed:**

1. Replace all mock data with `useLevelIncome` hook
2. Implement real claim buttons with `useWithdraw`
3. Add loading states
4. Add error handling
5. Show transaction status during claims

**Component Structure:**

```
IncomePage
├─ IncomeHeader (total stats)
├─ ClaimAllButton
└─ LevelIncomeTable
   └─ LevelRow (x10)
      ├─ LevelInfo
      ├─ EarningsDisplay
      └─ ClaimButton
```

#### Referrals Page Redesign

**Current State:** Static mock data

**Changes Needed:**

1. Replace all mock data with `useReferrals` hook
2. Fetch real referral details
3. Calculate actual team statistics
4. Add referral list with pagination
5. Show referral status (active/inactive)

**Component Structure:**

```
ReferralsPage
├─ TeamOverview (stats cards)
├─ LevelBreakdown (level-wise data)
└─ ReferralList
   └─ ReferralCard (paginated)
      ├─ UserInfo
      ├─ JoinDate
      └─ Status
```

#### Transactions Page Implementation

**Current State:** Not implemented

**New Implementation:**

```
TransactionsPage
├─ TransactionFilters
│  ├─ TypeFilter (dropdown)
│  └─ DateRangeFilter
├─ TransactionList
│  └─ TransactionCard
│     ├─ TransactionType
│     ├─ Amount
│     ├─ Timestamp
│     ├─ Level (if applicable)
│     └─ BSCScanLink
└─ Pagination
```

**Data Source:** `useTransactions(userId, page, pageSize)`

#### Profile Page Implementation

**Current State:** Not implemented

**New Implementation:**

```
ProfilePage
├─ ProfileHeader
│  ├─ UserAvatar
│  ├─ UserId
│  └─ WalletAddress
├─ ProfileStats
│  ├─ RegistrationDate
│  ├─ ActivationDate
│  ├─ SponsorId
│  └─ AchieverLevel
├─ ProfileForm
│  ├─ UserNameInput
│  ├─ ContactNumberInput
│  └─ UpdateButton
└─ ProfileHistory
   └─ LastUpdated
```

**Data Sources:**

- `useUserInfo(address)` - User data
- `useUpdateProfile()` - Update mutation

#### Share Page Implementation

**Current State:** Route exists but not implemented

**New Implementation:**

```
SharePage
├─ ReferralLinkCard
│  ├─ LinkDisplay
│  ├─ CopyButton
│  └─ QRCode
├─ SocialShareButtons
│  ├─ WhatsAppButton
│  ├─ TelegramButton
│  ├─ TwitterButton
│  └─ FacebookButton
└─ ReferralStats
   ├─ TotalReferrals
   ├─ ActiveReferrals
   └─ EarningsFromReferrals
```

**Data Sources:**

- `useUserInfo(address)` - User ID for link
- `useReferrals(userId)` - Referral stats

#### Register Page Implementation

**Current State:** Not implemented

**New Implementation:**

```
RegisterPage
├─ RegistrationHeader
├─ SponsorIdInput
│  ├─ InputField
│  └─ ValidationMessage
├─ SponsorInfo (if valid)
│  ├─ SponsorName
│  └─ SponsorId
├─ TermsCheckbox
└─ RegisterButton
```

**Flow:**

1. Check if user already registered → redirect to dashboard
2. Extract sponsor ID from URL query param
3. Validate sponsor ID exists
4. Show sponsor info
5. Register user
6. Redirect to activation page

**Data Sources:**

- `useUserInfo(address)` - Check registration status
- `getUserIdByAddress(sponsorAddress)` - Validate sponsor
- `useRegisterUser()` - Registration mutation

### 4. Utility Components

#### Toast Notification System

**Purpose:** Provide user feedback for all operations

**Location:** `components/ui/toast.tsx` and `components/ui/use-toast.ts`

**Usage:**

```typescript
const { toast } = useToast();

toast({
  title: "Success",
  description: "Transaction confirmed",
  variant: "success",
});
```

**Variants:** success, error, warning, info

#### Transaction Status Modal

**Purpose:** Show transaction progress

**Location:** `components/TransactionModal.tsx`

**States:**

- Estimating gas
- Waiting for signature
- Transaction pending
- Transaction confirmed
- Transaction failed

#### Loading Skeleton Components

**Purpose:** Improve perceived performance

**Locations:**

- `components/skeletons/IncomeTableSkeleton.tsx`
- `components/skeletons/ReferralCardSkeleton.tsx`
- `components/skeletons/TransactionCardSkeleton.tsx`

## Data Models

### User Data Model

```typescript
interface UserData {
  userId: bigint;
  sponsorId: bigint;
  address: string;
  directReferrals: bigint;
  totalEarned: bigint;
  totalWithdrawn: bigint;
  isActive: boolean;
  activationTimestamp: bigint;
  nonWorkingClaimed: bigint;
  achieverLevel: bigint;
  userName: string;
  contactNumber: string;
  registrationDate: Date;
}
```

### Level Income Model

```typescript
interface LevelIncome {
  level: number;
  percentage: number;
  earned: bigint;
  withdrawn: bigint;
  available: bigint;
  earnedUSD: string;
  withdrawnUSD: string;
  availableUSD: string;
}
```

### Referral Model

```typescript
interface Referral {
  userId: bigint;
  address: string;
  userName: string;
  joinDate: Date;
  isActive: boolean;
  directReferrals: number;
  totalEarned: bigint;
  level: number; // Level in tree relative to viewer
}
```

### Transaction Model

```typescript
interface Transaction {
  transactionId: bigint;
  userAddress: string;
  type:
    | "registration"
    | "activation"
    | "level_income"
    | "withdrawal"
    | "global_pool"
    | "non_working";
  amount: bigint;
  level?: number;
  timestamp: Date;
  txHash?: string;
  status: "pending" | "confirmed" | "failed";
}
```

## Error Handling

### Error Categories

1. **Wallet Errors**

   - Wallet not installed
   - Wallet locked
   - Wrong network
   - User rejected transaction

2. **Contract Errors**

   - Insufficient balance
   - User not registered
   - User not activated
   - Invalid sponsor ID
   - Contract paused

3. **Network Errors**

   - RPC connection failed
   - Transaction timeout
   - Block confirmation timeout

4. **Validation Errors**
   - Invalid input format
   - Missing required fields
   - Out of range values

### Error Handling Strategy

```typescript
// Centralized error handler
function handleContractError(error: Error): {
  title: string;
  message: string;
  action?: string;
} {
  if (error.message.includes("user rejected")) {
    return {
      title: "Transaction Cancelled",
      message: "You cancelled the transaction in your wallet.",
    };
  }

  if (error.message.includes("insufficient funds")) {
    return {
      title: "Insufficient Balance",
      message: "You don't have enough BNB to pay for gas fees.",
      action: "Add BNB to your wallet",
    };
  }

  // ... more error cases

  return {
    title: "Transaction Failed",
    message: error.message,
  };
}
```

## Testing Strategy

### Unit Tests

**Focus Areas:**

- Utility functions (address validation, formatting)
- Data transformation functions
- Error handling logic

**Tools:** Jest, React Testing Library

### Integration Tests

**Focus Areas:**

- Hook behavior with mock contract responses
- Component rendering with real data
- Form validation and submission

**Tools:** Jest, React Testing Library, MSW (Mock Service Worker)

### E2E Tests (Manual)

**Test Scenarios:**

1. Complete user journey (connect → register → activate → earn → withdraw)
2. Error scenarios (wrong network, insufficient balance)
3. Edge cases (no referrals, zero balance)

## Performance Optimizations

### 1. React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
```

### 2. Data Fetching Strategy

- Use `staleTime` to prevent unnecessary refetches
- Implement pagination for large datasets
- Use `enabled` option to prevent fetching when data isn't needed
- Prefetch data on hover for better UX

### 3. Component Optimization

- Use `React.memo` for expensive components
- Implement virtual scrolling for long lists
- Lazy load heavy components
- Optimize re-renders with proper dependency arrays

### 4. Contract Call Optimization

- Batch multiple read calls using `multicall` pattern
- Cache contract instances
- Reuse provider connections
- Implement request deduplication

## Security Considerations

### 1. Input Validation

- Validate all user inputs before contract calls
- Sanitize display data to prevent XSS
- Validate addresses using ethers.js utilities

### 2. Transaction Safety

- Always estimate gas before transactions
- Add buffer to gas estimates (20%)
- Display transaction details before confirmation
- Implement transaction timeout handling

### 3. Data Privacy

- Never log private keys or sensitive data
- Use environment variables for configuration
- Validate contract addresses on startup

### 4. Smart Contract Interaction

- Use typed contract interfaces
- Validate contract responses
- Handle contract reverts gracefully
- Implement reentrancy protection in UI (disable buttons during transactions)

## Deployment Considerations

### Environment Setup

**Development:**

- BSC Testnet (Chain ID: 97)
- Test USDT contract
- Debug logging enabled

**Production:**

- BSC Mainnet (Chain ID: 56)
- Real USDT contract
- Error tracking (Sentry)
- Analytics (Google Analytics)

### Build Configuration

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Environment Variables Checklist

- ✅ `NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS`
- ✅ `NEXT_PUBLIC_USDT_CONTRACT_ADDRESS`
- ✅ `NEXT_PUBLIC_RPC_URL`
- ✅ `NEXT_PUBLIC_CHAIN_ID`
- ✅ `NEXT_PUBLIC_NETWORK`
- ✅ `NEXT_PUBLIC_BLOCK_EXPLORER`

## Migration Plan

### Phase 1: Clean Up (Remove Confusion)

1. Remove or consolidate duplicate provider systems
2. Remove unused `usePresale` hook and `PresaleProvider`
3. Standardize on `useWallet` + USDTRain hooks
4. Update all pages to use consistent data sources

### Phase 2: Implement Missing Hooks

1. Create `useLevelIncome` hook
2. Create `useReferrals` hook
3. Create `useTransactions` hook
4. Create `useWithdraw` hook
5. Create `useUpdateProfile` hook
6. Create `useContractEvents` hook

### Phase 3: Update Existing Pages

1. Update Dashboard with real data
2. Update Income page with real data
3. Update Referrals page with real data
4. Update Activate page (already mostly done)

### Phase 4: Implement New Pages

1. Implement Transactions page
2. Implement Profile page
3. Implement Share page
4. Implement Register page

### Phase 5: Add Event Listeners

1. Implement event listening system
2. Connect events to UI updates
3. Add toast notifications for events

### Phase 6: Polish and Testing

1. Add loading states everywhere
2. Add error boundaries
3. Implement toast notifications
4. Add transaction status modals
5. Test all flows end-to-end
6. Fix bugs and edge cases

## Success Metrics

### Technical Metrics

- All pages load real data from blockchain
- Zero hardcoded mock data
- All contract functions accessible via UI
- Error rate < 1%
- Page load time < 2 seconds

### User Experience Metrics

- Successful wallet connection rate > 95%
- Transaction success rate > 98%
- User can complete full journey without errors
- Clear feedback for all user actions
- Mobile responsive on all devices

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Admin Dashboard**

   - View all users
   - Distribute global pool
   - Pause/unpause contract
   - Update distribution percentages

2. **Advanced Analytics**

   - Earnings charts
   - Referral growth graphs
   - Team performance metrics

3. **Notifications System**

   - Email notifications
   - Push notifications
   - In-app notification center

4. **Multi-language Support**

   - i18n implementation
   - Language selector
   - Translated content

5. **Enhanced Referral Tools**
   - Referral tree visualization
   - Team genealogy view
   - Performance leaderboard
