/**
 * Test New User Eligibility Request
 * Simulates a new user with 10+ referrals requesting eligibility
 */

import { ethers } from 'ethers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://usdtrain-production.up.railway.app';
const API_PREFIX = '/api/v1';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.ucchain.org/';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS || '0x9b7f2CF537F81f2fCfd3252B993b7B12a47648d1';

// Minimal ABI
const CONTRACT_ABI = [
  'function getUserInfo(address) view returns (uint256, address, uint256, uint256, uint256, bool, uint256, uint256, uint256, string)',
  'function getEligibleUsers() view returns (address[])',
];

/**
 * Find users with 10+ referrals who aren't eligible yet
 */
async function findEligibleCandidates(contract: any): Promise<string[]> {
  console.log('\n🔍 Scanning for users with 10+ referrals who are not yet eligible...\n');
  
  const eligibleUsers = await contract.getEligibleUsers();
  const eligibleSet = new Set(eligibleUsers.map((addr: string) => addr.toLowerCase()));
  
  console.log(`   Current eligible users: ${eligibleUsers.length}`);
  
  // Sample some user IDs to check (you can expand this range)
  const candidates: string[] = [];
  const sampleSize = 50; // Check first 50 registered users
  
  for (let userId = 1; userId <= sampleSize; userId++) {
    try {
      // Try to get user by constructing potential addresses
      // This is a simplified approach - in production you'd query events or have an index
      console.log(`   Checking user ID ${userId}...`);
      
      // Note: This is a demonstration. In reality, you'd need to:
      // 1. Query Registration events from the blockchain
      // 2. Or maintain an index of all registered users
      // 3. Or have the backend provide a list of all users
      
    } catch (error) {
      // User doesn't exist, continue
    }
  }
  
  return candidates;
}

/**
 * Request eligibility for a specific address
 */
async function requestEligibilityForUser(address: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing Eligibility Request`);
  console.log('='.repeat(80));
  console.log(`\nAddress: ${address}`);
  
  // Connect to contract
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  
  // Get user info
  console.log('\n📊 Fetching user info...');
  try {
    const userInfo = await contract.getUserInfo(address);
    const userId = userInfo[0].toString();
    const directReferrals = Number(userInfo[2]);
    const isActive = userInfo[5];
    const userName = userInfo[9] || 'Unknown';
    
    console.log(`   User ID: ${userId}`);
    console.log(`   Username: ${userName}`);
    console.log(`   Direct Referrals: ${directReferrals}`);
    console.log(`   Is Active: ${isActive}`);
    
    if (userId === '0') {
      console.log('\n❌ User is not registered in the system');
      return;
    }
    
    if (!isActive) {
      console.log('\n❌ User account is not activated');
      return;
    }
    
    if (directReferrals < 10) {
      console.log(`\n❌ User needs ${10 - directReferrals} more referrals (current: ${directReferrals})`);
      return;
    }
    
    // Check if already eligible
    const eligibleUsers = await contract.getEligibleUsers();
    const isEligible = eligibleUsers.some((addr: string) => addr.toLowerCase() === address.toLowerCase());
    
    if (isEligible) {
      console.log('\nℹ️  User is already in the eligible list');
      return;
    }
    
    // Request eligibility
    console.log('\n🚀 Sending eligibility request...');
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/eligible-users/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('\n✅ SUCCESS! User added to eligible list');
      if (data.data?.transaction) {
        console.log(`   Transaction Hash: ${data.data.transaction.hash}`);
        console.log(`   Block Number: ${data.data.transaction.blockNumber}`);
        console.log(`   Gas Used: ${data.data.transaction.gasUsed}`);
      }
      
      // Verify
      console.log('\n🔍 Verifying...');
      const updatedEligibleUsers = await contract.getEligibleUsers();
      const nowEligible = updatedEligibleUsers.some((addr: string) => addr.toLowerCase() === address.toLowerCase());
      console.log(`   User is now eligible: ${nowEligible}`);
      console.log(`   Total eligible users: ${updatedEligibleUsers.length}`);
    } else {
      console.log(`\n❌ Failed: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧪 Test New User Eligibility Request');
  console.log('Simulating a user with 10+ referrals requesting eligibility\n');
  console.log('='.repeat(80));
  
  // You can specify a user address here to test
  // For demonstration, we'll show how to use it
  const testAddress = process.argv[2];
  
  if (testAddress) {
    await requestEligibilityForUser(testAddress);
  } else {
    console.log('\n📝 Usage:');
    console.log('   npx tsx scripts/test-new-user-eligibility.ts <USER_ADDRESS>');
    console.log('\nExample:');
    console.log('   npx tsx scripts/test-new-user-eligibility.ts 0x1234567890123456789012345678901234567890');
    console.log('\n💡 This script will:');
    console.log('   1. Check if the user is registered');
    console.log('   2. Verify the user has 10+ direct referrals');
    console.log('   3. Confirm the user is activated');
    console.log('   4. Request eligibility via the backend');
    console.log('   5. Verify the user was added to the eligible list');
    console.log('\n📋 Current System Status:');
    
    // Show current stats
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const eligibleUsers = await contract.getEligibleUsers();
    
    console.log(`   Total Eligible Users: ${eligibleUsers.length}`);
    console.log('\n   Eligible Addresses:');
    eligibleUsers.forEach((addr: string, index: number) => {
      console.log(`   ${index + 1}. ${addr}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);
