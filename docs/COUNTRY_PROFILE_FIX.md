# Country Profile Fix Implementation

## Overview
Fixed the user profile to properly handle country selection by combining the country code with the contact number for blockchain storage, while storing the country name locally.

## Problem
- Country and country code were not being saved to the blockchain
- After updating profile, country field showed "Not set"
- Smart contract only supports `userName` and `contactNumber` fields

## Solution

### 1. Contact Number Storage
**On Save:**
- Automatically prepend country code to contact number
- Example: User selects Nigeria (+234) and enters "8012345678"
- Stored on blockchain as: "+2348012345678"

**On Load:**
- Parse the contact number to extract country code
- Display country code separately in the UI
- Show only the number part in the input field

### 2. Country Name Storage
- Store country name in browser localStorage
- Key format: `country_{walletAddress}`
- Persists across page reloads
- Displays in the "Country" field

### 3. User Experience Flow

#### Editing Profile:
1. User clicks "Edit"
2. Selects country from dropdown (e.g., "Nigeria (+234)")
3. Country code automatically appears in a separate field
4. User enters phone number without country code
5. On save, country code is prepended to the number
6. Full number (with code) is saved to blockchain
7. Country name is saved to localStorage

#### Viewing Profile:
1. Contact number is loaded from blockchain
2. Country code is parsed from the beginning of the number
3. Country name is loaded from localStorage
4. Both are displayed in their respective fields

## Code Changes

### app/profile/page.tsx

#### 1. Enhanced Contact Number Input
- Only allows numeric input (no special characters)
- Displays country code in a separate, read-only field
- User enters only the phone number part

#### 2. Initialize Form Data (useEffect)
```typescript
// Parse contact number to extract country code
const fullContact = userInfo.contactNumber || '';
if (fullContact) {
  const matchedCountry = countries.find(c => fullContact.startsWith(c.code));
  if (matchedCountry) {
    setCountryCode(matchedCountry.code);
    setContactNumber(fullContact.substring(matchedCountry.code.length).trim());
  }
}

// Load country name from localStorage
const savedCountry = localStorage.getItem(`country_${address}`);
if (savedCountry) {
  setSelectedCountry(savedCountry);
}
```

#### 3. Save Handler
```typescript
// Combine country code with contact number
const fullContactNumber = `${countryCode}${contactNumber.trim()}`;

// Save to blockchain
await updateProfile.mutateAsync({
  userName: userName.trim(),
  contactNumber: fullContactNumber,
});

// Save country name to localStorage
localStorage.setItem(`country_${address}`, selectedCountry);
```

#### 4. Validation
- Added validation to ensure country is selected before saving
- Shows error message if country is not selected

## Benefits

### ✅ Blockchain Storage
- Contact number with country code is stored on-chain
- Accessible from any device/browser
- Permanent and immutable

### ✅ Local Storage
- Country name persists in browser
- No need to modify smart contract
- Fast and efficient

### ✅ User Experience
- Clean separation of country code and phone number
- Automatic country code handling
- No manual entry of country codes
- Visual feedback with country code display

## Example Data Flow

### User Input:
- Country: Nigeria
- Phone: 8012345678

### Stored on Blockchain:
- contactNumber: "+2348012345678"

### Stored in localStorage:
- Key: `country_0x123...abc`
- Value: "Nigeria"

### Displayed to User:
- Country: Nigeria
- Contact Number: +234 | 8012345678

## Testing Checklist

- [x] Select country and enter phone number
- [x] Save profile successfully
- [x] Reload page - country name displays correctly
- [x] Contact number shows with country code
- [x] Edit mode shows country code separately
- [x] Cancel button restores original values
- [x] Validation prevents saving without country
- [x] Works across different wallet addresses
- [x] Contract ABI properly integrated
- [x] All hooks working correctly
- [x] Type safety maintained
- [x] Error handling in place

## Notes

- Each wallet address has its own country stored in localStorage
- If user clears browser data, country name will be lost (but contact number with code remains on blockchain)
- Country code can be re-derived from the contact number if needed
- Maximum phone number length: 15 digits (international standard)

## Contract Integration

### ABI Functions Used
- **updateProfile(userName, contactNumber)** - Updates user profile on blockchain
- **getUserInfo(userAddress)** - Retrieves user information including profile data

### ABI Structure
The contract ABI is properly structured and iterable:
- Functions array contains all contract methods
- Each function has inputs, outputs, and stateMutability defined
- TypeScript interfaces ensure type safety
- ethers.js automatically parses the ABI for contract interaction

### Hooks Integration
- **useUpdateProfile** - Handles profile updates with validation and error handling
- **useUserInfo** - Fetches user data with caching and retry logic
- Both hooks properly invalidate cache and refetch data after updates
