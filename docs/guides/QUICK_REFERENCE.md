# USDT RAIN - Quick Reference Guide

## Finding the System User ID

### Dashboard Shows "Total Users: 1"

This means the contract has been initialized and there's 1 user in the system.

**That user is ID: 1** ✅

### How to Find the System User

#### Method 1: Use the Register Page (Easiest)
1. Go to `/register` page
2. Look for the **"System User Found"** card at the top
3. You'll see a large number showing the Sponsor ID
4. Click "Copy" to copy the ID
5. Use this ID when registering

#### Method 2: Check Contract Directly
```typescript
// Get user ID 1 address
const userAddress = await contract.getUserAddressById(1);

// Get user info
const userInfo = await contract.getUserInfo(userAddress);
console.log('User ID:', userInfo.userId); // Should be 1
```

### Using the Sponsor ID

**For Registration:**
1. Enter `1` as the sponsor ID
2. System will validate it exists
3. Shows user information
4. Proceed with registration

**For Testing:**
- Sponsor ID: `1`
- This is the system/admin user
- Created by `bootstrapOwner()` function
- Can sponsor unlimited users

## Common Scenarios

### Scenario 1: Fresh Contract (0 Users)
**Problem:** No users exist yet
**Solution:** 
1. Contract owner calls `bootstrapOwner()`
2. Creates user ID 1
3. Now users can register with sponsor ID 1

### Scenario 2: Contract Initialized (1+ Users)
**Problem:** Need to know which sponsor ID to use
**Solution:**
1. Visit `/register` page
2. See "System User Found" card
3. Use the displayed sponsor ID (usually 1)

### Scenario 3: Multiple Users Exist
**Problem:** Want to use different sponsor
**Solution:**
1. Get referral link from existing user
2. Link format: `/register?ref=123`
3. Sponsor ID auto-filled from URL
4. Or manually enter any valid user ID

## Quick Commands

### Check Total Users
```typescript
const totalUsers = await contract.totalUsers();
console.log('Total users:', Number(totalUsers));
```

### Get User ID 1 Info
```typescript
const address = await contract.getUserAddressById(1);
const info = await contract.getUserInfo(address);
console.log('User 1:', {
  id: Number(info.userId),
  address: address,
  name: info.userName,
  active: info.isActive,
  referrals: Number(info.directReferrals)
});
```

### Check if User Exists
```typescript
const address = await contract.getUserAddressById(userId);
const exists = address !== '0x0000000000000000000000000000000000000000';
console.log(`User ${userId} exists:`, exists);
```

## UI Components

### FindSystemUser Component
Shows complete information about user ID 1:
- User ID (large, prominent)
- Copy button
- Username
- Status (Active/Inactive)
- Wallet address
- Direct referrals count
- Total earned
- Usage instructions

### SystemUserBadge Component
Compact inline display:
- Shows "Use Sponsor ID: 1"
- Can be placed anywhere
- Auto-fetches from contract

## Troubleshooting

### "Sponsor ID 1 not found"
**Cause:** Contract not initialized
**Fix:** Owner must call `bootstrapOwner()`

### "Total Users: 0"
**Cause:** No users registered yet
**Fix:** Initialize contract first

### "Invalid sponsor ID"
**Cause:** Entered 0 or negative number
**Fix:** Use positive number (1 or higher)

### "Sponsor doesn't exist"
**Cause:** Entered non-existent user ID
**Fix:** Use ID 1 or check valid user IDs

## Best Practices

### For Contract Owner
1. Deploy contract
2. Call `bootstrapOwner()` immediately
3. Verify user ID 1 created
4. Share sponsor ID 1 with first users

### For Users
1. Get referral link from sponsor
2. Or use default sponsor ID 1
3. Verify sponsor info shows correctly
4. Complete registration

### For Developers
1. Always check `totalUsers()` first
2. Handle 0 users case (show bootstrap)
3. Handle 1+ users case (show system user)
4. Provide clear error messages

## Summary

**If you see "Total Users: 1" on dashboard:**
- ✅ Contract is initialized
- ✅ User ID 1 exists
- ✅ Use `1` as sponsor ID for registration
- ✅ Visit `/register` to see full user info

**The system user ID is: 1** 🎯
