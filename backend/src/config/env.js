import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Validate required environment variables
const requiredEnvVars = [
  'RPC_URL',
  'MANAGER_PRIVATE_KEY',
  'CONTRACT_ADDRESS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease create a .env file based on .env.example');
  process.exit(1);
}

export const config = {
  // Network Configuration
  rpcUrl: process.env.RPC_URL,
  chainId: parseInt(process.env.CHAIN_ID) || 1137,
  networkName: process.env.NETWORK_NAME || 'ucchain-mainnet',
  
  // Contract Configuration
  contractAddress: process.env.CONTRACT_ADDRESS,
  usdtContractAddress: process.env.USDT_CONTRACT_ADDRESS,
  
  // Manager Wallet
  managerPrivateKey: process.env.MANAGER_PRIVATE_KEY,
  
  // Server Configuration
  port: parseInt(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Configuration
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  apiKey: process.env.API_KEY,
  
  // Eligibility Requirements
  minReferralsForEligibility: parseInt(process.env.MIN_REFERRALS_FOR_ELIGIBILITY) || 10,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Log configuration (excluding sensitive data)
console.log('🔧 Configuration loaded:');
console.log(`   Network: ${config.networkName} (Chain ID: ${config.chainId})`);
console.log(`   Contract: ${config.contractAddress}`);
console.log(`   Port: ${config.port}`);
console.log(`   Environment: ${config.nodeEnv}`);
