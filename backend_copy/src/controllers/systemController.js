import { contract, provider, managerWallet, formatAmount, testConnection } from '../config/blockchain.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { BlockchainError, asyncHandler } from '../utils/errorHandler.js';

// Health check endpoint
export const healthCheck = asyncHandler(async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// System status with blockchain connection
export const systemStatus = asyncHandler(async (req, res) => {
  logger.info('🔍 System status check requested');
  
  const connectionTest = await testConnection();
  
  const status = {
    system: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv
    },
    blockchain: connectionTest,
    configuration: {
      network: config.networkName,
      chainId: config.chainId,
      contractAddress: config.contractAddress,
      managerAddress: managerWallet.address
    }
  };
  
  res.status(connectionTest.success ? 200 : 503).json(status);
});

// Get contract statistics
export const getContractStats = asyncHandler(async (req, res) => {
  logger.info('📊 Fetching contract statistics');
  
  const [contractStats, globalPoolStats, eligibleUsers] = await Promise.all([
    contract.getContractStats(),
    contract.getGlobalPoolStats(),
    contract.getEligibleUsers()
  ]);
  
  res.json({
    success: true,
    data: {
      users: {
        total: contractStats[0].toString(),
        activated: contractStats[1].toString(),
        eligible: eligibleUsers.length.toString()
      },
      globalPool: {
        balance: {
          wei: contractStats[2].toString(),
          usdt: formatAmount(contractStats[2])
        },
        totalDistributed: {
          wei: contractStats[3].toString(),
          usdt: formatAmount(contractStats[3])
        },
        totalAllocated: {
          wei: globalPoolStats[0].toString(),
          usdt: formatAmount(globalPoolStats[0])
        },
        totalPending: {
          wei: globalPoolStats[2].toString(),
          usdt: formatAmount(globalPoolStats[2])
        }
      },
      network: {
        name: config.networkName,
        chainId: config.chainId
      },
      lastUpdated: new Date().toISOString()
    }
  });
});
