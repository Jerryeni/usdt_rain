/**
 * Utility functions to convert raw blockchain errors into user-friendly messages
 */

export interface ParsedError {
  title: string;
  message: string;
  action?: string;
}

/**
 * Parse blockchain/contract errors into user-friendly messages
 */
export function parseError(error: unknown): ParsedError {
  if (!error) {
    return {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  const errorObj = error as any;
  const errorMessage = errorObj.message || errorObj.reason || String(error);
  const errorString = errorMessage.toLowerCase();

  // User rejected transaction
  if (
    errorString.includes('user rejected') ||
    errorString.includes('user denied') ||
    errorString.includes('user cancelled')
  ) {
    return {
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction in your wallet.',
      action: 'Please try again if you want to proceed.',
    };
  }

  // Insufficient funds
  if (
    errorString.includes('insufficient funds') ||
    errorString.includes('insufficient balance')
  ) {
    return {
      title: 'Insufficient Funds',
      message: 'You don\'t have enough BNB to pay for gas fees.',
      action: 'Please add BNB to your wallet and try again.',
    };
  }

  // Gas estimation failed
  if (
    errorString.includes('gas') &&
    (errorString.includes('estimation') || errorString.includes('required'))
  ) {
    return {
      title: 'Transaction Failed',
      message: 'Unable to estimate gas fees for this transaction.',
      action: 'The transaction might fail. Please check your inputs and try again.',
    };
  }

  // Circuit breaker error (MetaMask rate limiting)
  if (
    errorString.includes('circuit breaker') ||
    errorString.includes('too many requests') ||
    errorString.includes('rate limit')
  ) {
    return {
      title: 'Network Busy',
      message: 'Too many requests to the network. Please wait a moment.',
      action: 'Try again in 30 seconds or refresh your wallet.',
    };
  }

  // Network errors
  if (
    errorString.includes('network') ||
    errorString.includes('connection') ||
    errorString.includes('timeout')
  ) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the blockchain network.',
      action: 'Please check your internet connection and try again.',
    };
  }

  // Wrong network
  if (
    errorString.includes('chain') ||
    errorString.includes('network mismatch')
  ) {
    return {
      title: 'Wrong Network',
      message: 'Please switch to the correct network in your wallet.',
      action: 'Switch to BSC Testnet or BSC Mainnet.',
    };
  }

  // Custom contract errors (by error signature)
  if (errorMessage.includes('0x118cdaa7') || errorString.includes('ownableunauthorizedaccount')) {
    return {
      title: 'Unauthorized',
      message: 'Only the contract owner can perform this action.',
      action: 'Please use the owner wallet or contact the administrator.',
    };
  }

  if (errorMessage.includes('0xd93c0665') || errorString.includes('enforcedpause')) {
    return {
      title: 'Contract Paused',
      message: 'The contract is currently paused.',
      action: 'Please wait for the contract to be unpaused or contact support.',
    };
  }

  if (errorMessage.includes('0x8dfc202b') || errorString.includes('expectedpause')) {
    return {
      title: 'Contract Not Paused',
      message: 'This action requires the contract to be paused first.',
      action: 'Please pause the contract before performing this action.',
    };
  }

  if (errorMessage.includes('0xab143c06') || errorString.includes('reentrancyguard')) {
    return {
      title: 'Transaction In Progress',
      message: 'Another transaction is currently being processed.',
      action: 'Please wait for the current transaction to complete.',
    };
  }

  // Contract-specific errors
  if (errorString.includes('already registered')) {
    return {
      title: 'Already Registered',
      message: 'This wallet is already registered on the platform.',
      action: 'Please use a different wallet or proceed to activate your account.',
    };
  }

  if (errorString.includes('invalid sponsor')) {
    return {
      title: 'Invalid Sponsor',
      message: 'The sponsor ID you entered is not valid.',
      action: 'Please check the sponsor ID and try again.',
    };
  }

  if (errorString.includes('not registered')) {
    return {
      title: 'Not Registered',
      message: 'You need to register first before performing this action.',
      action: 'Please complete registration.',
    };
  }

  if (errorString.includes('not active')) {
    return {
      title: 'Account Not Active',
      message: 'You need to activate your account first.',
      action: 'Please activate your account with the required deposit.',
    };
  }

  if (errorString.includes('already activated')) {
    return {
      title: 'Already Activated',
      message: 'Your account is already activated.',
      action: 'You can proceed to use the platform.',
    };
  }

  if (errorString.includes('insufficient allowance')) {
    return {
      title: 'Insufficient Allowance',
      message: 'Please approve the contract to spend your USDT.',
      action: 'Click the approve button and try again.',
    };
  }

  if (errorString.includes('nothing to withdraw')) {
    return {
      title: 'Nothing to Withdraw',
      message: 'You don\'t have any funds available to withdraw.',
      action: 'Earn more income before withdrawing.',
    };
  }

  if (errorString.includes('already claimed')) {
    return {
      title: 'Already Claimed',
      message: 'You have already claimed this reward.',
      action: 'Wait for the next claim period.',
    };
  }

  // Admin-specific errors
  if (errorString.includes('only owner') || errorString.includes('caller is not the owner')) {
    return {
      title: 'Access Denied',
      message: 'Only the contract owner can perform this action.',
      action: 'Please connect with the owner wallet.',
    };
  }

  if (errorString.includes('already eligible') || errorString.includes('already added')) {
    return {
      title: 'Already Added',
      message: 'This user is already in the eligible users list.',
      action: 'No action needed. Refresh the page to see the current list.',
    };
  }
  
  if (errorString.includes('transfer amount exceeds balance') || errorString.includes('ubc20')) {
    return {
      title: 'Insufficient Balance',
      message: 'The contract doesn\'t have enough USDT to complete this distribution.',
      action: 'Please wait for more funds to accumulate or use batch distribution.',
    };
  }
  
  if (errorString.includes('no pending distribution') || errorString.includes('nothing to claim')) {
    return {
      title: 'Nothing to Claim',
      message: 'There are no pending rewards to claim at this time.',
      action: 'Wait for the admin to distribute the global pool.',
    };
  }
  
  if (errorString.includes('distribution in progress') || errorString.includes('batch not complete')) {
    return {
      title: 'Distribution In Progress',
      message: 'A batch distribution is currently in progress.',
      action: 'Please wait for it to complete before starting a new one.',
    };
  }

  if (errorString.includes('not eligible')) {
    // Check if this is about removing a user from eligible list
    if (errorMessage.includes('removeEligibleUser') || errorMessage.includes('0x7100296d')) {
      return {
        title: 'User Not in List',
        message: 'This user is not in the eligible users list.',
        action: 'They may have already been removed or were never added. Please refresh the page.',
      };
    }
    
    return {
      title: 'Not Eligible',
      message: 'You are not eligible for this action yet.',
      action: 'Please check the requirements and try again later.',
    };
  }

  if (errorString.includes('no eligible users') || errorString.includes('empty eligible')) {
    return {
      title: 'No Eligible Users',
      message: 'There are no eligible users to distribute to.',
      action: 'Please add eligible users before distributing the global pool.',
    };
  }

  if (errorString.includes('insufficient pool balance') || errorString.includes('pool balance too low')) {
    return {
      title: 'Insufficient Pool Balance',
      message: 'The global pool doesn\'t have enough funds to distribute.',
      action: 'Wait for more users to activate or for the pool to accumulate funds.',
    };
  }

  if (errorString.includes('invalid address') || errorString.includes('zero address')) {
    return {
      title: 'Invalid Address',
      message: 'The wallet address you entered is not valid.',
      action: 'Please check the address format (should start with 0x) and try again.',
    };
  }

  if (errorString.includes('percentages') && errorString.includes('100')) {
    return {
      title: 'Invalid Percentages',
      message: 'Distribution percentages must add up to exactly 100%.',
      action: 'Please adjust the percentages and try again.',
    };
  }

  if (errorString.includes('already manager') || errorString.includes('manager exists')) {
    return {
      title: 'Already a Manager',
      message: 'This address is already assigned as a manager.',
      action: 'No action needed. Refresh the page to see current managers.',
    };
  }

  if (errorString.includes('not a manager') || errorString.includes('manager not found')) {
    return {
      title: 'Not a Manager',
      message: 'This address is not currently a manager.',
      action: 'They may have already been removed. Please refresh the page.',
    };
  }

  // Profile-specific errors
  if (errorString.includes('name') && errorString.includes('empty')) {
    return {
      title: 'Invalid Username',
      message: 'Username cannot be empty.',
      action: 'Please enter a valid username.',
    };
  }

  if (errorString.includes('contact') && errorString.includes('empty')) {
    return {
      title: 'Invalid Contact',
      message: 'Contact number cannot be empty.',
      action: 'Please enter a valid contact number.',
    };
  }

  // Transaction reverted
  if (errorString.includes('reverted') || errorString.includes('execution reverted')) {
    // Try to extract the revert reason
    const reasonMatch = errorMessage.match(/reason="([^"]+)"/);
    if (reasonMatch) {
      return {
        title: 'Transaction Failed',
        message: reasonMatch[1],
        action: 'Please check the error and try again.',
      };
    }

    return {
      title: 'Transaction Failed',
      message: 'The transaction was rejected by the smart contract.',
      action: 'Please check your inputs and try again.',
    };
  }

  // Nonce too low (transaction already processed)
  if (errorString.includes('nonce too low')) {
    return {
      title: 'Transaction Already Processed',
      message: 'This transaction has already been processed.',
      action: 'Please refresh the page.',
    };
  }

  // Replacement transaction underpriced
  if (errorString.includes('replacement transaction underpriced')) {
    return {
      title: 'Transaction Pending',
      message: 'A similar transaction is already pending.',
      action: 'Please wait for the previous transaction to complete.',
    };
  }

  // Generic fallback
  return {
    title: 'Transaction Error',
    message: 'An error occurred while processing your transaction.',
    action: 'Please try again or contact support if the problem persists.',
  };
}

/**
 * Format error for display in UI
 */
export function formatErrorMessage(error: unknown): string {
  const parsed = parseError(error);
  let message = parsed.message;
  if (parsed.action) {
    message += ` ${parsed.action}`;
  }
  return message;
}

/**
 * Get error title for display
 */
export function getErrorTitle(error: unknown): string {
  return parseError(error).title;
}
