import { ethers } from 'ethers';
import { config } from './env.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load contract ABI from the main project
const abiPath = join(__dirname, '../../../lib/contracts/abi/USDTRain.json');
let CONTRACT_ABI;

try {
  CONTRACT_ABI = JSON.parse(readFileSync(abiPath, 'utf8'));
  console.log('✅ Contract ABI loaded successfully');
} catch (error) {
  console.error('❌ Failed to load contract ABI:', error.message);
  console.error('   Make sure the ABI file exists at:', abiPath);
  process.exit(1);
}

// UCChain Provider Configuration
export const provider = new ethers.JsonRpcProvider(config.rpcUrl, {
  chainId: config.chainId,
  name: config.networkName
});

// Manager Wallet
export const managerWallet = new ethers.Wallet(config.managerPrivateKey, provider);

// Contract Instance
export const contract = new ethers.Contract(
  config.contractAddress,
  CONTRACT_ABI,
  managerWallet
);

// Utility function to check if address is valid
export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

// Utility function to format amounts (USDT has 18 decimals)
export const formatAmount = (amount, decimals = 18) => {
  return ethers.formatUnits(amount, decimals);
};

// Utility function to parse amounts
export const parseAmount = (amount, decimals = 18) => {
  return ethers.parseUnits(amount.toString(), decimals);
};

// Test blockchain connection
export const testConnection = async () => {
  try {
    console.log('🔗 Testing blockchain connection...');
    
    // Test provider connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to ${network.name} (Chain ID: ${network.chainId})`);
    
    // Test wallet balance
    const balance = await provider.getBalance(managerWallet.address);
    console.log(`💰 Manager wallet: ${managerWallet.address}`);
    console.log(`💰 Manager balance: ${formatAmount(balance)} UCH`);
    
    // Test contract connection
    const totalUsers = await contract.totalUsers();
    console.log(`👥 Total users in contract: ${totalUsers.toString()}`);
    
    // Test manager permissions
    const contractManager = await contract.manager();
    const isManager = contractManager.toLowerCase() === managerWallet.address.toLowerCase();
    console.log(`🔑 Contract manager: ${contractManager}`);
    console.log(`🔑 Manager permissions: ${isManager ? '✅ Authorized' : '❌ Not authorized'}`);
    
    if (!isManager) {
      console.warn('⚠️  WARNING: Your wallet is not set as the contract manager!');
      console.warn('   You may not have permission to add/remove eligible users.');
    }
    
    return {
      success: true,
      network: network.name,
      chainId: network.chainId.toString(),
      managerAddress: managerWallet.address,
      managerBalance: formatAmount(balance),
      totalUsers: totalUsers.toString(),
      isManager
    };
  } catch (error) {
    console.error('❌ Blockchain connection test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
