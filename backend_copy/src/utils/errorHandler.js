import { logger } from './logger.js';

// Custom error classes
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

export class BlockchainError extends Error {
  constructor(message, txHash = null) {
    super(message);
    this.name = 'BlockchainError';
    this.txHash = txHash;
    this.statusCode = 500;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Parse blockchain errors into user-friendly messages
export const parseBlockchainError = (error) => {
  const errorMessage = error.message || error.toString();
  
  const errorPatterns = {
    'insufficient funds': 'Insufficient funds for transaction',
    'gas required exceeds allowance': 'Transaction requires more gas',
    'execution reverted': 'Transaction rejected by contract',
    'nonce too low': 'Transaction nonce too low, please retry',
    'Only manager': 'Only authorized managers can perform this action',
    'User not found': 'User not found in the system',
    'Already eligible': 'User is already in the eligible list',
    'Not eligible': 'User is not in the eligible list',
    'Insufficient referrals': 'User does not have enough referrals',
    'Invalid address': 'Invalid wallet address provided'
  };
  
  for (const [pattern, friendlyMessage] of Object.entries(errorPatterns)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }
  
  return 'Transaction failed. Please try again or contact support.';
};

// Validate Ethereum address
export const validateAddress = (address, fieldName = 'address') => {
  if (!address) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  
  if (typeof address !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new ValidationError(`Invalid ${fieldName} format`, fieldName);
  }
  
  return address.toLowerCase();
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  logger.error('❌ Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      field: err.field,
      type: 'validation_error'
    });
  }
  
  if (err instanceof AuthorizationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      type: 'authorization_error'
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      type: 'not_found_error'
    });
  }
  
  if (err instanceof BlockchainError) {
    return res.status(err.statusCode).json({
      success: false,
      error: parseBlockchainError(err),
      txHash: err.txHash,
      type: 'blockchain_error'
    });
  }
  
  // Handle blockchain/ethers errors
  if (err.code || err.reason || err.message?.includes('revert')) {
    return res.status(500).json({
      success: false,
      error: parseBlockchainError(err),
      type: 'blockchain_error'
    });
  }
  
  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal server error. Please try again later.',
    type: 'server_error'
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
