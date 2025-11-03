# Transactions Source Update

## Overview
Updated the transactions system to show the source of income for each transaction, specifically showing which user generated the income.

## Implementation

### Transaction Interface Update
Added source fields to the Transaction interface:
```typescript
export interface Transaction {
  sourceUserId?: bigint;
  sourceUserName?: string;
  sourceUserAddress?: string;
}
```

### Source Detection Logic

For level income transactions:
1. Uses the `level` field to determine which level the income came from
2. Fetches user's referrals using `getUserReferrals(userId)`
3. Gets the referral at the specific level index
4. Fetches the source user's profile information
5. Displays the source user's name and ID

### Data Flow

```
Transaction (level_income, level=2)
  ↓
getUserReferrals(userId)
  ↓
referrals[level - 1] = sourceUserId
  ↓
getUserAddressById(sourceUserId)
  ↓
getUserProfile(sourceUserAddress)
  ↓
Display: sourceUserName + sourceUserId
```

## UI Changes

### Transaction Card Enhancement

Before:
```
Level Income - Level 2
+$10.00 USDT
User #123
```

After:
```
Level Income - Level 2
+$10.00 USDT
From: [👤 John Doe #456]
User #123
```

### Visual Design
- Source information displayed in cyan-colored badge
- Shows user icon, name, and ID
- Only appears for level income transactions
- Positioned above the transaction owner info

## Contract Functions Used

### Read Functions
- `getUserReferrals(userId)` - Returns array of referral user IDs
- `getUserAddressById(userId)` - Converts user ID to address
- `getUserProfile(address)` - Gets user profile with username

## Benefits

1. **Transparency**: Users can see exactly who generated their income
2. **Network Visibility**: Better understanding of income sources
3. **Team Recognition**: Identify top performers in downline
4. **Trust**: Clear attribution of earnings

## Example Scenarios

### Scenario 1: Direct Referral Income
```
Transaction: Level Income - Level 1
Amount: +$5.00
From: Alice #234
```
User earned $5 from their direct referral Alice

### Scenario 2: Second Level Income
```
Transaction: Level Income - Level 2
Amount: +$3.00
From: Bob #567
```
User earned $3 from Bob, who is in their second level

### Scenario 3: Deep Network Income
```
Transaction: Level Income - Level 5
Amount: +$1.00
From: Charlie #890
```
User earned $1 from Charlie, who is 5 levels deep

## Technical Notes

- Source information only fetched for level income transactions
- Gracefully handles missing profile data
- Falls back to user ID if name not available
- Async fetching doesn't block transaction list rendering
- Cached with React Query for performance

## Testing Checklist

- [ ] Level income shows source user
- [ ] Source user name displays correctly
- [ ] Source user ID displays correctly
- [ ] Works for all 10 levels
- [ ] Handles missing profile gracefully
- [ ] Non-level transactions don't show source
- [ ] Performance is acceptable with many transactions
- [ ] UI looks good on mobile and desktop

## Future Enhancements

- Add click-through to source user profile
- Show source user avatar
- Add network path visualization
- Filter transactions by source user
- Export transactions with source data
