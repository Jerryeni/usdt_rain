/**
 * Centralized error handler for the USDT Rain application
 * Maps contract errors, wallet errors, and network errors to user-friendly messages
 */

export interface ErrorDetails {
  title: string;
  message: string;
  action?: string;
  retryable: boolean;
}

/**
 * Parse and format errors into user-friendly messages
 */
export function handleError(error: any): ErrorDetails {
  // Handle wallet errors
  if (error?.code) {
    switch (error.code) {
      case 4001:
        return {
          title: 'Transaction Rejected',
          message: 'You rejected the transaction in your wallet.',
          retryable: true,
        };
      case -32002:
        return {
          title: 'Pending Request',
          message: 'Please check your wallet for a pending request.',
          retryable: false,
        };
      case -32603:
        return {
          title: 'Internal Error',
          message: 'An internal error occurred. Please try again.',
          retryable: true,
        };
      case 'NETWORK_ERROR':
        return {
          title: 'Network Error',
          message: 'Unable to connect to the blockchain. Please check your internet connection.',
          action: 'Check your connection and try again',
          retryable: true,
        };
      case 'INSUFFICIENT_FUNDS':
        return {
          title: 'Insufficient Funds',
          message: 'You do not have enough BNB to pay for gas fees.',
          action: 'Add BNB to your wallet',
          retryable: false,
        };
      case 'UNPREDICTABLE_GAS_LIMIT':
        return {
          title: 'Transaction Will Fail',
          message: 'This transaction is likely to fail. Please check the requirements.',
          retryable: false,
        };
    }
  }

  // Handle contract revert errors
  const errorMessage = error?.message || error?.reason || String(error);
  
  // Wallet not installed
  if (errorMessage.includes('window.ethereum') || errorMessage.includes('provider')) {
    return {
      title: 'Wallet Not Found',
      message: 'Please install MetaMask or another Web3 wallet to continue.',
      action: 'Install MetaMask',
      retryable: false,
    };
  }

  // Wallet locked
  if (errorMessage.includes('locked') || errorMessage.includes('unlock')) {
    return {
      title: 'Wallet Locked',
      message: 'Please unlock your wallet to continue.',
      action: 'Unlock your wallet',
      retryable: true,
    };
  }

  // Wrong network
  if (errorMessage.includes('network') || errorMessage.includes('chain')) {
    return {
      title: 'Wrong Network',
      message: 'Please switch to UBC Mainet in your wallet.',
      action: 'Switch to UBC Mainet',
      retryable: true,
    };
  }

  // Contract-specific errors
  if (errorMessage.includes('User not registered')) {
    return {
      title: 'Not Registered',
      message: 'You need to register first before performing this action.',
      action: 'Go to registration',
      retryable: false,
    };
  }

  if (errorMessage.includes('User not activated')) {
    return {
      title: 'Account Not Activated',
      message: 'You need to activate your account with 10 USDT first.',
      action: 'Activate your account',
      retryable: false,
    };
  }

  if (errorMessage.includes('Insufficient balance') || errorMessage.includes('insufficient funds')) {
    return {
      title: 'Insufficient Balance',
      message: 'You do not have enough USDT in your wallet.',
      action: 'Add USDT to your wallet',
      retryable: false,
    };
  }

  if (errorMessage.includes('No earnings to withdraw')) {
    return {
      title: 'No Earnings Available',
      message: 'You do not have any earnings to withdraw at this time.',
      retryable: false,
    };
  }

  if (errorMessage.includes('Invalid sponsor')) {
    return {
      title: 'Invalid Sponsor',
      message: 'The sponsor ID you entered does not exist or is invalid.',
      action: 'Check the sponsor ID',
      retryable: true,
    };
  }

  if (errorMessage.includes('Already registered')) {
    return {
      title: 'Already Registered',
      message: 'This wallet address is already registered.',
      retryable: false,
    };
  }

  if (errorMessage.includes('Invalid level')) {
    return {
      title: 'Invalid Level',
      message: 'The level you specified is invalid.',
      retryable: false,
    };
  }

  if (errorMessage.includes('Username too short') || errorMessage.includes('Username too long')) {
    return {
      title: 'Invalid Username',
      message: 'Username must be between 3 and 50 characters.',
      retryable: true,
    };
  }

  if (errorMessage.includes('Invalid contact number')) {
    return {
      title: 'Invalid Contact Number',
      message: 'Please enter a valid contact number.',
      retryable: true,
    };
  }

  // RPC errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.',
      retryable: true,
    };
  }

  if (errorMessage.includes('rate limit')) {
    return {
      title: 'Too Many Requests',
      message: 'You are making too many requests. Please wait a moment and try again.',
      retryable: true,
    };
  }

  // Gas estimation errors
  if (errorMessage.includes('gas required exceeds allowance')) {
    return {
      title: 'Insufficient Gas',
      message: 'You do not have enough BNB to pay for this transaction.',
      action: 'Add BNB to your wallet',
      retryable: false,
    };
  }

  // Nonce errors
  if (errorMessage.includes('nonce')) {
    return {
      title: 'Transaction Conflict',
      message: 'There is a transaction conflict. Please try again.',
      retryable: true,
    };
  }

  // Generic fallback
  return {
    title: 'Transaction Failed',
    message: errorMessage.length > 100 
      ? 'An unexpected error occurred. Please try again.' 
      : errorMessage,
    retryable: true,
  };
}

/**
 * Format error for console logging
 */
export function logError(error: any, context?: string) {
  const details = handleError(error);
  console.error(`[${context || 'Error'}]`, {
    title: details.title,
    message: details.message,
    originalError: error,
  });
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const details = handleError(error);
  return details.retryable;
}

/**
 * Get suggested action for error
 */
export function getErrorAction(error: any): string | undefined {
  const details = handleError(error);
  return details.action;
}
