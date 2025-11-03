# Achiever Rewards Flow - Corrected Implementation

## Overview
The achiever rewards system has been corrected to properly use network level counts from `getUserLevelCounts10` and follow the correct admin approval workflow.

## Level Requirements

The contract returns exactly 5 achiever levels via `getAchieverRequirements()` which returns `uint256[5]`.

### Level 1 (Achiever Level 1)
- **Requirement**: Direct referrals
- **Count Source**: `directReferrals` from `getUserAchieverInfo`
- **Description**: "Requires X direct referrals"

### Level 2 (Achiever Level 2)
- **Requirement**: Users at Network Level 1
- **Count Source**: `levelCountsArray[0]` from `getUserLevelCounts10`
- **Description**: "Requires X users at Network Level 1"

### Level 3 (Achiever Level 3)
- **Requirement**: Users at Network Level 2
- **Count Source**: `levelCountsArray[1]` from `getUserLevelCounts10`
- **Description**: "Requires X users at Network Level 2"

### Level 4 (Achiever Level 4)
- **Requirement**: Users at Network Level 3
- **Count Source**: `levelCountsArray[2]` from `getUserLevelCounts10`
- **Description**: "Requires X users at Network Level 3"

### Level 5 (Achiever Level 5)
- **Requirement**: Users at Network Level 4
- **Count Source**: `levelCountsArray[3]` from `getUserLevelCounts10`
- **Description**: "Requires X users at Network Level 4"

## Reward Status Flow

### 1. Not Eligible (`not-eligible`)
- **Condition**: `!meetsRequirement`
- **Display**: Locked button with "Not Eligible"
- **User Action**: None - must meet level count requirement first

### 2. Pending Admin Approval (`pending-admin`)
- **Condition**: `meetsRequirement && !isMarkedByAdmin`
- **Contract Check**: `hasUserAchievedLevel(userAddress, level)` returns `false`
- **Display**: Blue button "Contact Admin for Approval"
- **User Action**: Click button → Redirects to `/help` page to contact support
- **Admin Action Required**: Admin must call `markAchieverReward(userId, level)` on contract

### 3. Ready to Claim (`unclaimed`)
- **Condition**: `meetsRequirement && isMarkedByAdmin && !isRewarded`
- **Contract Checks**: 
  - `hasUserAchievedLevel(userAddress, level)` returns `true`
  - `isAchieverRewarded(userId, level)` returns `false`
- **Display**: Pink/Purple gradient button "Claim Level X Reward"
- **User Action**: Click button → Calls `claimAchieverReward(userId, level)` on contract
- **Result**: Transaction submitted, redirects to `/help?from=reward` on success

### 4. Claimed (`claimed`)
- **Condition**: `meetsRequirement && isMarkedByAdmin && isRewarded`
- **Contract Checks**:
  - `hasUserAchievedLevel(userAddress, level)` returns `true`
  - `isAchieverRewarded(userId, level)` returns `true`
- **Display**: Green button with checkmark "Reward Claimed"
- **User Action**: None - reward already claimed

## Contract Functions Used

### View Functions
1. `getUserLevelCounts10(address)` - Returns array of 10 network level counts
2. `getUserAchieverInfo(address)` - Returns current level, achieved levels, and direct referrals
3. `getAchieverRequirements()` - Returns array of 5 requirements for each level
4. `hasUserAchievedLevel(address, level)` - Checks if admin has marked the level
5. `isAchieverRewarded(userId, level)` - Checks if user has claimed the reward
6. `getAchieverProgress(address)` - Returns current progress info

### State-Changing Functions
1. `markAchieverReward(userId, level)` - Admin marks user as eligible (only admin)
2. `claimAchieverReward(userId, level)` - User claims their reward (only user)

## UI Implementation

### Income Page (`app/income/page.tsx`)
- Displays all 5 achiever levels with progress bars
- Shows appropriate button based on reward status
- "Contact Admin" button links to `/help` page
- "Claim Reward" button triggers transaction
- Success redirects to `/help?from=reward`

### Help Page (`app/help/page.tsx`)
- Shows success message when `?from=reward` query param present
- Displays support contact options (Email, Telegram, WhatsApp, Discord)
- Provides instructions for users to contact admin after claiming

## Key Changes Made

1. **Fixed Level Count Logic**: Now properly uses `getUserLevelCounts10` for Level 2+ requirements
2. **Correct Flow**: Implements the 4-state flow (not-eligible → pending-admin → unclaimed → claimed)
3. **Admin Approval**: Shows "Contact Admin" button when user meets requirements but admin hasn't marked
4. **Claim Button**: Only shows when admin has marked AND user hasn't claimed yet
5. **Status Checks**: Uses both `hasUserAchievedLevel` and `isAchieverRewarded` correctly

## Testing Checklist

- [ ] Level 1 shows correct direct referral count
- [ ] Level 2 shows correct Network Level 1 user count
- [ ] Level 3 shows correct Network Level 2 user count
- [ ] Level 4 shows correct Network Level 3 user count
- [ ] Level 5 shows correct Network Level 4 user count
- [ ] Only 5 levels are displayed (as per contract)
- [ ] "Not Eligible" shows when requirements not met
- [ ] "Contact Admin" shows when requirements met but not marked
- [ ] "Claim Reward" shows when marked but not claimed
- [ ] "Claimed" shows after successful claim
- [ ] Redirect to help page works after claim
