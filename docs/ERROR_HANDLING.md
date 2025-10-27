# Error Handling - User-Friendly Messages

## Overview

The platform now converts raw blockchain errors into clear, user-friendly messages that help users understand what went wrong and how to fix it.

## Implementation

### Error Parsing Utility

**File**: `lib/utils/errorMessages.ts`

Provides functions to parse and format errors:

```typescript
// Parse error into structured format
parseError(error: unknown): ParsedError

// Get formatted error message
formatErrorMessage(error: unknown): string

// Get error title
getErrorTitle(error: unknown): string
```

### Error Structure

```typescript
interface ParsedError {
  title: string;      // Short error title
  message: string;    // Clear explanation
  action?: string;    // What user should do
}
```

## Supported Error Types

### Wallet Errors

| Raw Error | User-Friendly Message |
|-----------|----------------------|
| "user rejected transaction" | "You cancelled the transaction in your wallet." |
| "insufficient funds" | "You don't have enough BNB to pay for gas fees. Please add BNB to your wallet." |
| "network error" | "Unable to connect to the blockchain network. Please check your internet connection." |
| "wrong chain" | "Please switch to the correct network in your wallet (BSC Testnet or Mainnet)." |

### Contract Errors

| Raw Error | User-Friendly Message |
|-----------|----------------------|
| "already registered" | "This wallet is already registered. Please use a different wallet or activate your account." |
| "invalid sponsor" | "The sponsor ID you entered is not valid. Please check and try again." |
| "not registered" | "You need to register first before performing this action." |
| "not active" | "You need to activate your account first with the required deposit." |
| "already activated" | "Your account is already activated. You can proceed to use the platform." |
| "nothing to withdraw" | "You don't have any funds available to withdraw. Earn more income first." |
| "already claimed" | "You have already claimed this reward. Wait for the next claim period." |
| "not eligible" | "You are not eligible for this action yet. Please check the requirements." |

### Profile Errors

| Raw Error | User-Friendly Message |
|-----------|----------------------|
| "name empty" | "Username cannot be empty. Please enter a valid username." |
| "contact empty" | "Contact number cannot be empty. Please enter a valid contact number." |

### Transaction Errors

| Raw Error | User-Friendly Message |
|-----------|----------------------|
| "execution reverted" | "The transaction was rejected by the smart contract. Please check your inputs." |
| "nonce too low" | "This transaction has already been processed. Please refresh the page." |
| "replacement transaction underpriced" | "A similar transaction is already pending. Please wait for it to complete." |
| "gas estimation failed" | "Unable to estimate gas fees. The transaction might fail." |

## Usage Examples

### In Profile Page

**Before**:
```typescript
catch (error) {
  setTxError((error as Error).message);
  // Shows: "execution reverted: reason="User not active""
}
```

**After**:
```typescript
catch (error) {
  const parsedError = parseError(error);
  const errorMessage = parsedError.action 
    ? `${parsedError.message} ${parsedError.action}`
    : parsedError.message;
  setTxError(errorMessage);
  // Shows: "You need to activate your account first. Please activate your account with the required deposit."
}
```

### In Other Components

```typescript
import { parseError, formatErrorMessage } from '@/lib/utils/errorMessages';

// Get full parsed error
const parsed = parseError(error);
console.log(parsed.title);    // "Transaction Failed"
console.log(parsed.message);  // "The transaction was rejected..."
console.log(parsed.action);   // "Please check your inputs..."

// Get formatted message
const message = formatErrorMessage(error);
// "The transaction was rejected by the smart contract. Please check your inputs and try again."
```

## Benefits

### For Users
- ✅ Clear, understandable error messages
- ✅ Actionable guidance on how to fix issues
- ✅ No confusing technical jargon
- ✅ Better user experience

### For Developers
- ✅ Centralized error handling
- ✅ Consistent error messages across the app
- ✅ Easy to add new error types
- ✅ Maintainable and testable

## Adding New Error Types

To add support for new errors:

1. Open `lib/utils/errorMessages.ts`
2. Add a new condition in the `parseError` function:

```typescript
if (errorString.includes('your_error_keyword')) {
  return {
    title: 'Error Title',
    message: 'Clear explanation of what went wrong.',
    action: 'What the user should do to fix it.',
  };
}
```

## Best Practices

### Error Message Guidelines

1. **Be Clear**: Use simple, non-technical language
2. **Be Specific**: Explain exactly what went wrong
3. **Be Helpful**: Tell users how to fix the issue
4. **Be Concise**: Keep messages short and to the point

### Good Examples

✅ "You don't have enough BNB to pay for gas fees. Please add BNB to your wallet."
✅ "Your account is not activated yet. Please activate with a $25 USDT deposit."
✅ "You cancelled the transaction in your wallet. Please try again if you want to proceed."

### Bad Examples

❌ "Error: execution reverted: reason="NotActive""
❌ "Transaction failed with code 0x1234"
❌ "Insufficient funds for intrinsic transaction cost"

## Testing

### Manual Testing

Test each error type:

1. **User Rejection**: Cancel a transaction in MetaMask
2. **Insufficient Funds**: Try transaction with low BNB
3. **Wrong Network**: Switch to wrong network
4. **Contract Errors**: Try invalid actions (register twice, etc.)

### Expected Behavior

- Error messages should be clear and helpful
- No raw error codes or technical jargon
- Users should know what to do next
- Consistent formatting across all errors

## Future Enhancements

### Planned Improvements

1. **Multi-language Support**: Translate error messages
2. **Error Codes**: Add unique codes for support reference
3. **Help Links**: Link to relevant documentation
4. **Error Analytics**: Track common errors
5. **Contextual Help**: Show relevant help based on error type

### Example Future Format

```typescript
{
  title: "Insufficient Funds",
  message: "You don't have enough BNB to pay for gas fees.",
  action: "Please add BNB to your wallet and try again.",
  code: "ERR_INSUFFICIENT_FUNDS",
  helpLink: "/docs/troubleshooting#insufficient-funds",
  severity: "warning"
}
```

## Integration Checklist

To integrate error handling in a new component:

- [ ] Import `parseError` or `formatErrorMessage`
- [ ] Wrap error handling in try-catch
- [ ] Parse the error before displaying
- [ ] Show parsed message to user
- [ ] Log original error for debugging
- [ ] Test with different error types

## Summary

The error handling system provides:
- Clear, user-friendly error messages
- Actionable guidance for users
- Consistent experience across the platform
- Easy maintenance and extensibility

All errors are now parsed and displayed in a way that helps users understand and resolve issues quickly.

---

**Status**: ✅ Implemented
**Location**: `lib/utils/errorMessages.ts`
**Used In**: Profile page (more pages to follow)
**Last Updated**: 2024
