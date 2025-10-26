# USDT RAIN - Testing Guide

## Testing Overview

This guide provides comprehensive testing procedures for the USDT Rain platform.

## Pre-Testing Setup

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure for BSC Testnet
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

### 2. Get Test Tokens
- Get test BNB from [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- Get test USDT (swap or from faucet)
- Ensure you have at least 0.1 BNB for gas
- Ensure you have at least 20 USDT for testing

### 3. Wallet Setup
- Install MetaMask
- Add BSC Testnet network
- Import test account with funds

## Manual Testing Checklist

### Phase 1: Wallet Connection

#### Test 1.1: Connect Wallet
- [ ] Click "Connect" button
- [ ] MetaMask popup appears
- [ ] Select account and approve
- [ ] Wallet address displays correctly
- [ ] Status shows "Connected"
- [ ] Network indicator shows correct network

**Expected Result**: Wallet connects successfully, address displayed

#### Test 1.2: Wrong Network
- [ ] Connect wallet on wrong network (e.g., Ethereum Mainnet)
- [ ] Error message displays
- [ ] "Switch Network" button appears
- [ ] Click switch network
- [ ] MetaMask prompts network switch
- [ ] After switch, app works correctly

**Expected Result**: Clear error message, easy network switching

#### Test 1.3: Wallet Not Installed
- [ ] Test in browser without MetaMask
- [ ] "Install MetaMask" message displays
- [ ] Click install button
- [ ] Opens MetaMask website in new tab

**Expected Result**: Clear instructions to install wallet

#### Test 1.4: Disconnect Wallet
- [ ] Click disconnect button (in profile or sidebar)
- [ ] Confirm disconnection
- [ ] Address clears
- [ ] Status shows "Not Connected"
- [ ] App returns to read-only mode

**Expected Result**: Clean disconnection, no errors

### Phase 2: Registration

#### Test 2.1: Register with Valid Sponsor
- [ ] Navigate to `/register`
- [ ] Enter valid sponsor ID
- [ ] Sponsor information displays
- [ ] Accept terms and conditions
- [ ] Click "Register"
- [ ] Transaction modal appears
- [ ] Confirm in MetaMask
- [ ] Success toast displays
- [ ] Redirects to activation page

**Expected Result**: Successful registration, user ID assigned

#### Test 2.2: Register with Invalid Sponsor
- [ ] Enter non-existent sponsor ID
- [ ] Error message displays
- [ ] Register button disabled
- [ ] Cannot proceed

**Expected Result**: Clear error, cannot register

#### Test 2.3: Register with URL Parameter
- [ ] Visit `/register?ref=123`
- [ ] Sponsor ID pre-filled
- [ ] Sponsor info loads automatically
- [ ] Can proceed with registration

**Expected Result**: Sponsor ID auto-populated

#### Test 2.4: Already Registered
- [ ] Try to register again
- [ ] Error message displays
- [ ] Redirects to dashboard

**Expected Result**: Cannot register twice

### Phase 3: Account Activation

#### Test 3.1: Activate Account
- [ ] Navigate to activation page
- [ ] Balance shows current USDT
- [ ] Click "Activate" button
- [ ] Approve USDT spending (if first time)
- [ ] Confirm activation transaction
- [ ] Wait for confirmation
- [ ] Success toast displays
- [ ] Account status updates to "Active"

**Expected Result**: Account activated, 10 USDT deducted

#### Test 3.2: Insufficient Balance
- [ ] Try to activate with < 10 USDT
- [ ] Error message displays
- [ ] Transaction fails gracefully
- [ ] Helpful message about adding funds

**Expected Result**: Clear error, no transaction sent

#### Test 3.3: Already Activated
- [ ] Try to activate again
- [ ] Error or redirect
- [ ] Cannot activate twice

**Expected Result**: Prevents double activation

### Phase 4: Dashboard

#### Test 4.1: View Dashboard Data
- [ ] Navigate to dashboard
- [ ] Total earnings displays correctly
- [ ] Referral count displays
- [ ] Platform statistics load
- [ ] All cards show real data
- [ ] No loading errors

**Expected Result**: All data displays correctly

#### Test 4.2: Dashboard Loading States
- [ ] Refresh page
- [ ] Skeleton loaders appear
- [ ] Data loads progressively
- [ ] No layout shift
- [ ] Smooth transitions

**Expected Result**: Good loading experience

#### Test 4.3: Dashboard Error States
- [ ] Disconnect internet
- [ ] Error messages display
- [ ] Retry buttons appear
- [ ] Click retry
- [ ] Data loads after reconnection

**Expected Result**: Graceful error handling

### Phase 5: Income Page

#### Test 5.1: View Level Income
- [ ] Navigate to `/income`
- [ ] All 10 levels display
- [ ] Percentages correct (5%, 4%, 3%, etc.)
- [ ] Earned amounts show
- [ ] Available amounts show
- [ ] Totals calculate correctly

**Expected Result**: Accurate income breakdown

#### Test 5.2: Claim All Earnings
- [ ] Click "Claim All" button
- [ ] Transaction modal appears
- [ ] Gas estimate displays
- [ ] Confirm transaction
- [ ] Wait for confirmation
- [ ] Success toast displays
- [ ] Balances update
- [ ] Available amounts reset to 0

**Expected Result**: All earnings claimed successfully

#### Test 5.3: Claim Individual Level
- [ ] Click "Claim" on specific level
- [ ] Transaction modal appears
- [ ] Confirm transaction
- [ ] Success toast displays
- [ ] That level's available resets
- [ ] Other levels unchanged

**Expected Result**: Individual level claimed

#### Test 5.4: Claim with No Earnings
- [ ] Try to claim with 0 available
- [ ] Button disabled or error message
- [ ] No transaction sent

**Expected Result**: Cannot claim zero

### Phase 6: Referrals Page

#### Test 6.1: View Referral Network
- [ ] Navigate to `/referrals`
- [ ] Total referrals count displays
- [ ] Active members count displays
- [ ] Team volume displays
- [ ] Level breakdown shows

**Expected Result**: Complete referral overview

#### Test 6.2: View Direct Referrals
- [ ] Direct referrals list displays
- [ ] Each referral shows:
  - User ID
  - Address
  - Name
  - Join date
  - Status (active/inactive)
  - Earnings
- [ ] Pagination works (if many referrals)

**Expected Result**: Detailed referral information

#### Test 6.3: Empty Referrals State
- [ ] Test with account that has no referrals
- [ ] Helpful message displays
- [ ] "Share Link" button appears
- [ ] No errors

**Expected Result**: Good empty state UX

### Phase 7: Transactions Page

#### Test 7.1: View Transaction History
- [ ] Navigate to `/transactions`
- [ ] All transactions display
- [ ] Each shows:
  - Type
  - Amount
  - Date/time
  - Status
- [ ] Sorted by date (newest first)

**Expected Result**: Complete transaction history

#### Test 7.2: Filter Transactions
- [ ] Click filter dropdown
- [ ] Select "Registration"
- [ ] Only registration transactions show
- [ ] Try other filters
- [ ] "All" shows everything

**Expected Result**: Filtering works correctly

#### Test 7.3: Transaction Pagination
- [ ] Navigate through pages
- [ ] 20 transactions per page
- [ ] Page numbers work
- [ ] Previous/Next buttons work
- [ ] Total count displays

**Expected Result**: Smooth pagination

#### Test 7.4: BSCScan Links
- [ ] Click "View on BSCScan"
- [ ] Opens in new tab
- [ ] Correct transaction on BSCScan
- [ ] All links work

**Expected Result**: Links to correct transactions

### Phase 8: Profile Page

#### Test 8.1: View Profile
- [ ] Navigate to `/profile`
- [ ] User ID displays
- [ ] Wallet address displays
- [ ] Sponsor ID displays
- [ ] Username displays
- [ ] Contact number displays
- [ ] Account stats display

**Expected Result**: Complete profile information

#### Test 8.2: Update Profile
- [ ] Click "Edit" button
- [ ] Enter new username
- [ ] Enter new contact number
- [ ] Click "Save"
- [ ] Transaction modal appears
- [ ] Confirm transaction
- [ ] Success toast displays
- [ ] Profile updates

**Expected Result**: Profile updated successfully

#### Test 8.3: Profile Validation
- [ ] Try username < 3 characters
- [ ] Error message displays
- [ ] Try username > 50 characters
- [ ] Error message displays
- [ ] Try invalid contact number
- [ ] Error message displays

**Expected Result**: Proper validation

### Phase 9: Share Page

#### Test 9.1: View Referral Link
- [ ] Navigate to `/share`
- [ ] Referral link displays
- [ ] Contains correct user ID
- [ ] QR code generates
- [ ] Statistics display

**Expected Result**: Complete sharing tools

#### Test 9.2: Copy Referral Link
- [ ] Click "Copy Link" button
- [ ] Success toast displays
- [ ] Link copied to clipboard
- [ ] Paste and verify correct

**Expected Result**: Link copied successfully

#### Test 9.3: Social Sharing
- [ ] Click WhatsApp button
- [ ] Opens WhatsApp with pre-filled message
- [ ] Click Telegram button
- [ ] Opens Telegram share
- [ ] Click Twitter button
- [ ] Opens Twitter compose
- [ ] Click Facebook button
- [ ] Opens Facebook share

**Expected Result**: All social shares work

#### Test 9.4: QR Code
- [ ] QR code displays
- [ ] Scan with phone
- [ ] Opens correct referral link
- [ ] Click download
- [ ] QR code downloads

**Expected Result**: QR code functional

### Phase 10: Real-Time Updates

#### Test 10.1: Income Event
- [ ] Have someone activate under you
- [ ] Toast notification appears
- [ ] Income page updates automatically
- [ ] Dashboard updates
- [ ] No page refresh needed

**Expected Result**: Real-time income updates

#### Test 10.2: Referral Event
- [ ] Someone registers with your link
- [ ] Toast notification appears
- [ ] Referral count updates
- [ ] Referrals page updates

**Expected Result**: Real-time referral updates

#### Test 10.3: Profile Event
- [ ] Update profile
- [ ] Profile page updates immediately
- [ ] No manual refresh needed

**Expected Result**: Instant profile updates

### Phase 11: Error Scenarios

#### Test 11.1: Network Disconnection
- [ ] Disconnect internet mid-session
- [ ] Error messages display
- [ ] Retry buttons appear
- [ ] Reconnect internet
- [ ] Click retry
- [ ] App recovers

**Expected Result**: Graceful degradation

#### Test 11.2: Transaction Rejection
- [ ] Start transaction
- [ ] Reject in MetaMask
- [ ] Error message displays
- [ ] Can retry
- [ ] No stuck state

**Expected Result**: Clean error handling

#### Test 11.3: Insufficient Gas
- [ ] Try transaction with low BNB
- [ ] Error message displays
- [ ] Suggests adding BNB
- [ ] Transaction doesn't send

**Expected Result**: Clear gas error

#### Test 11.4: Contract Error
- [ ] Try invalid operation
- [ ] User-friendly error displays
- [ ] Not technical jargon
- [ ] Actionable suggestion

**Expected Result**: Helpful error messages

### Phase 12: Mobile Responsiveness

#### Test 12.1: Mobile Layout
- [ ] Test on iPhone SE (320px)
- [ ] Test on iPhone 12 (375px)
- [ ] Test on iPad (768px)
- [ ] All pages responsive
- [ ] No horizontal scroll
- [ ] Touch targets adequate

**Expected Result**: Works on all devices

#### Test 12.2: Mobile Navigation
- [ ] Bottom navigation works
- [ ] Sidebar opens/closes
- [ ] All buttons clickable
- [ ] Forms usable
- [ ] Modals display correctly

**Expected Result**: Good mobile UX

#### Test 12.3: Mobile Wallet
- [ ] Connect wallet on mobile
- [ ] MetaMask app opens
- [ ] Approve connection
- [ ] Returns to app
- [ ] Transactions work

**Expected Result**: Mobile wallet integration works

## Performance Testing

### Load Time Testing
- [ ] Dashboard loads < 3 seconds
- [ ] Income page loads < 2 seconds
- [ ] Referrals page loads < 2 seconds
- [ ] Transactions page loads < 2 seconds
- [ ] No unnecessary re-renders

### Network Testing
- [ ] Test on slow 3G
- [ ] Loading states appear
- [ ] Data loads eventually
- [ ] No timeouts

### Stress Testing
- [ ] Test with 100+ referrals
- [ ] Test with 1000+ transactions
- [ ] Pagination handles large datasets
- [ ] No performance degradation

## Security Testing

### Input Validation
- [ ] SQL injection attempts fail
- [ ] XSS attempts fail
- [ ] Invalid addresses rejected
- [ ] Bounds checking works

### Transaction Security
- [ ] Cannot claim others' earnings
- [ ] Cannot register with invalid sponsor
- [ ] Cannot activate twice
- [ ] Cannot withdraw more than available

### Data Privacy
- [ ] No sensitive data in URLs
- [ ] No sensitive data in console
- [ ] No sensitive data in errors
- [ ] Proper data sanitization

## Regression Testing

After any code changes, re-test:
- [ ] Wallet connection
- [ ] Registration flow
- [ ] Activation flow
- [ ] Income claiming
- [ ] Profile updates
- [ ] Referral tracking
- [ ] Transaction history

## Bug Reporting Template

```markdown
**Bug Title**: Brief description

**Environment**:
- Browser: Chrome 120
- Device: Desktop/Mobile
- Network: BSC Testnet/Mainnet
- Wallet: MetaMask 11.0

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happened

**Screenshots**:
[Attach screenshots]

**Console Errors**:
[Paste console errors]

**Additional Context**:
Any other relevant information
```

## Test Completion Checklist

- [ ] All Phase 1 tests passed
- [ ] All Phase 2 tests passed
- [ ] All Phase 3 tests passed
- [ ] All Phase 4 tests passed
- [ ] All Phase 5 tests passed
- [ ] All Phase 6 tests passed
- [ ] All Phase 7 tests passed
- [ ] All Phase 8 tests passed
- [ ] All Phase 9 tests passed
- [ ] All Phase 10 tests passed
- [ ] All Phase 11 tests passed
- [ ] All Phase 12 tests passed
- [ ] Performance tests passed
- [ ] Security tests passed
- [ ] No critical bugs found
- [ ] All bugs documented
- [ ] Ready for deployment

## Post-Testing

### Documentation
- Document all bugs found
- Create bug fix tickets
- Update test cases
- Note any improvements needed

### Sign-Off
- [ ] Developer tested
- [ ] QA tested
- [ ] Product owner approved
- [ ] Ready for production
