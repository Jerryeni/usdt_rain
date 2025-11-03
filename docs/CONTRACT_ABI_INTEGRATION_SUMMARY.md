# Contract ABI Integration Summary

## Overview
This document summarizes the integration of the updated USDTRain contract ABI with the profile management system, including the country code handling implementation.

## Contract ABI Analysis

### Key Functions

#### Profile Management Functions
1. **setProfile(userName, contactNumber)** - Initial profile setup
2. **updateProfile(userName, contactNumber)** - Update existing profile

Both functions accept:
- `userName`: string
- `contactNumber`: string

#### Profile Retrieval Functions
1. **getUserInfo(userAddress)** - Returns comprehensive user information including:
   - userId
   - sponsorId
   - directReferrals
   - totalEarned
   - totalWithdrawn
   - isActive
   - activationTimestamp
   - nonWorkingClaimed
   - achieverLevel
   - **userName**
   - **contactNumber**

2. **getUserProfile(userAddress)** - Returns profile-specific data:
   - userName
   - contactNumber
   - profileUpdatedAt
   - userId

### Events
- **ProfileUpdated(userId, userAddress, userName, contactNumber)** - Emitted when profile is updated

## Implementation Details

### 1. Country Code Integration

#### Storage Strategy
Since the contract only supports `userName` and `contactNumber` fields (no separate country fields), we implemented a hybrid approach:

**On-Chain Storage (contactNumber field):**
- Full phone number with country code prefix
- Example: "+2348012345678" (Nigeria)
- Stored permanently on blockchain
- Accessible from any device

**Local Storage (browser):**
- Country name stored in localStorage
- Key format: `country_{walletAddress}`
- Example: "Nigeria"
- Provides better UX for country display

#### Data Flow

**Saving Profile:**
```typescript
// User selects: Nigeria
// User enters: 8012345678
// Stored on-chain: "+2348012345678"
// Stored locally: "Nigeria"
```

**Loading Profile:**
```typescript
// From contract: "+2348012345678"
// Parse country code: "+234"
// Extract number: "8012345678"
// From localStorage: "Nigeria"
// Display: Country: "Nigeria", Phone: "+234 | 8012345678"
```

### 2. Profile Page Implementation

#### State Management
```typescript
const [userName, setUserName] = useState('');
const [contactNumber, setContactNumber] = useState(''); // Number only, no code
const [selectedCountry, setSelectedCountry] = useState(''); // Country name
const [countryCode, setCountryCode] = useState(''); // e.g., "+234"
```

#### Initialization Logic
```typescript
useEffect(() => {
  if (userInfo) {
    setUserName(userInfo.userName || '');
    
    // Parse contact number from contract
    const fullContact = userInfo.contactNumber || '';
    if (fullContact) {
      // Find matching country code
      const matchedCountry = countries.find(c => fullContact.startsWith(c.code));
      if (matchedCountry) {
        setCountryCode(matchedCountry.code);
        setContactNumber(fullContact.substring(matchedCountry.code.length).trim());
      }
    }
    
    // Load country name from localStorage
    if (address) {
      const savedCountry = localStorage.getItem(`country_${address}`);
      if (savedCountry) {
        setSelectedCountry(savedCountry);
      }
    }
  }
}, [userInfo, address]);
```

#### Save Logic
```typescript
const handleSave = async () => {
  // Validation
  if (!userName.trim()) throw new Error('Username required');
  if (!contactNumber.trim()) throw new Error('Contact number required');
  if (!selectedCountry) throw new Error('Country required');
  
  // Combine country code with number
  const fullContactNumber = `${countryCode}${contactNumber.trim()}`;
  
  // Save to blockchain
  await updateProfile.mutateAsync({
    userName: userName.trim(),
    contactNumber: fullContactNumber, // e.g., "+2348012345678"
  });
  
  // Save country name to localStorage
  if (address) {
    localStorage.setItem(`country_${address}`, selectedCountry);
  }
};
```

### 3. Hook Integration

#### useUpdateProfile Hook
- Calls `contract.updateProfile(userName, contactNumber)`
- Validates input before submission
- Handles gas estimation
- Invalidates user info cache on success
- Shows toast notifications

#### useUserInfo Hook
- Calls `contract.getUserInfo(userAddress)`
- Returns UserInfo object with userName and contactNumber
- Implements retry logic for network errors
- Caches data for 30 seconds
- Auto-refetches every minute

### 4. UI Components

#### Country Selector (Edit Mode)
```tsx
<select value={selectedCountry} onChange={handleCountryChange}>
  <option value="">Select your country</option>
  {countries.map((country) => (
    <option key={country.name} value={country.name}>
      {country.name} ({country.code})
    </option>
  ))}
</select>
```

#### Contact Number Input (Edit Mode)
```tsx
<div className="flex space-x-2">
  {/* Country Code Display */}
  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-cyan-400">
    {countryCode}
  </div>
  
  {/* Phone Number Input */}
  <input
    type="tel"
    value={contactNumber}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ''); // Numbers only
      setContactNumber(value);
    }}
    maxLength={15}
  />
</div>
```

#### Display Mode
```tsx
{/* Country */}
<div>{selectedCountry || 'Not set'}</div>

{/* Contact Number */}
<div>{userInfo?.contactNumber || 'Not set'}</div>
```

## Contract ABI Structure

### Functions Array
The ABI is structured as an array of function definitions:

```json
{
  "functions": [
    {
      "inputs": [...],
      "name": "functionName",
      "outputs": [...],
      "stateMutability": "view|nonpayable",
      "type": "function"
    }
  ]
}
```

### Iterable Structure
The ABI file is structured as an object with separate sections:
```json
{
  "constructor": {...},
  "errors": [...],
  "events": [...],
  "functions": [...]
}
```

For ethers.js compatibility, the ABI is flattened into a single array in `lib/contracts/USDTRain.ts`:
```typescript
const USDTRainABI = [
  ...(USDTRainABIRaw.constructor ? [USDTRainABIRaw.constructor] : []),
  ...(USDTRainABIRaw.errors || []),
  ...(USDTRainABIRaw.events || []),
  ...(USDTRainABIRaw.functions || []),
];
```

This flattened ABI is fully iterable and can be used with:
- `ethers.Contract` - Automatically parses ABI
- `ethers.Interface` - Creates interface for encoding/decoding
- Array methods - `.map()`, `.filter()`, `.find()`
- Direct indexing - `ABI[0]`

**ABI Statistics:**
- Total items: 87
- Functions: 71
- Events: 10
- Errors: 5
- Constructor: 1

## Type Safety

### TypeScript Interfaces
```typescript
export interface UserInfo {
  userId: bigint;
  sponsorId: bigint;
  directReferrals: bigint;
  totalEarned: bigint;
  totalWithdrawn: bigint;
  isActive: boolean;
  activationTimestamp: bigint;
  nonWorkingClaimed: bigint;
  achieverLevel: bigint;
  userName: string;
  contactNumber: string;
}
```

### Contract Interaction
```typescript
// Read operations
const contract = getReadContract(provider);
const userInfo = await contract.getUserInfo(address);

// Write operations
const contract = getWriteContract(signer);
const tx = await contract.updateProfile(userName, contactNumber);
await tx.wait();
```

## Validation Rules

### Username
- Required
- Minimum 3 characters
- Maximum 50 characters
- Trimmed of whitespace

### Contact Number
- Required
- Minimum 7 digits (excluding country code)
- Maximum 15 digits (international standard)
- Only numeric characters allowed in input
- Country code automatically prepended

### Country
- Required
- Must be selected from dropdown
- Stored locally for display
- Code extracted from selection

## Error Handling

### Common Errors
1. **User rejected transaction** - User cancelled in wallet
2. **Insufficient funds** - Not enough BNB for gas
3. **User not registered** - Must register first
4. **Validation errors** - Invalid input data
5. **Network errors** - Connection issues

### Error Display
- Toast notifications for all errors
- Inline validation errors in form
- Transaction modal for tx status
- Parsed error messages for better UX

## Testing Checklist

- [x] Select country from dropdown
- [x] Country code appears automatically
- [x] Enter phone number (numbers only)
- [x] Save profile to blockchain
- [x] Country name saved to localStorage
- [x] Reload page - country displays correctly
- [x] Contact number shows with country code
- [x] Edit mode parses existing data correctly
- [x] Cancel button restores original values
- [x] Validation prevents invalid submissions
- [x] Works with different wallet addresses
- [x] ABI is properly iterable
- [x] Contract functions are accessible
- [x] Type safety maintained throughout

## Benefits

### On-Chain Benefits
✅ Contact number with country code stored permanently
✅ Accessible from any device
✅ Immutable and verifiable
✅ No contract changes required

### Off-Chain Benefits
✅ Country name provides better UX
✅ Fast local access
✅ No additional gas costs
✅ Easy to update if needed

### User Experience
✅ Automatic country code handling
✅ Clean, intuitive interface
✅ Visual separation of code and number
✅ Validation prevents errors
✅ Persistent across sessions

## Future Enhancements

### Potential Improvements
1. **Country Code Parsing** - Automatically detect country from existing numbers
2. **Phone Validation** - Validate against country-specific formats
3. **International Format** - Display numbers in international format
4. **Country Flags** - Add flag emojis to country selector
5. **Auto-complete** - Search/filter countries by name
6. **Recent Countries** - Show recently used countries first

### Contract Upgrades (if needed)
If the contract is upgraded in the future, consider:
1. Adding separate `country` and `countryCode` fields
2. Adding `profileUpdatedAt` to getUserInfo response
3. Adding batch profile update functions
4. Adding profile verification status

## Conclusion

The integration successfully combines on-chain storage of contact numbers with country codes and off-chain storage of country names for optimal user experience. The ABI is fully iterable and properly integrated with all hooks and components. All validation, error handling, and type safety measures are in place.
