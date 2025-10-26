# Admin Operations Guide

## Table of Contents

1. [Access Control](#access-control)
2. [Dashboard Overview](#dashboard-overview)
3. [Daily Operations](#daily-operations)
4. [Contract Controls](#contract-controls)
5. [Configuration Management](#configuration-management)
6. [Emergency Procedures](#emergency-procedures)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Access Control

### Who Can Access

- **Contract owner** can access the admin dashboard
- **First registered user (User ID 1)** also has admin access
- The owner address is set during contract deployment
- Non-admins are automatically redirected to the home page

### Accessing the Dashboard

1. Connect your wallet (must be the owner address)
2. Navigate to `/admin`
3. System verifies ownership automatically
4. If verified, full dashboard access is granted

### Security Features

- Automatic ownership verification on page load
- Real-time access checks
- Redirect protection for unauthorized users
- Transaction confirmation for critical actions

---

## Dashboard Overview

### Statistics Panel

Monitor key platform metrics in real-time:

| Metric            | Description                  | Update Frequency |
| ----------------- | ---------------------------- | ---------------- |
| Total Users       | All registered users         | Real-time        |
| Active Users      | Users who activated accounts | Real-time        |
| Global Pool       | Current pool balance         | Real-time        |
| Total Distributed | Cumulative distributions     | Real-time        |
| Eligible Users    | Users eligible for pool      | Real-time        |
| Contract Balance  | Total USDT in contract       | Real-time        |

### Quick Actions

Fast access to common pages:

- **Leaderboard**: View top earners
- **Transactions**: Monitor all transactions
- **Dashboard**: Return to main dashboard

---

## Daily Operations

### Morning Routine (Recommended)

1. **Check Statistics**

   - Review total users and active users
   - Monitor global pool balance
   - Verify contract balance

2. **Review Transactions**

   - Check recent activations
   - Monitor withdrawal patterns
   - Verify distribution accuracy

3. **System Health**
   - Ensure contract is not paused
   - Check for any anomalies
   - Review eligible users count

### Weekly Tasks

1. **Distribute Global Pool**

   - Click "Distribute Pool" button
   - Confirm transaction in wallet
   - Verify distribution completed
   - Check updated balances

2. **Update Eligible Users**

   - Click "Update Eligible" button
   - Ensures accurate pool calculations
   - Run before pool distribution

3. **Review Performance**
   - Analyze user growth
   - Monitor distribution patterns
   - Check reserve wallet balance

### Monthly Tasks

1. **Audit Contract Performance**

   - Review total distributions
   - Analyze user activation rates
   - Check reserve accumulation

2. **Review Configuration**
   - Verify distribution percentages
   - Confirm reserve wallet address
   - Check system parameters

---

## Contract Controls

### Primary Actions

#### Distribute Global Pool

**Purpose**: Manually distribute accumulated global pool to eligible users

**When to Use**:

- Regular scheduled distributions (weekly recommended)
- After significant pool accumulation
- Before major platform announcements

**Steps**:

1. Click "Distribute Pool" button
2. Review transaction details
3. Confirm in wallet
4. Wait for confirmation
5. Verify distribution in statistics

**Important Notes**:

- Only distributes to eligible users (active + minimum referrals)
- Updates eligible users count automatically
- Cannot be reversed once confirmed

#### Update Eligible Users

**Purpose**: Recalculate count of users eligible for global pool

**When to Use**:

- Before distributing global pool
- After significant user activations
- When statistics seem outdated

**Steps**:

1. Click "Update Eligible" button
2. Confirm transaction
3. Wait for completion
4. Check updated eligible users count

### Contract State Controls

#### Pause Contract

**Purpose**: Temporarily halt all contract operations

**When to Use**:

- During maintenance
- When investigating issues
- Before major updates
- In emergency situations

**Effects When Paused**:

- No new registrations
- No account activations
- No withdrawals
- No distributions
- No profile updates

**Steps**:

1. Click "Pause Contract" button
2. Confirm action
3. Verify contract is paused
4. Communicate to users

**⚠️ Important**: Inform users before pausing!

#### Unpause Contract

**Purpose**: Resume normal contract operations

**When to Use**:

- After maintenance completion
- When issues are resolved
- After successful updates

**Steps**:

1. Verify all issues are resolved
2. Click "Unpause Contract" button
3. Confirm transaction
4. Test basic functions
5. Announce to users

---

## Configuration Management

### Distribution Percentages

**Current Default**:

- Level Income: 70%
- Global Pool: 20%
- Reserve: 10%

**How to Update**:

1. Click on "Distribution Percentages"
2. Enter new percentages
3. Ensure total equals 100%
4. Click "Update Percentages"
5. Confirm transaction

**Considerations**:

- Affects all future activations
- Does not affect past distributions
- Test on testnet first
- Communicate changes to users

**Example Scenarios**:

```
Conservative (More Reserve):
- Level Income: 65%
- Global Pool: 20%
- Reserve: 15%

Aggressive (More Distribution):
- Level Income: 75%
- Global Pool: 20%
- Reserve: 5%

Balanced (Current):
- Level Income: 70%
- Global Pool: 20%
- Reserve: 10%
```

### Reserve Wallet

**Purpose**: Address that receives reserve funds

**How to Update**:

1. Prepare new wallet address
2. Verify address is correct (double-check!)
3. Enter address in "Reserve Wallet" section
4. Click "Update Reserve Wallet"
5. Confirm transaction

**⚠️ Critical**:

- Verify address multiple times
- Use a secure wallet
- Consider multi-sig wallet
- Keep backup of private keys
- Test with small amount first

### Transfer Ownership

**Purpose**: Transfer contract ownership to new address

**⚠️ EXTREMELY CRITICAL - IRREVERSIBLE**

**When to Use**:

- Transitioning to new management
- Moving to multi-sig wallet
- Organizational changes

**Steps**:

1. **Prepare thoroughly**:

   - Verify new owner address multiple times
   - Ensure new owner understands responsibilities
   - Test on testnet first
   - Have backup plans

2. **Execute transfer**:

   - Enter new owner address
   - Click "Transfer Ownership"
   - Confirm first warning
   - Confirm transaction in wallet
   - Confirm second warning

3. **Post-transfer**:
   - Verify new owner has access
   - Test admin functions with new owner
   - Update documentation
   - Secure old owner keys

**⚠️ WARNING**:

- You will lose all admin access
- Cannot be reversed
- New owner has full control
- Verify address 10+ times

---

## Emergency Procedures

### Emergency Withdraw

**Purpose**: Withdraw all USDT from contract to owner address

**⚠️ USE ONLY IN CRITICAL EMERGENCIES**

**When to Use**:

- Critical security vulnerability discovered
- Contract compromise detected
- Regulatory requirement
- Platform shutdown

**Effects**:

- Withdraws all USDT to owner
- Users cannot withdraw
- Platform effectively stops
- Requires explanation to users

**Steps**:

1. **Assess situation**:

   - Confirm emergency is real
   - Document the issue
   - Prepare communication

2. **Pause contract first**:

   - Click "Pause Contract"
   - Prevent new transactions

3. **Execute withdrawal**:

   - Click "Emergency Withdraw"
   - Confirm warning
   - Confirm transaction
   - Wait for completion

4. **Post-emergency**:
   - Communicate to all users
   - Explain situation
   - Provide resolution plan
   - Consider refund process

### Security Incident Response

**If Contract is Compromised**:

1. Pause contract immediately
2. Assess the damage
3. Contact security experts
4. Consider emergency withdraw
5. Communicate transparently
6. Plan recovery

**If Owner Wallet is Compromised**:

1. Transfer ownership immediately (if still possible)
2. Pause contract from new owner
3. Assess situation
4. Secure new wallet
5. Resume operations carefully

---

## Best Practices

### Security

1. **Wallet Security**:

   - Use hardware wallet for owner address
   - Never share private keys
   - Use strong passwords
   - Enable 2FA where possible
   - Keep backups secure

2. **Access Control**:

   - Limit who knows owner address
   - Don't access from public WiFi
   - Use VPN when possible
   - Clear browser cache regularly

3. **Transaction Safety**:
   - Always verify addresses
   - Double-check amounts
   - Test on testnet first
   - Keep transaction records

### Operational

1. **Regular Monitoring**:

   - Check dashboard daily
   - Monitor statistics trends
   - Review transactions weekly
   - Audit monthly

2. **Communication**:

   - Announce maintenance in advance
   - Explain configuration changes
   - Be transparent about issues
   - Respond to user concerns

3. **Documentation**:
   - Keep operation logs
   - Document all changes
   - Record transaction hashes
   - Maintain incident reports

### Financial

1. **Reserve Management**:

   - Monitor reserve accumulation
   - Plan reserve usage
   - Keep reserve secure
   - Document reserve transactions

2. **Distribution Strategy**:
   - Distribute pool regularly
   - Maintain consistent schedule
   - Communicate distribution times
   - Monitor distribution fairness

---

## Troubleshooting

### Common Issues

#### "Transaction Failed"

**Possible Causes**:

- Not the contract owner
- Insufficient gas
- Contract is paused (for some operations)
- Network congestion

**Solutions**:

1. Verify you're using owner wallet
2. Increase gas limit
3. Check contract state
4. Try again later
5. Check BSCScan for details

#### "Unable to Load Statistics"

**Possible Causes**:

- Network connection issue
- RPC endpoint down
- Contract issue

**Solutions**:

1. Refresh page
2. Check internet connection
3. Try different RPC endpoint
4. Check contract on BSCScan

#### "Access Denied" or Redirect

**Possible Causes**:

- Not connected with owner wallet
- Wrong network
- Wallet not connected

**Solutions**:

1. Verify owner address
2. Switch to correct network
3. Reconnect wallet
4. Clear cache and retry

#### "Percentages Must Add Up to 100%"

**Cause**: Distribution percentages don't total 100

**Solution**:

1. Check all three percentages
2. Ensure they sum to exactly 100
3. Use whole numbers
4. Try again

### Getting Help

**For Technical Issues**:

1. Check transaction on BSCScan
2. Review error messages
3. Check contract events
4. Contact development team

**For Security Issues**:

1. Act immediately
2. Pause contract if needed
3. Contact security team
4. Document everything

**For User Issues**:

1. Review user's transaction history
2. Check contract state
3. Verify user eligibility
4. Provide clear explanation

---

## Appendix

### Important Addresses

- Contract Address: [Check .env file]
- USDT Token: [Check .env file]
- Reserve Wallet: [Check contract]
- Owner Address: [Your wallet]

### Useful Links

- BSCScan: https://testnet.bscscan.com (or mainnet)
- Admin Dashboard: /admin
- Main Dashboard: /
- Leaderboard: /leaderboard

### Contact Information

- Development Team: [Your contact]
- Security Team: [Your contact]
- Support Team: [Your contact]

### Version History

- v1.0: Initial admin dashboard
- Current: Enhanced UI and access control

---

## Quick Reference Card

### Daily Checklist

- [ ] Check statistics
- [ ] Review new users
- [ ] Monitor transactions
- [ ] Verify contract state

### Weekly Checklist

- [ ] Update eligible users
- [ ] Distribute global pool
- [ ] Review performance
- [ ] Check reserve balance

### Monthly Checklist

- [ ] Full audit
- [ ] Review configuration
- [ ] Analyze trends
- [ ] Update documentation

### Emergency Contacts

- Development: [Contact]
- Security: [Contact]
- Legal: [Contact]

---

**Remember**: With great power comes great responsibility. Always double-check before executing admin functions, especially irreversible ones like ownership transfer and emergency withdraw.
