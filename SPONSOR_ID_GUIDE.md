# Sponsor ID Guide

## Contract Initialization & Sponsor System

**The contract must be initialized before users can register**

### How It Works

#### Step 1: Initialize Contract (Owner Only)
The contract owner must call `bootstrapOwner()` first:
- Creates system user with ID 1
- This user becomes the default sponsor
- Only needs to be done once
- Automatic UI provided on register page

#### Step 2: User Registration
Once initialized, users can register:
- Use sponsor ID 1 (system user)
- Or use any valid registered user's ID
- System validates sponsor exists
- Shows sponsor information

### Sponsor ID Rules

- **ID must be > 0**: Contract requirement
- **ID 0**: Invalid/Reserved (contract will reject)
- **ID 1+**: Valid user IDs

### Contract Validation

The contract validates sponsor IDs with these rules:
1. Sponsor ID must be > 0
2. Sponsor must be a registered user
3. Sponsor address must not be zero address
4. Sponsor must exist in the system

### Implementation

#### Register Page
```typescript
// Default sponsor ID is set to 1
setSponsorId('1');
```

#### Validation Logic
```typescript
const sponsorIdNum = parseInt(id, 10);
if (isNaN(sponsorIdNum) || sponsorIdNum <= 0) {
  setSponsorError('Invalid sponsor ID');
  return;
}
```

### User Experience

**New users without a referral code:**
- Automatically assigned sponsor ID: 1
- This connects them to the admin/root user
- Ensures they can register successfully

**Users with a referral code:**
- Use the provided sponsor ID from the referral link
- Example: `?ref=123` sets sponsor ID to 123
- Must be a valid, registered user

### Testing

When testing registration:

1. **First User (Admin)**
   - Must be registered manually or through contract initialization
   - Becomes user ID 1
   - Can sponsor all subsequent users

2. **Subsequent Users**
   - Can use sponsor ID 1 (admin)
   - Or use any valid registered user's ID
   - Cannot use ID 0 (will fail)

### Error Handling

If you see "Invalid sponsor ID" error:

1. **Check the sponsor ID value**
   - Must be > 0
   - Must be a registered user

2. **Verify the sponsor exists**
   - Query `getUserAddressById(sponsorId)`
   - Should return a non-zero address

3. **Check contract state**
   - Ensure user ID 1 exists
   - Verify the contract is properly initialized

### Common Issues

#### Issue: "Invalid sponsor ID" with ID 0
**Solution**: Use ID 1 instead

#### Issue: "Sponsor ID not found" with ID 1
**Solution**: Ensure the first user (admin) is registered in the contract

#### Issue: Custom sponsor ID fails
**Solution**: Verify the sponsor user is registered and active

### Code References

**Register Page**: `app/register/page.tsx`
```typescript
// Line ~75: Default sponsor ID
setSponsorId('1');

// Line ~98: Validation
if (isNaN(sponsorIdNum) || sponsorIdNum <= 0) {
  setSponsorError('Invalid sponsor ID');
  return;
}
```

**User Flow Hook**: `lib/hooks/useUserFlow.ts`
- Manages user state transitions
- Ensures proper registration flow

### Best Practices

1. **Always validate sponsor ID**
   - Check it's a positive integer
   - Verify the sponsor exists
   - Handle errors gracefully

2. **Provide clear feedback**
   - Show sponsor information when valid
   - Display helpful error messages
   - Guide users to correct issues

3. **Test thoroughly**
   - Test with default sponsor (1)
   - Test with custom sponsors
   - Test error scenarios

### Quick Reference

| Scenario | Sponsor ID | Result |
|----------|-----------|--------|
| No referral code | 1 | ✅ Valid (admin) |
| Referral code `?ref=5` | 5 | ✅ Valid (if user 5 exists) |
| Manual entry: 0 | 0 | ❌ Invalid (contract rejects) |
| Manual entry: 1 | 1 | ✅ Valid (admin) |
| Manual entry: 999 | 999 | ✅/❌ Valid only if user 999 exists |

### Summary

- **Default sponsor ID: 1** (not 0)
- **Reason**: Contract requires valid registered user
- **ID 0**: Reserved/Invalid
- **ID 1**: First user (admin)
- **ID 2+**: Regular users

Always ensure the first user (ID 1) is registered before allowing new registrations!
