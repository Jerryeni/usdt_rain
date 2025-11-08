/**
 * Test script to check eligible users directly from the contract
 * Run with: npx tsx scripts/test-eligible-users.ts
 */

import { ethers } from 'ethers';
import USDTRainABI from '../lib/contracts/abi/USDTRain.json';

async function testEligibleUsers() {
  console.log('🔍 Testing Eligible Users...\n');

  // Get contract address and RPC URL from environment
  const contractAddress = process.env.NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  if (!contractAddress || !rpcUrl) {
    console.error('❌ Missing environment variables');
    console.log('NEXT_PUBLIC_CONTRACT_ADDRESS:', contractAddress);
    console.log('NEXT_PUBLIC_RPC_URL:', rpcUrl);
    return;
  }

  console.log('📍 Contract Address:', contractAddress);
  console.log('🌐 RPC URL:', rpcUrl);
  console.log('');

  try {
    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, USDTRainABI, provider);

    console.log('✅ Connected to contract\n');

    // Test 1: Get eligible users array
    console.log('📋 Test 1: Calling getEligibleUsers()...');
    try {
      const eligibleUsers = await contract.getEligibleUsers();
      console.log('✅ Success!');
      console.log('   Type:', typeof eligibleUsers);
      console.log('   Is Array:', Array.isArray(eligibleUsers));
      console.log('   Length:', eligibleUsers.length);
      console.log('   Users:', eligibleUsers);
      console.log('');
    } catch (error: any) {
      console.error('❌ Failed:', error.message);
      console.log('');
    }

    // Test 2: Get eligible user count
    console.log('🔢 Test 2: Calling eligibleUserCount()...');
    try {
      const count = await contract.eligibleUserCount();
      console.log('✅ Success!');
      console.log('   Type:', typeof count);
      console.log('   Value:', count.toString());
      console.log('   Number:', Number(count));
      console.log('');
    } catch (error: any) {
      console.error('❌ Failed:', error.message);
      console.log('');
    }

    // Test 3: Check if functions exist
    console.log('🔍 Test 3: Checking function availability...');
    console.log('   getEligibleUsers exists:', typeof contract.getEligibleUsers === 'function');
    console.log('   eligibleUserCount exists:', typeof contract.eligibleUserCount === 'function');
    console.log('   addEligibleUser exists:', typeof contract.addEligibleUser === 'function');
    console.log('   removeEligibleUser exists:', typeof contract.removeEligibleUser === 'function');
    console.log('');

    // Test 4: Get global pool balance
    console.log('💰 Test 4: Calling globalPoolBalance()...');
    try {
      const balance = await contract.globalPoolBalance();
      console.log('✅ Success!');
      console.log('   Balance (wei):', balance.toString());
      console.log('   Balance (USDT):', (Number(balance) / 1e18).toFixed(2));
      console.log('');
    } catch (error: any) {
      console.error('❌ Failed:', error.message);
      console.log('');
    }

    console.log('✅ All tests completed!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

// Run the test
testEligibleUsers().catch(console.error);
