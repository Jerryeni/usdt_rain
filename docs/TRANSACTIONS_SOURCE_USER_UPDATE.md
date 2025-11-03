# Transaction Source User Update

## Overview
Updated the transactions system to display the source user for income transactions, showing which user generated the income.

## Implementation

### Transaction Interface
```typescript
export interface Transaction {
  transactionId: bigint;
  userAddress: string;
  userName?: string;
  userId?: bigint;
  type: TransactionType;
  amount: bigint;
  amountUSD: string;
  level?: number;
  timestamp: Date;
  txHash?: string;
  status: 'confirmed';
  sourceUserId?: bigint;
  sourceUserName?: string;
  sourceUserAddress?: string;
}
```

### Source User Logic
The hook checks if the transaction has a `sourceUserId` field and fetches the corresponding user information:

```typescript
if (tx.sourceUserId && Number(tx.sourceUserId) > 0) {
  sourceUserId = tx.sourceUserId;
  
  try {
    sourceUserAddress = await contract.getUserAddressById(sourceUserId);
    const sourceProfile = await contract.getUserProfile(sourceUserAddress);
    sourceUserName = sourceProfile.userName || undefined;
  } catch (e) {
    console.warn('Error fetching source user profile:', e);
  }
}
```

### UI Display
The transactions page displays source user information for level income transactions:

```tsx
{tx.sourceUserName && tx.type === 'level_income' && (
  <div className="flex items-center text-xs">
    <span className="text-gray-400 mr-2">From:</span>
    <div className="flex items-center bg-cyan-500/10 px-2 py-1 rounded">
      <i className="fas fa-user text-cyan-400 mr-1"></i>
      <span className="text-cyan-400 font-medium">{tx.sourceUserName}</span>
      {tx.sourceUserId && (
        <span className="text-gray-400 ml-1">#{tx.sourceUserId.toString()}</span>
      )}
    </div>
  </div>
)}
```

## Contract Requirements

### Transaction Struct
The contract's Transaction struct should include a `sourceUserId` field:

```solidity
struct Transaction {
    uint256 transactionId;
    address userAddress;
    string transactionType;
    uint256 amount;
    uint256 level;
    uint256 timestamp;
    uint256 sourceUserId;  // ID of user who generated this income
}
```

### getUserTransactions Function
The function should return transactions with source user information:

```solidity
function getUserTransactions(uint256 userId) 
    external 
    view 
    returns (Transaction[] memory);
```

## Features

### Source User Display
- Shows for level income transactions
- Displays user name and ID
- Styled with cyan color for visibility
- Icon indicator for user

### Information Shown
- Source user name (if profile set)
- Source user ID
- Visual badge with user icon
- Only shown for relevant transaction types

## User Experience

### Before
```
Level Income - Level 3
+$5.00 USDT
```

### After
```
Level Income - Level 3
+$5.00 USDT
From: John Doe #1234
```

## Benefits

1. **Transparency**: Users can see who generated their income
2. **Network Insight**: Better understanding of team performance
3. **Verification**: Easy to verify income sources
4. **Engagement**: Encourages team building

## Testing Checklist

- [ ] Source user displays for level income
- [ ] User name fetched correctly
- [ ] User ID displays correctly
- [ ] Handles missing profiles gracefully
- [ ] Only shows for relevant transaction types
- [ ] Visual styling is consistent
- [ ] Performance is acceptable

## Notes

- Source user information only displays for level income transactions
- If user profile is not set, only ID is shown
- Graceful error handling if source user data unavailable
- Contract must include sourceUserId in Transaction struct
