import { ethers } from 'ethers';
import { config } from './env.js';

// ✅ CORRECT ABI: NO PARAMETER NAME (exactly matching user's working code)
const CONTRACT_ABI = [
  "function addEligibleUser(address) external",
  "function removeEligibleUser(address) external", 
  "function getUserInfo(address) view returns (uint256,uint256,uint256,uint256,uint256,bool,uint256,uint256,uint256,string,string)",
  "function getEligibleUsers() view returns (address[])",
  "function eligibleUserCount() view returns (uint256)",
  "function getUserAddressById(uint256) view returns (address)",
  "function totalUsers() view returns (uint256)",
  "function manager() view returns (address)",
  "function getGlobalPoolStats() view returns (uint256,uint256,uint256,uint256)",
  "function globalPoolBalance() view returns (uint256)",
  "function getContractStats() view returns (uint256,uint256,uint256,uint256)",
  "function distributeGlobalPoolVirtual() external"
];

console.log('✅ Contract ABI loaded successfully');

// ✅ UCChain Provider Configuration (exactly matching user's working code)
export const provider = new ethers.JsonRpcProvider(config.rpcUrl, { 
  chainId: config.chainId, 
  name: config.networkName 
});

// ✅ Manager Wallet
export const managerWallet = new ethers.Wallet(config.managerPrivateKey, provider);

// ✅ Contract Instance
export const contract = new ethers.Contract(
  config.contractAddress,
  CONTRACT_ABI,
  managerWallet
);

// ✅ Exported for direct use (matching user's approach)
export { ethers };

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
