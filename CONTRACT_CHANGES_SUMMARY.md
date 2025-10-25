# Contract Changes Summary

## Overview
The contract has been updated with important modifications to the achiever rewards system and income distribution mechanism.

## Key Changes

### 1. Achiever Rewards System - Hierarchical Structure

**OLD SYSTEM:**
- All achiever levels depended on direct referrals count

**NEW SYSTEM:**
- **Level 1**: Depends on direct referrals (as before)
- **Level 2-5**: Depends on count of users at the previous achiever level
  - Level 2: Requires X users at Level 1
  - Level 3: Requires X users at Level 2
  - Level 4: Requires X users at Level 3
  - Level 5: Requires X users at Level 4

**New Contract Functions:**
- `getUserLevelCounts(address)` - Returns array of [level1Count, level2Count, level3Count, level4Count, level5Count]
- `getAchieverProgress(address)` - Now returns `currentCount` instead of `currentDirect`
  - For Level 0→1: currentCount = direct referrals
  - For Level 1→2: currentCount = count of Level 1 users in network
  - For Level 2→3: currentCount = count of Level 2 users in network
  - etc.

### 2. Income Distribution - Automatic vs Manual

**AUTOMATIC DISTRIBUTION (No Manual Claim):**
- ✅ Level Income - Distributed automatically to wallet
- ✅ Global Pool - Distributed automatically to wallet

**MANUAL CLAIM REQUIRED:**
- ⚠️ Non-Working Income (Monthly Rewards) - Must be claimed manually via `claimNonWorkingIncome()`

**Removed Functions:**
- `withdrawAllEarnings()` - No longer needed
- `withdrawEarnings()` - No longer needed  
- `withdrawLevelEarnings(level)` - No longer needed

**New Function:**
- `isEligibleForNonWorkingIncome(address)` - Check if user can claim monthly rewards

## Frontend Updates Required

### ✅ COMPLETED:

1. **Updated `useAchieverProgress` hook**
   - Changed `currentDirect` to `currentCount`
   - Updated interface to reflect hierarchical structure

2. **Created `useAchieverLevelCounts` hook**
   - New hook to fetch level counts for each achiever level
   - Returns array of counts for levels 1-5

3. **Created Comprehensive `useAchieverRewards` hook**
   - Combines all achiever-related data in one hook
   - Fetches: progress, requirements, level counts, achieved levels, direct referrals
   - Builds detailed level information with hierarchical structure
   - Each level shows:
     - Current count vs requirement
     - Achievement status
     - Proper description (direct referrals for L1, previous level count for L2-5)

4. **Updated Income Page - Achiever Section**
   - Now uses `useAchieverRewards` hook for comprehensive data
   - Displays network stats: Direct Referrals and Level 1 Users
   - Shows hierarchical level requirements with proper descriptions:
     - Level 1: "Requires X direct referrals"
     - Level 2: "Requires X users at Level 1"
     - Level 3: "Requires X users at Level 2"
     - etc.
   - Each level shows individual progress bar
   - Visual indicators for achieved vs in-progress vs locked levels
   - Context-aware progress messages

5. **Updated `lib/contracts/abis.ts`**
   - Re-exported ABI from JSON file

### ⚠️ NEEDS MANUAL UPDATE:

1. **Income Page - Remove Claim Buttons**
   - Remove "Claim All" button from header summary
   - Replace with informational message: "Level income and global pool rewards are automatically distributed"
   - Keep only the "Claim Monthly Reward" button for non-working income

2. **Update Withdraw Hooks**
   - Remove or deprecate `useWithdrawLevel` and `useWithdrawAll` hooks
   - Keep only `useClaimNonWorking` hook

3. **Update UI Text Throughout**
   - Change any references to "claiming" level income or global pool
   - Update help text to explain automatic distribution

4. **Achiever Rewards Display Enhancement**
   - Consider adding a breakdown showing:
     - Direct Referrals: X
     - Level 1 Users: X
     - Level 2 Users: X
     - Level 3 Users: X
     - Level 4 Users: X
     - Level 5 Users: X
   - Use the `useAchieverLevelCounts` hook for this data

## Testing Checklist

- [ ] Verify achiever progress shows correct count based on current level
- [ ] Verify Level 1 progress uses direct referrals
- [ ] Verify Level 2+ progress uses previous level counts
- [ ] Verify no claim buttons appear for level income
- [ ] Verify no claim buttons appear for global pool
- [ ] Verify monthly rewards claim button still works
- [ ] Verify `isEligibleForNonWorkingIncome` is used for eligibility check
- [ ] Test with users at different achiever levels

## Contract Address
Make sure to update the contract address in `.env` or `.env.local` if the contract was redeployed.

## Migration Notes
- Users will see their achiever progress calculated differently
- Level income and global pool balances will show as "available" but no claim action needed
- Only monthly rewards require manual claiming
