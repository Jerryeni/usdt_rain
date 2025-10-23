# Implementation Plan

## Overview

This implementation plan breaks down the completion of the USDT Rain platform into discrete, manageable tasks. Each task builds incrementally on previous work and focuses on replacing mock data with real blockchain data.

---

## Phase 1: Foundation and Cleanup

- [x] 1. Environment Configuration and Validation
  - Create centralized environment configuration module at `lib/config/env.ts`
  - Implement environment variable validation on app startup
  - Add address validation utility functions
  - Update `.env` file with correct USDT contract address
  - Add block explorer URL to environment variables
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Remove Provider System Confusion
  - Remove `usePresale` hook from `hooks/usePresale.ts` or move to archive
  - Remove `PresaleProvider` from `providers/provider.tsx`
  - Remove all imports of `usePresale` from pages
  - Update `app/page.tsx` to use only `useWallet` and USDTRain hooks
  - Remove `lib/web3/provider.ts` if it exists and conflicts with `lib/wallet.tsx`
  - _Requirements: 1.1_

- [x] 3. Create Missing UI Components
  - Create toast notification system at `components/ui/toast.tsx`
  - Create `components/ui/use-toast.ts` hook
  - Create transaction status modal at `components/TransactionModal.tsx`
  - Create loading skeleton components in `components/skeletons/`
  - _Requirements: 10.1, 10.5, 10.6_

---

## Phase 2: Core Hooks Implementation

- [x] 4. Implement useLevelIncome Hook
  - [x] 4.1 Create `lib/hooks/useLevelIncome.ts`
    - Define `LevelIncomeData` interface
    - Implement hook to fetch level income from contract
    - Call `getUserLevelIncome()` for earned amounts
    - Call `getUserLevelWithdrawn()` for withdrawn amounts
    - Call `getUserAvailableLevelIncome()` for available amounts
    - Call `LEVEL_PERCENTAGES()` for each level's percentage
    - Calculate totals across all levels
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Implement useReferrals Hook
  - [x] 5.1 Create `lib/hooks/useReferrals.ts`
    - Define `ReferralData` interface
    - Implement hook to fetch referral data
    - Call `getUserReferrals(userId)` for direct referral IDs
    - Call `getUsersByIds(userIds)` to get referral details
    - Calculate team statistics (total members, active members)
    - Organize referrals by level
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implement useTransactions Hook
  - [x] 6.1 Create `lib/hooks/useTransactions.ts`
    - Define `Transaction` and `TransactionData` interfaces
    - Implement hook with pagination support
    - Call `getUserTransactions(userId)` for all transactions
    - Implement client-side pagination logic
    - Add filtering by transaction type
    - Format transaction data for display
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Implement useWithdraw Hook
  - [x] 7.1 Create `lib/hooks/useWithdraw.ts`
    - Define `WithdrawParams` interface
    - Implement mutation hook for withdrawals
    - Support `withdrawEarnings()` for claiming all
    - Support `withdrawLevelEarnings(level)` for specific level
    - Support `claimNonWorkingIncome()` for non-working income
    - Estimate gas before transaction
    - Handle transaction confirmation
    - Invalidate relevant queries on success
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 8. Implement useUpdateProfile Hook
  - [x] 8.1 Create `lib/hooks/useUpdateProfile.ts`
    - Define `ProfileData` interface
    - Implement mutation hook for profile updates
    - Call `updateProfile(userName, contactNumber)` on contract
    - Validate input before submission
    - Handle transaction confirmation
    - Invalidate user info query on success
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 9. Implement useContractEvents Hook
  - [x] 9.1 Create `lib/hooks/useContractEvents.ts`
    - Define event handler interfaces
    - Set up event listeners for `UserRegistered`
    - Set up event listeners for `UserActivated`
    - Set up event listeners for `LevelIncomePaid`
    - Set up event listeners for `ProfileUpdated`
    - Set up event listeners for `GlobalPoolDistributed`
    - Filter events by connected user address
    - Invalidate React Query cache when relevant events occur
    - Display toast notifications for important events
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

---

## Phase 3: Update Existing Pages with Real Data

- [x] 10. Update Dashboard Page
  - [x] 10.1 Replace mock data with real contract data
    - Remove `usePresale` hook usage
    - Use `useUserInfo(address)` for user data
    - Use `useContractStats()` for platform statistics
    - Use `useLevelIncome(address)` for total earnings display
    - Update earnings card to show real `totalEarned` from contract
    - Update referrals count to show real `directReferrals` from contract
    - Update presale statistics section with real contract stats
    - _Requirements: 2.1, 12.1, 12.2, 12.3, 12.4_
  
  - [x] 10.2 Add loading states and error handling
    - Add skeleton loaders for all data sections
    - Handle wallet not connected state
    - Handle user not registered state
    - Display error messages with retry options
    - _Requirements: 10.5, 10.1, 10.2_

- [x] 11. Update Income Page
  - [x] 11.1 Replace hardcoded level data with real data
    - Remove all mock data arrays
    - Use `useLevelIncome(address)` hook
    - Map real level data to table rows
    - Display actual earned, withdrawn, and available amounts
    - Show correct level percentages from contract
    - Calculate and display totals from real data
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 11.2 Implement claim functionality
    - Connect "Claim All" button to `useWithdraw` hook
    - Connect individual level claim buttons to `useWithdraw` hook
    - Show transaction modal during claim process
    - Display gas estimation before transaction
    - Show transaction status (pending, confirmed, failed)
    - Disable buttons during transaction
    - Refresh data after successful claim
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 11.3 Add loading and error states
    - Add skeleton loader for level income table
    - Handle no earnings state
    - Display error messages for failed fetches
    - Add retry functionality
    - _Requirements: 2.4, 2.5, 10.5_

- [x] 12. Update Referrals Page
  - [x] 12.1 Replace static data with real referral data
    - Remove all mock data
    - Use `useReferrals(userId)` hook
    - Display real total referrals count
    - Display real active members count
    - Calculate real team volume from referral data
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 12.2 Implement level breakdown with real data
    - Fetch referrals for each level (1-10)
    - Display member count per level
    - Display income generated per level
    - Show active vs inactive status
    - _Requirements: 3.3_
  
  - [x] 12.3 Add referral list with details
    - Display list of direct referrals
    - Show referral user ID, address, and name
    - Show join date and activation status
    - Implement pagination for large referral lists
    - _Requirements: 3.2, 3.5_
  
  - [x] 12.4 Add loading and empty states
    - Add skeleton loaders for referral cards
    - Handle no referrals state with helpful message
    - Display error messages for failed fetches
    - _Requirements: 3.5, 10.5_

---

## Phase 4: Implement New Pages

- [x] 13. Implement Transactions Page
  - [x] 13.1 Create transactions page at `app/transactions/page.tsx`
    - Set up page layout with header and navigation
    - Use `useTransactions(userId, page, pageSize)` hook
    - Display transaction list with cards
    - Show transaction type, amount, level, and timestamp
    - Format amounts in USDT with proper decimals
    - _Requirements: 5.1, 5.2_
  
  - [x] 13.2 Implement transaction filtering
    - Add filter dropdown for transaction type
    - Filter by: All, Registration, Activation, Level Income, Withdrawal, Global Pool
    - Apply filters to transaction list
    - _Requirements: 5.4_
  
  - [x] 13.3 Implement pagination
    - Add pagination controls (Previous, Next, Page numbers)
    - Show 20 transactions per page
    - Handle page navigation
    - Display total transaction count
    - _Requirements: 5.3_
  
  - [x] 13.4 Add BSCScan links
    - Add "View on BSCScan" link for each transaction
    - Generate correct BSCScan URL based on network (testnet/mainnet)
    - Open links in new tab
    - _Requirements: 5.5_
  
  - [x] 13.5 Add loading and empty states
    - Add skeleton loaders for transaction cards
    - Handle no transactions state
    - Display error messages for failed fetches
    - _Requirements: 10.5_

- [x] 14. Implement Profile Page
  - [x] 14.1 Create profile page at `app/profile/page.tsx`
    - Set up page layout with header
    - Use `useUserInfo(address)` hook for user data
    - Display user ID, wallet address, and sponsor ID
    - Show registration date and activation date
    - Display achiever level
    - _Requirements: 6.1, 6.7_
  
  - [x] 14.2 Implement profile update form
    - Add input field for username (3-50 characters)
    - Add input field for contact number with validation
    - Add update button
    - Use `useUpdateProfile()` hook for submission
    - Validate inputs before submission
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [x] 14.3 Handle profile update flow
    - Show transaction modal during update
    - Display gas estimation
    - Show transaction status
    - Display success message on confirmation
    - Refresh user data after update
    - _Requirements: 6.5, 6.6_
  
  - [x] 14.4 Add loading and error states
    - Add skeleton loader for profile data
    - Handle form validation errors
    - Display transaction errors
    - _Requirements: 10.1, 10.2, 10.5_

- [x] 15. Implement Share Page
  - [x] 15.1 Create share page at `app/share/page.tsx`
    - Set up page layout with header
    - Use `useUserInfo(address)` to get user ID
    - Generate referral link with user ID as query parameter
    - Display referral link in a card
    - _Requirements: 9.1_
  
  - [x] 15.2 Implement copy to clipboard
    - Add "Copy Link" button
    - Copy referral link to clipboard on click
    - Show success toast notification
    - _Requirements: 9.2, 9.3_
  
  - [x] 15.3 Add social sharing buttons
    - Add WhatsApp share button with pre-filled message
    - Add Telegram share button
    - Add Twitter share button
    - Add Facebook share button
    - Generate correct share URLs for each platform
    - _Requirements: 9.4_
  
  - [x] 15.4 Display referral statistics
    - Use `useReferrals(userId)` hook
    - Show total referrals count
    - Show active referrals count
    - Calculate and display earnings from referrals
    - _Requirements: 9.5_
  
  - [x] 15.5 Generate QR code
    - Install QR code library (`qrcode.react`)
    - Generate QR code containing referral link
    - Display QR code in card
    - Add download QR code button
    - _Requirements: 9.6_

- [x] 16. Implement Register Page
  - [x] 16.1 Create register page at `app/register/page.tsx`
    - Set up page layout with header
    - Check if user is already registered using `useUserInfo(address)`
    - Redirect to dashboard if already registered
    - Extract sponsor ID from URL query parameter `?ref=123`
    - _Requirements: 7.1, 7.2_
  
  - [x] 16.2 Implement sponsor ID validation
    - Add input field for sponsor ID
    - Pre-fill with URL parameter if present
    - Validate sponsor ID exists using `getUserIdByAddress()`
    - Display validation error if sponsor doesn't exist
    - _Requirements: 7.3, 7.4_
  
  - [x] 16.3 Display sponsor information
    - Fetch sponsor details when valid ID entered
    - Show sponsor name and ID
    - Display sponsor's achiever level
    - _Requirements: 7.4_
  
  - [x] 16.4 Implement registration flow
    - Add terms and conditions checkbox
    - Add register button
    - Use `useRegisterUser()` hook for submission
    - Show transaction modal during registration
    - Display transaction status
    - _Requirements: 7.5, 7.6_
  
  - [x] 16.5 Handle post-registration
    - Show success message on confirmation
    - Redirect to activation page after successful registration
    - _Requirements: 7.7_

---

## Phase 5: Event Listeners and Real-Time Updates

- [x] 17. Integrate Event Listeners Across App
  - [x] 17.1 Add event listeners to Dashboard
    - Use `useContractEvents` hook in Dashboard
    - Listen for `LevelIncomePaid` events
    - Show toast notification when income received
    - Invalidate and refetch user data
    - _Requirements: 8.5, 8.6, 8.7_
  
  - [x] 17.2 Add event listeners to Income Page
    - Listen for `LevelIncomePaid` events
    - Update level income data automatically
    - Show notification for new income
    - _Requirements: 8.3, 8.6_
  
  - [x] 17.3 Add event listeners to Referrals Page
    - Listen for `UserRegistered` events
    - Update referral count when new referral joins
    - Show notification for new referral
    - _Requirements: 8.1, 8.6_
  
  - [x] 17.4 Add event listeners to Profile Page
    - Listen for `ProfileUpdated` events
    - Update displayed profile data
    - Show confirmation notification
    - _Requirements: 8.4, 8.6_

---

## Phase 6: Polish and User Experience

- [x] 18. Implement Comprehensive Error Handling
  - [x] 18.1 Create centralized error handler
    - Create `lib/utils/errorHandler.ts`
    - Map contract errors to user-friendly messages
    - Handle wallet errors (not installed, locked, wrong network)
    - Handle contract errors (insufficient balance, not registered, etc.)
    - Handle network errors (RPC failed, timeout)
    - _Requirements: 10.1, 10.2_
  
  - [x] 18.2 Add error boundaries
    - Create error boundary component
    - Wrap main app with error boundary
    - Display fallback UI for caught errors
    - Log errors to console
    - _Requirements: 10.3_
  
  - [x] 18.3 Implement retry mechanisms
    - Add retry button to error states
    - Implement exponential backoff for failed requests
    - Show retry count to user
    - _Requirements: 10.2_

- [x] 19. Add Loading States Everywhere
  - [x] 19.1 Add loading states to all data fetching
    - Use skeleton loaders for dashboard cards
    - Use skeleton loaders for income table
    - Use skeleton loaders for referral cards
    - Use skeleton loaders for transaction cards
    - Use skeleton loaders for profile data
    - _Requirements: 10.5_
  
  - [x] 19.2 Add transaction loading states
    - Show "Estimating gas..." state
    - Show "Waiting for signature..." state
    - Show "Transaction pending..." state with spinner
    - Show "Confirming..." state with block count
    - _Requirements: 10.5, 10.6_

- [x] 20. Implement Toast Notifications
  - [x] 20.1 Add success notifications
    - Show toast for successful wallet connection
    - Show toast for successful registration
    - Show toast for successful activation
    - Show toast for successful withdrawal
    - Show toast for successful profile update
    - Show toast for successful copy to clipboard
    - _Requirements: 10.6_
  
  - [x] 20.2 Add error notifications
    - Show toast for failed transactions
    - Show toast for network errors
    - Show toast for validation errors
    - Include error details and suggested actions
    - _Requirements: 10.1, 10.2_
  
  - [x] 20.3 Add info notifications
    - Show toast for new income received
    - Show toast for new referral joined
    - Show toast for network switch required
    - _Requirements: 8.6, 8.7_

- [x] 21. Implement Transaction Modals
  - [x] 21.1 Create transaction confirmation modal
    - Show transaction details before confirmation
    - Display amount, recipient, and gas estimate
    - Show estimated gas cost in BNB and USD
    - Add confirm and cancel buttons
    - _Requirements: 4.3, 14.2, 14.3_
  
  - [x] 21.2 Create transaction status modal
    - Show modal during transaction processing
    - Display current status (signing, pending, confirming)
    - Show transaction hash with BSCScan link
    - Show block confirmations count
    - Auto-close on success or show error on failure
    - _Requirements: 4.5, 10.6_

- [x] 22. Optimize Performance
  - [x] 22.1 Configure React Query optimally
    - Set appropriate staleTime for each query
    - Set appropriate cacheTime for each query
    - Disable refetchOnWindowFocus for expensive queries
    - Implement query key factories for consistency
    - _Requirements: Performance optimization_
  
  - [x] 22.2 Implement data prefetching
    - Prefetch user data on wallet connection
    - Prefetch referral data on hover
    - Prefetch transaction data on page navigation
    - _Requirements: Performance optimization_
  
  - [x] 22.3 Optimize component rendering
    - Add React.memo to expensive components
    - Optimize dependency arrays in useEffect and useCallback
    - Implement virtual scrolling for long lists
    - Lazy load heavy components
    - _Requirements: Performance optimization_

---

## Phase 7: Testing and Bug Fixes

- [ ] 23. End-to-End Testing
  - [ ] 23.1 Test complete user journey
    - Test wallet connection flow
    - Test registration with sponsor ID
    - Test account activation with USDT
    - Test viewing income and referrals
    - Test withdrawal process
    - Test profile update
    - Test referral link sharing
    - _Requirements: All requirements_
  
  - [ ] 23.2 Test error scenarios
    - Test with wallet not installed
    - Test with wrong network
    - Test with insufficient balance
    - Test with invalid sponsor ID
    - Test with network disconnection
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 23.3 Test edge cases
    - Test with no referrals
    - Test with zero balance
    - Test with maximum referrals
    - Test with very old transactions
    - Test with special characters in profile
    - _Requirements: All requirements_

- [ ] 24. Mobile Responsiveness Testing
  - [ ] 24.1 Test on various screen sizes
    - Test on 320px width (iPhone SE)
    - Test on 375px width (iPhone 12)
    - Test on 768px width (iPad)
    - Test on 1024px width (iPad Pro)
    - Test on 1920px width (Desktop)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 24.2 Test touch interactions
    - Test all buttons have adequate touch targets
    - Test modals work on mobile
    - Test forms work on mobile keyboards
    - Test navigation works on mobile
    - _Requirements: 13.3_

- [ ] 25. Fix Bugs and Polish
  - [ ] 25.1 Fix any discovered bugs
    - Document all bugs found during testing
    - Prioritize bugs by severity
    - Fix critical bugs first
    - Fix UI/UX issues
    - _Requirements: All requirements_
  
  - [ ] 25.2 Polish UI/UX
    - Ensure consistent spacing and alignment
    - Ensure consistent color scheme
    - Ensure consistent typography
    - Add smooth transitions and animations
    - Improve accessibility (ARIA labels, keyboard navigation)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

---

## Phase 8: Documentation and Deployment

- [x] 26. Update Documentation
  - [x] 26.1 Update README.md
    - Document all features
    - Add setup instructions
    - Add environment variable documentation
    - Add troubleshooting section
    - _Requirements: Documentation_
  
  - [x] 26.2 Add code comments
    - Add JSDoc comments to all hooks
    - Add comments to complex logic
    - Document component props
    - _Requirements: Documentation_

- [x] 27. Prepare for Deployment
  - [x] 27.1 Environment configuration
    - Create `.env.example` with all required variables
    - Document environment setup for production
    - Verify all contract addresses are correct
    - _Requirements: 1.1, 1.2_
  
  - [x] 27.2 Build and test production build
    - Run `npm run build`
    - Test production build locally
    - Verify all features work in production mode
    - Check bundle size and optimize if needed
    - _Requirements: Deployment_
  
  - [x] 27.3 Deploy to production
    - Deploy to Vercel or chosen hosting platform
    - Configure environment variables
    - Test deployed application
    - Monitor for errors
    - _Requirements: Deployment_

---

## Summary

**Total Tasks:** 27 main tasks with 80+ sub-tasks

**Estimated Timeline:**
- Phase 1-2: 2-3 days (Foundation and Core Hooks)
- Phase 3: 2-3 days (Update Existing Pages)
- Phase 4: 3-4 days (Implement New Pages)
- Phase 5: 1-2 days (Event Listeners)
- Phase 6: 2-3 days (Polish and UX)
- Phase 7: 2-3 days (Testing)
- Phase 8: 1 day (Documentation and Deployment)

**Total Estimated Time:** 13-19 days

**Priority Order:**
1. Phase 1 (Foundation) - Critical
2. Phase 2 (Core Hooks) - Critical
3. Phase 3 (Update Pages) - High
4. Phase 4 (New Pages) - High
5. Phase 5 (Events) - Medium
6. Phase 6 (Polish) - Medium
7. Phase 7 (Testing) - High
8. Phase 8 (Deployment) - Critical
