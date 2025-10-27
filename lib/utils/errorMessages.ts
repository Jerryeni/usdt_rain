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

  if (errorString.includes('not eligible')) {
    return {
      title: 'Not Eligible',
      message: 'You are not eligible for this action yet.',
      action: 'Please check the requirements and try again later.',
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
