# Requirements Document

## Introduction

This document outlines the requirements for completing the USDT Rain Web3 MLM platform. The platform enables users to participate in a multi-level marketing system on BSC (Binance Smart Chain), earn income through referrals, activate accounts with USDT, and manage their earnings through a modern web interface.

## Glossary

- **System**: The USDT Rain Web3 application
- **USDTRain Contract**: The smart contract deployed on BSC that manages user registrations, activations, and income distribution
- **User**: An individual who connects their wallet and interacts with the System
- **Sponsor**: A User who refers another User to the System
- **Level Income**: Earnings distributed based on the User's position in the referral hierarchy
- **Global Pool**: A shared pool of funds distributed among eligible Users
- **Activation**: The process of depositing USDT to unlock full System features
- **Wallet**: A Web3 wallet (MetaMask) used to interact with the System
- **Transaction**: A blockchain transaction or System activity record

## Requirements

### Requirement 1: Environment Configuration and Contract Setup

**User Story:** As a developer, I want proper environment configuration so that the System connects to the correct smart contracts and network.

#### Acceptance Criteria

1. WHEN the System initializes, THE System SHALL load all required contract addresses from environment variables
2. IF any required environment variable is missing, THEN THE System SHALL display a clear error message indicating which variable is missing
3. THE System SHALL validate that all contract addresses follow the hexadecimal format (0x followed by 40 characters)
4. THE System SHALL connect to the BSC network specified in the NEXT_PUBLIC_CHAIN_ID environment variable
5. WHERE the User's wallet is connected to a different network, THE System SHALL prompt the User to switch to the correct network

### Requirement 2: Real-Time Data Integration for Income Display

**User Story:** As a User, I want to see my actual income data from the blockchain so that I can track my earnings accurately.

#### Acceptance Criteria

1. WHEN the User navigates to the income page, THE System SHALL fetch the User's level income data from the USDTRain Contract
2. THE System SHALL display earned amounts, withdrawn amounts, and available amounts for each of the 10 levels
3. THE System SHALL calculate and display the total earned, total withdrawn, and total available amounts
4. WHILE the data is loading, THE System SHALL display loading indicators for each data field
5. IF the data fetch fails, THEN THE System SHALL display an error message and provide a retry option

### Requirement 3: Referral Data Integration and Visualization

**User Story:** As a User, I want to see my referral network and team statistics so that I can understand my team's performance.

#### Acceptance Criteria

1. WHEN the User navigates to the referrals page, THE System SHALL fetch the User's direct referrals from the USDTRain Contract
2. THE System SHALL display the count of direct referrals and total team members
3. THE System SHALL fetch and display referral data for each level (1-10) including member count and income generated
4. THE System SHALL calculate and display team volume statistics
5. WHERE the User has no referrals, THE System SHALL display an empty state with instructions to share their referral link

### Requirement 4: Withdrawal and Claim Functionality

**User Story:** As a User, I want to withdraw my available earnings so that I can access my funds.

#### Acceptance Criteria

1. THE System SHALL provide a button to claim all available earnings
2. WHEN the User clicks the claim all button, THE System SHALL estimate gas costs before proceeding
3. THE System SHALL display a confirmation modal showing the amount to be claimed and estimated gas fees
4. WHEN the User confirms the withdrawal, THE System SHALL call the withdrawEarnings function on the USDTRain Contract
5. THE System SHALL display transaction status (pending, confirmed, failed) to the User
6. WHEN the transaction is confirmed, THE System SHALL update the displayed balances
7. THE System SHALL provide individual claim buttons for each level's available income
8. IF the User has no available balance, THEN THE System SHALL disable the claim buttons

### Requirement 5: Transaction History Implementation

**User Story:** As a User, I want to view my transaction history so that I can track all my System activities.

#### Acceptance Criteria

1. WHEN the User navigates to the transactions page, THE System SHALL fetch the User's transaction history from the USDTRain Contract
2. THE System SHALL display transactions with type, amount, level, and timestamp
3. THE System SHALL support pagination for transaction history with 20 transactions per page
4. THE System SHALL provide filtering options by transaction type (registration, activation, level income, withdrawal, global pool)
5. THE System SHALL display transaction status and provide links to view transactions on BSCScan

### Requirement 6: User Profile Management

**User Story:** As a User, I want to update my profile information so that my contacts can identify me in the System.

#### Acceptance Criteria

1. WHEN the User navigates to the profile page, THE System SHALL display the User's current profile information
2. THE System SHALL provide input fields for username and contact number
3. WHEN the User submits profile updates, THE System SHALL validate that username is between 3 and 50 characters
4. WHEN the User submits profile updates, THE System SHALL validate that contact number follows a valid format
5. THE System SHALL call the updateProfile function on the USDTRain Contract with the new information
6. WHEN the profile update is confirmed, THE System SHALL display a success message
7. THE System SHALL display the User's ID, sponsor ID, registration date, and activation status

### Requirement 7: User Registration Flow

**User Story:** As a new User, I want to register with a sponsor ID so that I can join the System under my referrer.

#### Acceptance Criteria

1. WHERE the User's wallet is connected and the User is not registered, THE System SHALL display a registration interface
2. THE System SHALL extract the sponsor ID from the URL query parameter "ref" if present
3. THE System SHALL provide an input field for the User to enter a sponsor ID
4. THE System SHALL validate that the sponsor ID exists in the USDTRain Contract before allowing registration
5. WHEN the User submits registration, THE System SHALL call the registerUser function on the USDTRain Contract
6. THE System SHALL display transaction status during registration
7. WHEN registration is confirmed, THE System SHALL redirect the User to the activation page

### Requirement 8: Real-Time Event Listening and UI Updates

**User Story:** As a User, I want the interface to update automatically when blockchain events occur so that I see changes without refreshing.

#### Acceptance Criteria

1. THE System SHALL listen for UserRegistered events from the USDTRain Contract
2. THE System SHALL listen for UserActivated events from the USDTRain Contract
3. THE System SHALL listen for LevelIncomePaid events from the USDTRain Contract
4. THE System SHALL listen for ProfileUpdated events from the USDTRain Contract
5. WHEN a relevant event is detected for the connected User, THE System SHALL invalidate cached data and refetch
6. THE System SHALL display a notification when new income is received
7. THE System SHALL update displayed statistics when contract state changes

### Requirement 9: Referral Link Sharing

**User Story:** As a User, I want to share my referral link so that I can invite others to join under my sponsorship.

#### Acceptance Criteria

1. WHEN the User navigates to the share page, THE System SHALL generate a referral link containing the User's ID
2. THE System SHALL provide a button to copy the referral link to clipboard
3. WHEN the User clicks the copy button, THE System SHALL copy the link and display a confirmation message
4. THE System SHALL provide social sharing buttons for WhatsApp, Telegram, Twitter, and Facebook
5. THE System SHALL display the User's referral statistics (total referrals, active referrals, earnings from referrals)
6. THE System SHALL generate a QR code containing the referral link

### Requirement 10: Error Handling and User Feedback

**User Story:** As a User, I want clear error messages and feedback so that I understand what's happening and can resolve issues.

#### Acceptance Criteria

1. WHEN a transaction fails, THE System SHALL display the error reason in user-friendly language
2. THE System SHALL provide specific guidance for common errors (insufficient balance, wrong network, rejected transaction)
3. THE System SHALL implement error boundaries to catch and display React errors gracefully
4. THE System SHALL log errors to the console for debugging purposes
5. THE System SHALL display loading states for all asynchronous operations
6. WHEN a transaction is pending, THE System SHALL disable action buttons to prevent duplicate submissions
7. THE System SHALL display success messages with transaction hashes for completed operations

### Requirement 11: Wallet Connection Management

**User Story:** As a User, I want seamless wallet connection management so that I can easily connect and disconnect my wallet.

#### Acceptance Criteria

1. WHEN the User clicks connect wallet, THE System SHALL request account access from the Wallet
2. IF the Wallet is not installed, THEN THE System SHALL display installation instructions with a link to MetaMask
3. WHEN the User's account changes in the Wallet, THE System SHALL detect the change and update the displayed address
4. WHEN the User disconnects their Wallet, THE System SHALL clear all User-specific data from the interface
5. THE System SHALL persist wallet connection state across page refreshes where possible
6. THE System SHALL display the connected wallet address in a shortened format (0x1234...5678)

### Requirement 12: Contract Statistics Dashboard

**User Story:** As a User, I want to see overall System statistics so that I can understand the platform's growth and activity.

#### Acceptance Criteria

1. THE System SHALL fetch and display total registered users from the USDTRain Contract
2. THE System SHALL fetch and display total activated users from the USDTRain Contract
3. THE System SHALL fetch and display global pool balance from the USDTRain Contract
4. THE System SHALL fetch and display total distributed amount from the USDTRain Contract
5. THE System SHALL update these statistics every 5 minutes automatically
6. THE System SHALL display these statistics on the dashboard page

### Requirement 13: Mobile Responsiveness

**User Story:** As a User on a mobile device, I want the interface to work smoothly so that I can use the System on any device.

#### Acceptance Criteria

1. THE System SHALL display correctly on screen widths from 320px to 2560px
2. THE System SHALL provide a mobile-optimized navigation menu
3. THE System SHALL ensure all buttons and interactive elements have minimum touch target size of 44x44 pixels
4. THE System SHALL optimize font sizes for readability on mobile devices
5. THE System SHALL ensure modals and popups are usable on mobile screens

### Requirement 14: Gas Optimization and Estimation

**User Story:** As a User, I want to see estimated gas costs before transactions so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN the User initiates a transaction, THE System SHALL estimate the gas cost
2. THE System SHALL display the estimated gas cost in BNB and USD equivalent
3. THE System SHALL add a 20% buffer to gas estimates to prevent transaction failures
4. IF gas estimation fails, THEN THE System SHALL use default gas limits and warn the User
5. THE System SHALL allow the User to proceed or cancel after seeing gas estimates
