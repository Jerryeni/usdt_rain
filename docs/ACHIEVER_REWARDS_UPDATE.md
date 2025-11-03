# Achiever Rewards System Update

## Overview
Updated the achiever rewards system to implement proper eligibility checking and admin approval workflow.

## Logic Flow

### 1. Eligibility Check
- Uses `getUserLevelCounts10` to get user's network level counts
- Level 1: Based on direct referrals
- Level 2-5: Based on count of users at previous level
- User meets requirement when count >= requirement

### 2. Admin Approval
- When user meets requirement, "Contact Admin" button appears
- Button links to help/support page
- Admin uses `markAchieverReward(userId, level)` to approve
- System checks `hasUserAchievedLevel(userAddress, level)` for approval status

### 3. Claim Reward
- After admin approval, "Claim Reward" button appears
- User claims reward through contract
- System checks `isAchieverRewarded(userId, level)` for claim status

## Contract Functions Used

### Read Functions
- `getUserLevelCounts10(address)` - Returns array of 10 level counts
- `hasUserAchievedLevel(address, level)` - Returns bool if admin marked user
- `isAchieverRewarded(userId, level)` - Returns bool if reward claimed
- `ACHIEVER_LEVELS(index)` - Returns requirement for each level
- `getUserIdByAddress(address)` - Returns user ID

### Write Functions
- `markAchieverReward(userId, level)` - Admin marks user as achieved (admin only)

## Status States

### not-eligible
- User hasn't met the requirement
- Shows locked button
- Gray styling

### pending-admin
- User meets requirement
- Waiting for admin approval
- Shows "Contact Admin" button
- Blue styling with clock icon

### unclaimed
- Admin has approved
- User can claim reward
- Shows "Claim Reward" button
- Pink/purple gradient styling

### claimed
- User has claimed reward
- Shows "Reward Claimed" button
- Green styling with checkmark

## Implementation Details

### useAchieverRewards Hook
```typescript
interface AchieverRewardsData {
  userId: bigint;
  levelDetails: {
    level: number;
    requirement: number;
    currentCount: number;
    meetsRequirement: boolean;
    isMarkedByAdmin: boolean;
    isRewarded: boolean;
    needsAdminApproval: boolean;
    canClaim: boolean;
    rewardStatus: 'not-eligible' | 'pending-admin' | 'unclaimed' | 'claimed';
    description: string;
  }[];
}
```

### Status Determination Logic
```typescript
if (!meetsRequirement) {
  rewardStatus = 'not-eligible';
} else if (!isMarkedByAdmin) {
  rewardStatus = 'pending-admin';
  needsAdminApproval = true;
} else if (isRewarded) {
  rewardStatus = 'claimed';
} else {
  rewardStatus = 'unclaimed';
  canClaim = true;
}
```

## UI Changes

### Visual Indicators
- Gray: Not eligible
- Blue with clock: Pending admin approval
- Pink/purple: Ready to claim
- Green with checkmark: Claimed

### Button States
1. Not Eligible: Locked button (disabled)
2. Pending Admin: "Contact Admin for Approval" (links to /help)
3. Unclaimed: "Claim Level X Reward" (active)
4. Claimed: "Reward Claimed" (disabled, success state)

## User Flow

1. User builds network and meets level requirement
2. System detects requirement met
3. "Contact Admin" button appears
4. User contacts admin via help page
5. Admin verifies and marks user with `markAchieverReward`
6. "Claim Reward" button appears
7. User claims reward
8. Status updates to "Claimed"

## Admin Workflow

Admin needs to:
1. Verify user meets requirements
2. Call `markAchieverReward(userId, level)` on contract
3. User can then claim their reward

## Testing Checklist

- [ ] Level counts display correctly
- [ ] Eligibility detection works
- [ ] "Contact Admin" button appears when eligible
- [ ] Link to help page works
- [ ] After admin marks, claim button appears
- [ ] Claim process works
- [ ] Status updates after claim
- [ ] Visual indicators match status
- [ ] Progress bars show correctly

## Notes

- Each level is independent (not hierarchical for eligibility)
- Admin approval required for all levels
- User must contact admin to get marked
- Claim button only appears after admin approval
- All status checks are real-time from contract
