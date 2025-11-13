/**
 * Test Request Eligibility Flow
 * Simulates users clicking the "Request Eligibility" button
 */

import { ethers } from 'ethers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://usdtrain-production.up.railway.app';
const API_PREFIX = '/api/v1';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.ucchain.org/';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS || '0x9b7f2CF537F81f2fCfd3252B993b7B12a47648d1';

// Minimal ABI for testing
const CONTRACT_ABI = [
  'function getUserInfo(address) view returns (uint256, address, uint256, uint256, uint256, bool, uint256, uint256, uint256, string)',
  'function getEligibleUsers() view returns (address[])',
];

interface TestResult {
  address: string;
  userId: string;
  userName: string;
  directReferrals: number;
  isActive: boolean;
  alreadyEligible: boolean;
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Simulate the frontend API route call
 */
async function requestEligibility(address: string): Promise<any> {
  console.log(`\n🔄 Requesting eligibility for: ${address}`);
  
  try {
    // This simulates the call from app/income/page.tsx -> /api/request-eligibility
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/eligible-users/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });

    const data = await response.json();
    
    console.log(`   Response Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    return {
      success: response.ok && data.success,
      data: data.data || data,
      error: data.error
    };
  } catch (error: any) {
    console.error(`   ❌ Request failed:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get user info from contract
 */
async function getUserInfo(address: string, contract: any): Promise<any> {
  try {
    const userInfo = await contract.getUserInfo(address);
    return {
      userId: userInfo[0].toString(),
      sponsor: userInfo[1],
      directReferrals: Number(userInfo[2]),
      totalTeam: Number(userInfo[3]),
      totalInvestment: userInfo[4],
      isActive: userInfo[5],
      totalEarnings: userInfo[6],
      achieverLevel: Number(userInfo[7]),
      lastActivityTime: Number(userInfo[8]),
      userName: userInfo[9] || 'Unknown'
    };
  } catch (error: any) {
    console.error(`Failed to get user info:`, error.message);
    return null;
  }
}

/**
 * Check if user is already eligible
 */
async function checkIfEligible(address: string, contract: any): Promise<boolean> {
  try {
    const eligibleUsers = await contract.getEligibleUsers();
    return eligibleUsers.some((addr: string) => addr.toLowerCase() === address.toLowerCase());
  } catch (error: any) {
    console.error(`Failed to check eligibility:`, error.message);
    return false;
  }
}

/**
 * Test eligibility request for a user
 */
async function testUserEligibilityRequest(
  address: string,
  contract: any
): Promise<TestResult> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing Eligibility Request for: ${address}`);
  console.log('='.repeat(80));

  // Get user info from contract
  console.log('\n📊 Fetching user info from contract...');
  const userInfo = await getUserInfo(address, contract);
  
  if (!userInfo) {
    return {
      address,
      userId: '0',
      userName: 'Unknown',
      directReferrals: 0,
      isActive: false,
      alreadyEligible: false,
      success: false,
      message: 'Failed to fetch user info',
      error: 'User not found in contract'
    };
  }

  console.log(`   User ID: ${userInfo.userId}`);
  console.log(`   Username: ${userInfo.userName}`);
  console.log(`   Direct Referrals: ${userInfo.directReferrals}`);
  console.log(`   Is Active: ${userInfo.isActive}`);
  console.log(`   Achiever Level: ${userInfo.achieverLevel}`);

  // Check if already eligible
  console.log('\n🔍 Checking current eligibility status...');
  const alreadyEligible = await checkIfEligible(address, contract);
  console.log(`   Already Eligible: ${alreadyEligible}`);

  // Validate requirements
  if (!userInfo.isActive) {
    return {
      address,
      userId: userInfo.userId,
      userName: userInfo.userName,
      directReferrals: userInfo.directReferrals,
      isActive: false,
      alreadyEligible,
      success: false,
      message: 'User account is not activated',
      error: 'Account not activated'
    };
  }

  if (userInfo.directReferrals < 10) {
    return {
      address,
      userId: userInfo.userId,
      userName: userInfo.userName,
      directReferrals: userInfo.directReferrals,
      isActive: userInfo.isActive,
      alreadyEligible,
      success: false,
      message: `User needs ${10 - userInfo.directReferrals} more referrals`,
      error: 'Insufficient referrals'
    };
  }

  // Request eligibility
  console.log('\n🚀 Sending eligibility request to backend...');
  const result = await requestEligibility(address);

  if (result.success) {
    console.log(`   ✅ Success! User added to eligible list`);
    if (result.data?.transaction) {
      console.log(`   Transaction Hash: ${result.data.transaction.hash}`);
      console.log(`   Block Number: ${result.data.transaction.blockNumber}`);
      console.log(`   Gas Used: ${result.data.transaction.gasUsed}`);
    }
  } else {
    console.log(`   ❌ Failed: ${result.error}`);
  }

  return {
    address,
    userId: userInfo.userId,
    userName: userInfo.userName,
    directReferrals: userInfo.directReferrals,
    isActive: userInfo.isActive,
    alreadyEligible,
    success: result.success,
    message: result.success ? 'Successfully added to eligible list' : result.error || 'Request failed',
    error: result.error
  };
}

/**
 * Main test function
 */
async function runEligibilityTests() {
  console.log('🧪 Testing Request Eligibility Flow');
  console.log('Simulating users clicking "Request Eligibility" button\n');
  console.log('='.repeat(80));

  // Connect to contract
  console.log('\n⛓️  Connecting to smart contract...');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  console.log(`   Contract: ${CONTRACT_ADDRESS}`);
  console.log(`   Network: UCChain Mainnet`);

  // Get current eligible users
  console.log('\n📋 Fetching current eligible users...');
  const eligibleUsers = await contract.getEligibleUsers();
  console.log(`   Current Eligible Count: ${eligibleUsers.length}`);

  // Test users (the 2 eligible users from the system)
  const testUsers = [
    {
      address: '0x376989c62D99dc5519e66CEeA981ad662aE4DD07',
      name: 'Admin'
    },
    {
      address: '0xA2f9ebE6b91c2c4020e87c879445885bA54aebB7',
      name: 'Bala3'
    }
  ];

  const results: TestResult[] = [];

  // Test each user
  for (const user of testUsers) {
    const result = await testUserEligibilityRequest(user.address, contract);
    results.push(result);
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Summary');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const alreadyEligible = results.filter(r => r.alreadyEligible).length;
  const failed = results.filter(r => !r.success && !r.alreadyEligible).length;

  console.log(`\n✅ Successful Requests: ${successful}`);
  console.log(`ℹ️  Already Eligible: ${alreadyEligible}`);
  console.log(`❌ Failed Requests: ${failed}`);
  console.log(`📊 Total Tested: ${results.length}`);

  console.log('\n📋 Detailed Results:\n');
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : result.alreadyEligible ? 'ℹ️' : '❌';
    console.log(`${icon} User ${index + 1}: ${result.userName} (${result.address.slice(0, 10)}...)`);
    console.log(`   User ID: ${result.userId}`);
    console.log(`   Direct Referrals: ${result.directReferrals}`);
    console.log(`   Is Active: ${result.isActive}`);
    console.log(`   Status: ${result.message}`);
    if (result.error && !result.alreadyEligible) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  });

  // Verify final state
  console.log('='.repeat(80));
  console.log('🔍 Verifying Final State');
  console.log('='.repeat(80));

  const finalEligibleUsers = await contract.getEligibleUsers();
  console.log(`\n✅ Final Eligible Users Count: ${finalEligibleUsers.length}`);
  console.log('\nEligible Addresses:');
  finalEligibleUsers.forEach((addr: string, index: number) => {
    console.log(`   ${index + 1}. ${addr}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test Complete!');
  console.log('='.repeat(80));

  if (successful > 0) {
    console.log('\n🎉 Successfully added users to eligible list!');
    console.log('   Users can now receive global pool distributions.');
  }

  if (alreadyEligible > 0) {
    console.log('\nℹ️  Some users were already eligible.');
  }

  if (failed > 0) {
    console.log('\n⚠️  Some requests failed. Check the details above.');
  }
}

// Run tests
runEligibilityTests().catch(console.error);
