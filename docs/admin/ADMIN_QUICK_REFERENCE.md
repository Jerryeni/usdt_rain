# Admin Dashboard - Quick Reference

## Access
- **URL**: `/admin`
- **Requirement**: Must be contract owner OR first user (User ID 1)
- **Auto-redirect**: Non-admins redirected to home

## Statistics (Real-time)

| Metric | What It Shows |
|--------|---------------|
| 📊 Total Users | All registered users |
| ✅ Active Users | Users who paid activation fee |
| 💰 Global Pool | Current pool balance available for distribution |
| 📤 Total Distributed | All-time distributions to users |
| 🎯 Eligible Users | Users eligible for global pool (active + min referrals) |
| 💼 Contract Balance | Total USDT held in contract |

## Primary Actions

### 🔄 Distribute Pool
- **What**: Distributes global pool to eligible users
- **When**: Weekly (recommended)
- **Effect**: Sends pool balance to eligible users
- **Reversible**: ❌ No

### 🔃 Update Eligible
- **What**: Recalculates eligible users count
- **When**: Before distributing pool
- **Effect**: Updates eligibility calculations
- **Reversible**: ✅ Yes (can run again)

## Contract State

### ⏸️ Pause Contract
- **What**: Stops all contract operations
- **When**: Maintenance, emergencies
- **Effect**: No transactions possible
- **Reversible**: ✅ Yes (unpause)

### ▶️ Unpause Contract
- **What**: Resumes contract operations
- **When**: After maintenance/issues resolved
- **Effect**: Normal operations resume
- **Reversible**: ✅ Yes (can pause again)

## Configuration

### 📊 Distribution Percentages
- **Default**: 70% Level | 20% Pool | 10% Reserve
- **Rule**: Must total 100%
- **Effect**: Applies to future activations
- **Reversible**: ✅ Yes (can change again)

### 💼 Reserve Wallet
- **What**: Address receiving reserve funds
- **Warning**: ⚠️ Verify address carefully
- **Effect**: Future reserves go to new address
- **Reversible**: ✅ Yes (can change again)

### 🔑 Transfer Ownership
- **What**: Transfers admin control
- **Warning**: ⚠️⚠️⚠️ IRREVERSIBLE
- **Effect**: You lose all admin access
- **Reversible**: ❌ NO - PERMANENT

## Emergency

### 🚨 Emergency Withdraw
- **What**: Withdraws all USDT to owner
- **When**: CRITICAL EMERGENCIES ONLY
- **Effect**: Platform stops, users can't withdraw
- **Reversible**: ❌ No
- **Warning**: ⚠️⚠️⚠️ Requires user communication

## Quick Action Checklist

### Daily
```
□ Check statistics
□ Review new users  
□ Monitor transactions
□ Verify contract active
```

### Weekly
```
□ Update eligible users
□ Distribute global pool
□ Review performance
□ Check reserve balance
```

### Before Distribution
```
□ Update eligible users first
□ Check global pool balance
□ Verify contract not paused
□ Confirm transaction
```

### Before Pausing
```
□ Announce to users
□ Document reason
□ Plan unpause time
□ Monitor during pause
```

### Before Config Changes
```
□ Test on testnet
□ Document current values
□ Verify new values
□ Announce to users
```

## Color Guide

### Statistics Cards
- **Cyan**: All metrics use consistent cyan theme
- **Icons**: Contextual icons for each metric
- **Borders**: Subtle cyan borders

### Action Buttons
- **Cyan**: Primary actions (distribute, update)
- **Yellow**: Pause action
- **Green**: Unpause action
- **Red**: Emergency actions

### Configuration
- **Cyan**: Standard config (percentages, wallet)
- **Red**: Critical config (ownership transfer)

## Transaction Status

| Status | Meaning |
|--------|---------|
| Estimating | Calculating gas fees |
| Signing | Waiting for wallet confirmation |
| Pending | Submitted to blockchain |
| Confirmed | ✅ Success |
| Failed | ❌ Error occurred |

## Error Messages

| Error | Solution |
|-------|----------|
| "Transaction failed" | Check if you're owner, try again |
| "Wallet not connected" | Connect owner wallet |
| "Percentages must add up to 100%" | Adjust percentages to total 100 |
| "Access denied" | Verify you're using owner wallet |

## Safety Rules

### ✅ Always Do
- Verify addresses multiple times
- Test on testnet first
- Keep transaction records
- Communicate changes to users
- Use hardware wallet

### ❌ Never Do
- Share private keys
- Rush critical actions
- Skip verification steps
- Ignore warnings
- Use public WiFi for admin tasks

## Emergency Procedures

### If Contract Compromised
1. Pause immediately
2. Assess damage
3. Contact security team
4. Consider emergency withdraw
5. Communicate to users

### If Wallet Compromised
1. Transfer ownership (if possible)
2. Pause from new wallet
3. Secure new wallet
4. Resume carefully

## Support

### For Help
- Check ADMIN_OPERATIONS_GUIDE.md
- Review transaction on BSCScan
- Contact development team
- Document issue details

### For Emergencies
- Act immediately
- Follow emergency procedures
- Document everything
- Communicate transparently

## Keyboard Shortcuts

- `Ctrl/Cmd + R`: Refresh statistics
- `Esc`: Close transaction modal
- `Home`: Scroll to top

## Browser Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- MetaMask or compatible wallet
- JavaScript enabled
- Stable internet connection

## Network Info

- **Testnet**: BSC Testnet (Chain ID: 97)
- **Mainnet**: BSC Mainnet (Chain ID: 56)
- **Explorer**: BSCScan

## Version

- **Dashboard**: v1.0
- **Last Updated**: 2024
- **Status**: Production Ready

---

**💡 Pro Tip**: Bookmark this page for quick reference during admin operations!

**⚠️ Remember**: Always verify before executing, especially for irreversible actions!
