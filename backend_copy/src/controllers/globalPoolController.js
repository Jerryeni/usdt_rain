import { contract, formatAmount } from '../config/blockchain.js';
import { logger } from '../utils/logger.js';
import { BlockchainError, ValidationError, asyncHandler } from '../utils/errorHandler.js';

// Get global pool statistics
export const getGlobalPoolStats = asyncHandler(async (req, res) => {
  logger.info('📊 Fetching global pool statistics');
  
  const [stats, balance, eligibleUsers] = await Promise.all([
    contract.getGlobalPoolStats(),
    contract.globalPoolBalance(),
    contract.getEligibleUsers()
  ]);
  
  res.json({
    success: true,
    data: {
      totalAllocated: {
        wei: stats[0].toString(),
        usdt: formatAmount(stats[0])
      },
      totalClaimed: {
        wei: stats[1].toString(),
        usdt: formatAmount(stats[1])
      },
      totalPending: {
        wei: stats[2].toString(),
        usdt: formatAmount(stats[2])
      },
      eligibleCount: stats[3].toString(),
      currentBalance: {
        wei: balance.toString(),
        usdt: formatAmount(balance)
      },
      eligibleUsers: eligibleUsers.length,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Distribute global pool (virtual distribution)
export const distributeGlobalPool = asyncHandler(async (req, res) => {
  logger.info('🎯 Starting global pool distribution');
  
  // Get current stats before distribution
  const [statsBefore, eligibleUsers] = await Promise.all([
    contract.getGlobalPoolStats(),
    contract.getEligibleUsers()
  ]);
  
  const eligibleCount = eligibleUsers.length;
  const balanceBefore = statsBefore[0]; // totalAllocated
  
  if (eligibleCount === 0) {
    throw new ValidationError('No eligible users found for distribution');
  }
  
  if (balanceBefore === 0n) {
    throw new ValidationError('No funds available for distribution');
  }
  
  // Estimate gas
  logger.info('⛽ Estimating gas for distributeGlobalPoolVirtual transaction');
  const gasEstimate = await contract.distributeGlobalPoolVirtual.estimateGas();
  const gasLimit = gasEstimate * 130n / 100n; // Add 30% buffer
  
  // Send transaction
  logger.info(`🚀 Sending distributeGlobalPoolVirtual transaction`);
  const tx = await contract.distributeGlobalPoolVirtual({ gasLimit });
  
  logger.info(`⏳ Waiting for confirmation: ${tx.hash}`);
  const receipt = await tx.wait(1);
  
  logger.info(`✅ Global pool distribution confirmed in block ${receipt.blockNumber}`);
  
  // Get stats after distribution
  const statsAfter = await contract.getGlobalPoolStats();
  
  res.json({
    success: true,
    message: `Global pool successfully distributed to ${eligibleCount} eligible users`,
    data: {
      distribution: {
        eligibleUsers: eligibleCount,
        totalDistributed: {
          wei: balanceBefore.toString(),
          usdt: formatAmount(balanceBefore)
        },
        perUser: {
          wei: (balanceBefore / BigInt(eligibleCount)).toString(),
          usdt: formatAmount(balanceBefore / BigInt(eligibleCount))
        }
      },
      before: {
        totalAllocated: formatAmount(statsBefore[0]),
        totalPending: formatAmount(statsBefore[2])
      },
      after: {
        totalAllocated: formatAmount(statsAfter[0]),
        totalPending: formatAmount(statsAfter[2])
      },
      transaction: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    }
  });
});
