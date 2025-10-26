# Admin Access Troubleshooting Guide

## Issue: First User Being Denied Access

If the first registered user is being denied access to the admin dashboard, follow these steps to diagnose and fix the issue.

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open the admin page (`/admin`)
2. Open browser developer tools (F12)
3. Go to Console tab
4. Look for logs starting with `useIsOwner:`

**What to look for:**
```
useIsOwner: Contract owner: 0x...
useIsOwner: Current address: 0x...
useIsOwner: User ID: 1
useIsOwner: User is first user (ID 1) - granting access
```

### Step 2: Use Debug Component
The admin page now includes a debug panel in the bottom-right corner that shows:
- Connected wallet address
- Contract owner address
- Whether addresses match
- User ID
- Whether user is first user
- Final access decision

## Common Issues and Solutions

### Issue 1: User Not Registered Yet
**Symptom**: Debug shows "User ID: 0" or "Not Registered"

**Solution**:
1. Go to `/register` page
2. Register with a sponsor ID
3. Complete registration
4. Try accessing `/admin` again

### Issue 2: User is Not ID 1
**Symptom**: Debug shows "User ID: 2" or higher

**Solution**:
- This user is not the first user
- Only User ID 1 gets admin access
- Check who registered first
- Use that wallet address instead

### Issue 3: Contract Call Failing
**Symptom**: Console shows errors like "Error checking user ID"

**Solution**:
1. Check network connection
2. Verify you're on correct network (testnet/mainnet)
3. Check RPC endpoint in `.env`
4. Try refreshing the page
5. Clear browser cache

### Issue 4: Wrong Network
**Symptom**: Can't connect or contract calls fail

**Solution**:
1. Check `.env` file for `NEXT_PUBLIC_CHAIN_ID`
2. Ensure wallet is on same network
3. Switch network in wallet
4. Refresh page

### Issue 5: Stale Cache
**Symptom**: Access status not updating

**Solution**:
1. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Disconnect and reconnect wallet
4. Wait 30 seconds for cache to expire

## Verification Steps

### Verify User ID on Contract

**Using BSCScan**:
1. Go to BSCScan (testnet or mainnet)
2. Navigate to your contract address
3. Go to "Read Contract" tab
4. Find `getUserIdByAddress` function
5. Enter your wallet address
6. Click "Query"
7. Should return `1` for first user

**Using Console**:
```javascript
// In browser console on your app
const contract = await getReadContract(provider);
const userId = await contract.getUserIdByAddress('YOUR_ADDRESS');
console.log('User ID:', Number(userId));
```

### Verify Contract Owner

**Using BSCScan**:
1. Go to contract on BSCScan
2. Go to "Read Contract" tab
3. Find `owner` function
4. Click "Query"
5. Note the owner address

### Check Access Logic

The access logic is:
```
IF (wallet === contract owner) THEN grant access
ELSE IF (user ID === 1) THEN grant access
ELSE deny access and redirect
```

## Manual Testing

### Test 1: Check Hook Response
Add this to your code temporarily:
```typescript
const { data: isOwner, isLoading } = useIsOwner();
console.log('Is Owner:', isOwner, 'Loading:', isLoading);
```

### Test 2: Direct Contract Call
```typescript
const contract = getReadContract(provider);
const userId = await contract.getUserIdByAddress(address);
console.log('Direct call - User ID:', Number(userId));
```

### Test 3: Owner Check
```typescript
const contract = getReadContract(provider);
const owner = await contract.owner();
console.log('Owner:', owner);
console.log('Current:', address);
console.log('Match:', owner.toLowerCase() === address.toLowerCase());
```

## Debug Component Usage

The `AdminAccessDebug` component is now added to the admin page. It shows:

- ✅ **Green checkmarks**: Conditions met
- ❌ **Red X marks**: Conditions not met
- ⏳ **Loading**: Still checking

**To use**:
1. Navigate to `/admin`
2. Click the bug icon (🐛) in bottom-right corner
3. Or press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
4. Review all the information
5. Identify which condition is failing
6. Click the X or bug icon again to close

**Keyboard Shortcut**:
- `Ctrl+Shift+D` (Windows/Linux)
- `Cmd+Shift+D` (Mac)

**To remove** (after debugging):
1. Open `app/admin/page.tsx`
2. Remove the line: `<AdminAccessDebug />`
3. Remove the import: `import { AdminAccessDebug } from '@/components/AdminAccessDebug';`

## Expected Behavior

### For Contract Owner
```
✅ Connected Address: 0xOwner...
✅ Contract Owner: 0xOwner...
✅ Is Owner Match: YES
❌ User ID: 2 (or any number)
❌ Is First User: NO
✅ Has Admin Access: YES - ACCESS GRANTED
```

### For First User (Not Owner)
```
✅ Connected Address: 0xUser1...
❌ Contract Owner: 0xOwner...
❌ Is Owner Match: NO
✅ User ID: 1
✅ Is First User: YES
✅ Has Admin Access: YES - ACCESS GRANTED
```

### For Other Users
```
✅ Connected Address: 0xUser2...
❌ Contract Owner: 0xOwner...
❌ Is Owner Match: NO
❌ User ID: 2
❌ Is First User: NO
❌ Has Admin Access: NO - ACCESS DENIED
→ Redirected to home page
```

## Still Having Issues?

### Check These Files

1. **`lib/hooks/useIsOwner.ts`**
   - Verify the logic is correct
   - Check console logs are appearing

2. **`app/admin/page.tsx`**
   - Verify redirect logic
   - Check useEffect dependencies

3. **`.env` or `.env.local`**
   - Verify contract address
   - Verify network settings
   - Verify RPC URL

### Environment Variables
```bash
NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=97  # or 56 for mainnet
NEXT_PUBLIC_RPC_URL=https://...
```

### Clear Everything and Retry
```bash
# Stop the dev server
# Clear Next.js cache
rm -rf .next

# Clear node modules (if needed)
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

## Contact Support

If none of these solutions work, provide the following information:

1. **Console logs** from browser (all `useIsOwner:` logs)
2. **Debug component screenshot**
3. **User ID** from contract (via BSCScan)
4. **Contract owner address** (via BSCScan)
5. **Your wallet address**
6. **Network** (testnet/mainnet)
7. **Any error messages**

## Prevention

To avoid this issue in the future:

1. **Register first user immediately** after contract deployment
2. **Document first user address** securely
3. **Test admin access** before going live
4. **Keep debug component** during testing phase
5. **Remove debug component** in production

---

**Last Updated**: 2024
**Version**: 1.0
