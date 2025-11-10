import { contract, formatAmount } from '../config/blockchain.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { 
  ValidationError, 
  BlockchainError, 
  NotFoundError,
  validateAddress,
  asyncHandler 
} from '../utils/errorHandler.js';

// Get all eligible users
export const getEligibleUsers = asyncHandler(async (req, res) => {
  logger.info('📋 Fetching eligible users list');
  
  const eligibleUsers = await contract.getEligibleUsers();
  const eligibleCount = await contract.eligibleUserCount();
  
  // Get additional info for each user
  const usersWithInfo = await Promise.all(
    eligibleUsers.map(async (address) => {
      try {
        const userInfo = await contract.getUserInfo(address);
        return {
          address,
          userId: userInfo[0].toString(),
          directReferrals: userInfo[2].toString(),
          isActive: userInfo[5],
          userName: userInfo[9] || null
        };
      } catch (error) {
        logger.warn(`Failed to get info for user ${address}`);
        return { address, userId: null, directReferrals: null, isActive: false };
      }
    })
  );
  
  res.json({
    success: true,
    data: {
      eligibleUsers: usersWithInfo,
      totalCount: eligibleCount.toString()
    }
  });
});

// Check if a user is eligible
export const checkEligibility = asyncHandler(async (req, res) => {
  const { address } = req.params;
  
  logger.info(`🔍 Checking eligibility for: ${address}`);
  
  const validAddress = validateAddress(address);
  
  // Get user info
  const userInfo = await contract.getUserInfo(validAddress);
  const userId = userInfo[0];
  
  if (userId === 0n) {
    throw new NotFoundError('User is not registered in the system');
  }
  
  // Check if eligible
  const eligibleUsers = await contract.getEligibleUsers();
  const isEligible = eligibleUsers.some(addr => addr.toLowerCase() === validAddress);
  
  res.json({
    success: true,
    data: {
      address: validAddress,
      userId: userId.toString(),
      isEligible,
      directReferrals: userInfo[2].toString(),
      isActive: userInfo[5],
      userName: userInfo[9] || null
    }
  });
});

// Add eligible user
export const addEligibleUser = asyncHandler(async (req, res) => {
  const { address } = req.body;
  
  logger.info(`➕ Adding eligible user: ${address}`);
  
  const validAddress = validateAddress(address);
  
  // Get user info
  const userInfo = await contract.getUserInfo(validAddress);
  const userId = userInfo[0];
  const directReferrals = Number(userInfo[2]);
  const isActive = userInfo[5];
  const userName = userInfo[9];
  
  // Validate user exists
  if (userId === 0n) {
    throw new NotFoundError('User is not registered in the system');
  }
  
  // Validate user is active
  if (!isActive) {
    throw new ValidationError('User account is not activated');
  }
  
  // Check minimum referral requirement
  if (directReferrals < config.minReferralsForEligibility) {
    throw new ValidationError(
      `User must have at least ${config.minReferralsForEligibility} direct referrals (current: ${directReferrals})`
    );
  }
  
  // Check if already eligible
  const eligibleUsers = await contract.getEligibleUsers();
  const alreadyEligible = eligibleUsers.some(addr => addr.toLowerCase() === validAddress);
  
  if (alreadyEligible) {
    return res.json({
      success: true,
      message: 'User is already in the eligible list',
      data: {
        address: validAddress,
        userId: userId.toString(),
        userName: userName || null,
        directReferrals,
        alreadyEligible: true
      }
    });
  }
  
  // Estimate gas
  logger.info('⛽ Estimating gas for addEligibleUser transaction');
  const gasEstimate = await contract.addEligibleUser.estimateGas(validAddress);
  const gasLimit = gasEstimate * 120n / 100n; // Add 20% buffer
  
  // Send transaction
  logger.info(`🚀 Sending addEligibleUser transaction`);
  const tx = await contract.addEligibleUser(validAddress, { gasLimit });
  
  logger.info(`⏳ Waiting for confirmation: ${tx.hash}`);
  const receipt = await tx.wait(1);
  
  logger.info(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
  
  res.json({
    success: true,
    message: 'User successfully added to eligible list',
    data: {
      address: validAddress,
      userId: userId.toString(),
      userName: userName || null,
      directReferrals,
      transaction: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    }
  });
});

// Remove eligible user
export const removeEligibleUser = asyncHandler(async (req, res) => {
  const { address } = req.body;
  
  logger.info(`➖ Removing eligible user: ${address}`);
  
  const validAddress = validateAddress(address);
  
  // Check if user is currently eligible
  const eligibleUsers = await contract.getEligibleUsers();
  const isEligible = eligibleUsers.some(addr => addr.toLowerCase() === validAddress);
  
  if (!isEligible) {
    throw new NotFoundError('User is not in the eligible list');
  }
  
  // Get user info for logging
  const userInfo = await contract.getUserInfo(validAddress);
  const userId = userInfo[0];
  const userName = userInfo[9];
  
  // Estimate gas
  logger.info('⛽ Estimating gas for removeEligibleUser transaction');
  const gasEstimate = await contract.removeEligibleUser.estimateGas(validAddress);
  const gasLimit = gasEstimate * 120n / 100n;
  
  // Send transaction
  logger.info(`🚀 Sending removeEligibleUser transaction`);
  const tx = await contract.removeEligibleUser(validAddress, { gasLimit });
  
  logger.info(`⏳ Waiting for confirmation: ${tx.hash}`);
  const receipt = await tx.wait(1);
  
  logger.info(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
  
  res.json({
    success: true,
    message: 'User successfully removed from eligible list',
    data: {
      address: validAddress,
      userId: userId.toString(),
      userName: userName || null,
      transaction: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    }
  });
});
