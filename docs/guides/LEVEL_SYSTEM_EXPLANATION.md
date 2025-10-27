# USDT Rain Level System - Complete Explanation

## How the Level System Works

### Contract Structure

The USDT Rain platform uses a **10-level binary/unilevel MLM structure** where:

1. **Level 1**: Your direct referrals (people you personally invited)
2. **Level 2**: Referrals of your Level 1 members
3. **Level 3**: Referrals of your Level 2 members
4. **...and so on up to Level 10**

### Level Income Distribution

When a user activates their account ($25 USDT), the activation fee is distributed as follows:

**70% goes to Level Income** (distributed across 10 levels):
- Level 1: 5.0% (of $25 = $1.25)
- Level 2: 4.5% (of $25 = $1.125)
- Level 3: 4.0% (of $25 = $1.00)
- Level 4: 3.5% (of $25 = $0.875)
- Level 5: 3.0% (of $25 = $0.75)
- Level 6: 2.5% (of $25 = $0.625)
- Level 7: 2.0% (of $25 = $0.50)
- Level 8: 1.5% (of $25 = $0.375)
- Level 9: 1.0% (of $25 = $0.25)
- Level 10: 0.5% (of $25 = $0.125)

**20% goes to Global Pool** (shared among all eligible users)

**10% goes to Reserve** (platform maintenance)

### How Levels Are Calculated

#### On-Chain (Contract)

The contract tracks:
1. **Direct Referrals**: `getUserReferrals(userId)` returns array of direct referral IDs
2. **Level Income**: `getUserLevelIncome(address)` returns income earned from each level
3. **User Info**: Stores sponsor ID, which creates the referral tree

#### Off-Chain (Frontend)

The frontend must:
1. Fetch direct referrals (Level 1)
2. For each Level 1 member, fetch their referrals (Level 2)
3. Continue recursively up to Level 10
4. Count members at each level
5. Match with level income earned

### Current Implementation Issues

#### ❌ Problem 1: Level Counts Not Calculated

**Current Code** (`lib/hooks/useReferrals.ts`):
```typescript
const byLevel: LevelReferrals[] = Array.from({ length: 10 }, (_, i) => {
  const income = levelIncome[i];
  
  // For level 1, we know the count
  const count = i === 0 ? directCount : 0; // ❌ Other levels show 0
  
  return {
    level: i + 1,
    count,
    income,
    incomeUSD: formatToUSD(income),
  };
});
```

**Issue**: Only Level 1 count is calculated. Levels 2-10 show 0 members even if they exist.

#### ❌ Problem 2: Team Total Not Accurate

**Current Code**:
```typescript
let totalMembers = directCount;
for (const ref of referralDetails) {
  totalMembers += ref.directReferrals; // ❌ Only counts 2 levels
}
```

**Issue**: Only counts direct referrals + their direct referrals (2 levels), not the full 10-level network.

### How to Fix

#### Solution 1: Recursive Network Fetching

Implement recursive function to traverse the entire network tree:

```typescript
async function fetchNetworkRecursive(
  userId: bigint,
  currentLevel: number,
  maxLevel: number,
  contract: any,
  levelCounts: Map<number, number>
): Promise<void> {
  if (currentLevel > maxLevel) return;
  
  // Get referrals at current level
  const referrals = await contract.getUserReferrals(userId);
  
  // Update count for this level
  const currentCount = levelCounts.get(currentLevel) || 0;
  levelCounts.set(currentLevel, currentCount + referrals.length);
  
  // Recursively fetch next level for each referral
  for (const refId of referrals) {
    await fetchNetworkRecursive(refId, currentLevel + 1, maxLevel, contract, levelCounts);
  }
}
```

#### Solution 2: Breadth-First Search (BFS)

More efficient approach using BFS:

```typescript
async function fetchNetworkBFS(
  userId: bigint,
  maxLevel: number,
  contract: any
): Promise<Map<number, bigint[]>> {
  const levelMembers = new Map<number, bigint[]>();
  let currentLevelUsers = [userId];
  
  for (let level = 1; level <= maxLevel; level++) {
    const nextLevelUsers: bigint[] = [];
    
    for (const user of currentLevelUsers) {
      const referrals = await contract.getUserReferrals(user);
      nextLevelUsers.push(...referrals);
    }
    
    levelMembers.set(level, nextLevelUsers);
    currentLevelUsers = nextLevelUsers;
    
    if (nextLevelUsers.length === 0) break;
  }
  
  return levelMembers;
}
```

### Performance Considerations

#### Challenge: Large Networks

- A user with 5 direct referrals, each with 5 referrals, creates:
  - Level 1: 5 members
  - Level 2: 25 members
  - Level 3: 125 members
  - Level 4: 625 members
  - Level 5: 3,125 members
  - ...exponential growth

#### Solutions:

1. **Caching**: Cache network data with longer stale times
2. **Pagination**: Load levels progressively
3. **Background Jobs**: Calculate counts off-chain and store in database
4. **Contract Enhancement**: Add on-chain level counting (requires contract upgrade)

### Verification

#### How to Verify Level Counts

1. **Manual Check**:
   - Pick a user at Level 2
   - Check their sponsor ID
   - Verify they're in your Level 1's referrals
   - Count all such users

2. **Contract Events**:
   - Listen to `UserRegistered` events
   - Track sponsor relationships
   - Build network tree off-chain

3. **BSCScan**:
   - Call `getUserReferrals` for each level
   - Manually traverse the tree

### Income vs Members

#### Important Note

**Level Income ≠ Level Member Count**

- You can have income from Level 5 even if you have 0 direct Level 5 members
- Income comes from ANY activation in your 10-level network
- The contract automatically distributes to all 10 levels above the activating user

**Example**:
```
You (Level 0)
├─ Alice (Level 1) - Your direct referral
   ├─ Bob (Level 2) - Alice's referral
      ├─ Charlie (Level 3) - Bob's referral
         └─ David (Level 4) - Charlie's referral
```

When David activates:
- You earn Level 4 income (3.5%)
- Alice earns Level 3 income (4.0%)
- Bob earns Level 2 income (4.5%)
- Charlie earns Level 1 income (5.0%)

### Current Display

#### Income Page - Level Breakdown

Shows:
- ✅ Level income earned (accurate - from contract)
- ❌ Member count (only Level 1 accurate, others show 0)

#### Referrals Page - Team

Shows:
- ✅ Direct referrals (Level 1) - accurate
- ❌ Total team members - only counts 2 levels
- ❌ Levels 2-10 member counts - shows 0

### Recommended Fix

Implement BFS network traversal with:
1. Progressive loading (load levels 1-3 immediately, 4-10 on demand)
2. Caching with 5-minute stale time
3. Loading states for each level
4. Option to "Load More Levels" button

This balances accuracy with performance.

---

**Status**: Issue Identified
**Priority**: Medium
**Impact**: Display accuracy
**Solution**: Implement recursive network fetching
