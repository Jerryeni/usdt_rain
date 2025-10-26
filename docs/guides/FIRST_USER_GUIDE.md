# First User Registration Guide

## Contract Design: Sponsor ID 0 for Genesis User

### How It Works

The USDT Rain contract has a special rule for the very first user:

**When `totalUsers == 0` (no users exist yet):**
- The contract requires `sponsorId == 0`
- This allows the genesis/first user to register without needing an existing sponsor
- Sponsor ID 0 is ONLY valid when no users exist

**When `totalUsers > 0` (users exist):**
- Sponsor ID must be a valid existing user ID (1, 2, 3, etc.)
- Sponsor ID 0 is no longer valid
- Must use an actual registered user as sponsor

### First User Registration Steps

**1. Check Total Users**
- Visit `/register` page
- Look at "Contract Verification" section
- Click "Verify" to see total users count

**2. If Total Users = 0**
- You're the first user!
- Sponsor ID field will show: "Enter 0 for first user"
- Default value is already set to `0`
- Help text: "First user must use sponsor ID 0"

**3. Register with Sponsor ID 0**
- Enter `0` in the sponsor ID field
- System shows: "First User (Sponsor ID 0 for genesis user)"
- Accept terms and conditions
- Click "Register"
- Confirm transaction
- You become user ID 1!

**4. After First User**
- Total users becomes 1
- Next user must use sponsor ID 1 (you!)
- Sponsor ID 0 no longer works

### Validation Rules

**Sponsor ID Validation:**
```typescript
// Allow all non-negative integers (0, 1, 2, 3, ...)
if (isNaN(sponsorIdNum) || sponsorIdNum < 0) {
  error: 'Invalid sponsor ID - must be a non-negative number'
}

// Special case: First user
if (totalUsers === 0 && sponsorId === 0) {
  ✅ Valid - First user registration
}

// Special case: No users but wrong sponsor ID
if (totalUsers === 0 && sponsorId !== 0) {
  ❌ Error: 'No users exist yet. First user must use sponsor ID 0.'
}

// Normal case: Users exist
if (totalUsers > 0) {
  // Validate sponsor exists in contract
  if (sponsor not found) {
    ❌ Error: 'Sponsor ID X not found'
  }
}
```

### UI Behavior

**When Total Users = 0:**
- Placeholder: "Enter 0 for first user"
- Default value: `0`
- Help text: "First user must use sponsor ID 0. Subsequent users use existing user IDs."
- Sponsor info card: Blue badge showing "First User (Sponsor ID 0 for genesis user)"

**When Total Users > 0:**
- Placeholder: "Enter sponsor ID"
- No default value
- Help text: "Enter a sponsor ID from your referral link or use an existing user ID."
- Sponsor info card: Green badge showing actual user information

### Common Scenarios

#### Scenario 1: Fresh Contract
```
Total Users: 0
Action: Register with sponsor ID 0
Result: ✅ Success - You become user ID 1
```

#### Scenario 2: One User Exists
```
Total Users: 1
Action: Register with sponsor ID 0
Result: ❌ Error - Must use sponsor ID 1
```

#### Scenario 3: Multiple Users
```
Total Users: 5
Action: Register with sponsor ID 0
Result: ❌ Error - Must use valid user ID (1-5)
```

### Contract Logic

The contract checks:
```solidity
function registerUser(uint256 sponsorId) external {
    if (totalUsers == 0) {
        require(sponsorId == 0, "First user must use sponsor ID 0");
        // Register first user
    } else {
        require(sponsorId > 0, "Invalid sponsor ID");
        require(userIdToAddress[sponsorId] != address(0), "Sponsor not found");
        // Register with existing sponsor
    }
}
```

**Key Validation:**
- After first user: `sponsorId > 0` is required
- Contract checks: `userIdToAddress[sponsorId] != address(0)`
- This ensures the sponsor actually exists in the system

### Testing

**Test Case 1: First User**
```
1. Deploy fresh contract
2. totalUsers = 0
3. Register with sponsorId = 0
4. Expected: Success, user ID = 1
```

**Test Case 2: Second User**
```
1. First user registered (totalUsers = 1)
2. Register with sponsorId = 1
3. Expected: Success, user ID = 2
```

**Test Case 3: Wrong Sponsor for First User**
```
1. totalUsers = 0
2. Register with sponsorId = 1
3. Expected: Error - "No users exist yet. First user must use sponsor ID 0."
```

**Test Case 4: Sponsor 0 After First User**
```
1. totalUsers = 1
2. Register with sponsorId = 0
3. Expected: Error - "Sponsor ID 0 not found"
```

### Implementation Details

**Frontend Validation:**
```typescript
// Step 1: Check if users exist
const totalUsers = await contract.totalUsers();

// Step 2: First user special case
if (totalUsers === 0 && sponsorId === 0) {
  ✅ Allow registration (first user)
}

// Step 3: After first user, validate sponsor exists
if (totalUsers > 0) {
  const sponsorAddress = await contract.getUserAddressById(sponsorId);
  
  if (sponsorAddress === '0x0000000000000000000000000000000000000000') {
    ❌ Error: Sponsor not found
  } else {
    ✅ Valid sponsor - fetch and display info
  }
}
```

**Contract Validation:**
- Checks `userIdToAddress[sponsorId] != address(0)`
- Ensures sponsor actually exists
- Prevents registration with non-existent sponsors

### Summary

**Key Points:**
- ✅ Sponsor ID 0 is ONLY for the first user
- ✅ First user MUST use sponsor ID 0
- ✅ After first user, sponsor ID must be > 0
- ✅ Contract validates sponsor exists via `userIdToAddress[sponsorId] != address(0)`
- ✅ Frontend validates by calling `getUserAddressById(sponsorId)`
- ✅ Subsequent users use existing user IDs (1, 2, 3, ...)
- ✅ All non-negative integers are accepted (0, 1, 2, ...)
- ✅ Validation is context-aware (checks totalUsers)

**UI automatically handles this:**
- Shows correct placeholder
- Sets correct default value
- Displays appropriate help text
- Validates based on contract state
- Checks sponsor exists before allowing registration

**No manual configuration needed!** 🎯
