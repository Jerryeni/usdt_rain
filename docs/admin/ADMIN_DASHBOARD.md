# Admin Dashboard

## Overview

The Admin Dashboard provides contract owners with comprehensive tools to manage and monitor the USDT Rain platform. This dashboard is restricted to the contract owner address only.

## Access

**URL:** `/admin`

**Requirements:**
- Must be connected with the contract owner wallet
- Only the owner address can execute admin functions

## Features

### 1. Contract Statistics

Real-time monitoring of key platform metrics:

- **Total Users**: Total number of registered users
- **Active Users**: Number of activated users
- **Global Pool**: Current global pool balance
- **Total Distributed**: Total amount distributed to users
- **Eligible Users**: Number of users eligible for global pool
- **Contract Balance**: Total USDT balance in the contract

### 2. Contract Controls

#### Pause Contract
- Temporarily halt all contract operations
- Use during maintenance or emergency situations
- Users cannot perform any transactions while paused

#### Unpause Contract
- Resume normal contract operations
- Re-enable all user functions

#### Distribute Global Pool
- Manually trigger global pool distribution
- Distributes accumulated pool balance to eligible users
- Useful for scheduled distributions

#### Update Eligible Users
- Recalculate the count of eligible users for global pool
- Ensures accurate distribution calculations

#### Emergency Withdraw
- **⚠️ CRITICAL FUNCTION**
- Withdraws all USDT from the contract to owner
- Use only in extreme emergency situations
- Requires confirmation before execution

### 3. Configuration

#### Distribution Percentages
Update how activation fees are distributed:
- **Level Income %**: Percentage allocated to upline commissions
- **Global Pool %**: Percentage added to global pool
- **Reserve %**: Percentage sent to reserve wallet

**Note:** Total must equal 100%

#### Reserve Wallet
- Update the address that receives reserve funds
- Enter new wallet address and confirm

#### Transfer Ownership
- **⚠️ IRREVERSIBLE ACTION**
- Transfer contract ownership to a new address
- Requires double confirmation
- New owner will have full admin access

## Security Considerations

1. **Access Control**: All admin functions check for owner address
2. **Confirmations**: Critical actions require user confirmation
3. **Transaction Monitoring**: All actions show transaction status
4. **Error Handling**: Clear error messages for failed transactions

## Usage Guidelines

### Best Practices

1. **Regular Monitoring**: Check statistics daily
2. **Scheduled Distributions**: Distribute global pool at regular intervals
3. **Backup Owner**: Consider multi-sig for ownership
4. **Test First**: Test configuration changes on testnet first

### Emergency Procedures

If issues arise:

1. **Pause Contract** immediately
2. Investigate the issue
3. Apply fixes if needed
4. **Unpause Contract** when resolved

### Maintenance Schedule

Recommended routine:
- **Daily**: Check statistics and contract balance
- **Weekly**: Distribute global pool
- **Monthly**: Review distribution percentages
- **Quarterly**: Audit contract performance

## Transaction Flow

All admin actions follow this flow:

1. **Estimating**: Calculate gas fees
2. **Signing**: User confirms in wallet
3. **Pending**: Transaction submitted to blockchain
4. **Confirmed**: Transaction successful

Failed transactions show detailed error messages.

## Technical Details

### Contract Functions Used

- `pause()`: Pause contract
- `unpause()`: Unpause contract
- `distributeGlobalPool()`: Distribute pool
- `updateEligibleUsers()`: Update eligible count
- `emergencyWithdraw()`: Emergency withdrawal
- `updateDistributionPercentages()`: Update percentages
- `updateReserveWallet()`: Update reserve address
- `transferOwnership()`: Transfer ownership
- `getAdminSummary()`: Fetch statistics

### Hooks

- `useAdminSummary()`: Fetches admin statistics
- `useAdminActions()`: Provides admin action mutations

## Troubleshooting

### Common Issues

**"Transaction failed"**
- Check if you're the contract owner
- Ensure sufficient gas in wallet
- Verify contract is not paused (for most operations)

**"Wallet not connected"**
- Connect wallet before accessing dashboard
- Ensure you're on the correct network

**"Percentages must add up to 100%"**
- Verify distribution percentages total exactly 100

### Support

For admin support:
- Review contract documentation
- Check transaction on BSCScan
- Contact development team for critical issues

## Security Warning

⚠️ **IMPORTANT**: 
- Never share your owner private key
- Use hardware wallet for owner address
- Keep backup of owner credentials
- Consider multi-signature wallet for added security
- Test all changes on testnet first

## Version History

- **v1.0**: Initial admin dashboard release
  - Contract controls
  - Statistics monitoring
  - Configuration management
