/**
 * Test script to check global pool balance and distribution requirements
 * Run with: npx tsx scripts/check-global-pool-balance.ts
 */

import { ethers } from 'ethers';
import USDTRainABI from '../lib/contracts/abi/USDTRain.json';

async function checkGlobalPoolBalance() {
  console.log('🔍 Checking Global Pool Balance...\n');

  const contractAddress = process.env.NEXT_PUBLIC_USDTRAIN_CONTRACT_ADDRESS;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const usdtAddress = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS;

  if (!contractAddress || !rpcUrl || !usdtAddress) {
    console.error('❌ Missing environment variables');
    return;
  }

  console.log('📍 USDTRain Contract:', contractAddress);
  console.log('📍 USDT Token:', usdtAddress);
  console.log('🌐 RPC URL:', rpcUrl);
  console.log('');

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, USDTRainABI, provider);

    // Get global pool balance from contract
    console.log('💰 Global Pool Balance (from contract):');
    const globalPoolBalance = await contract.globalPoolBalance();
    console.log('   Wei:', globalPoolBalance.toString());
    console.log('   USDT:', (Number(globalPoolBalance) / 1e18).toFixed(6));
    console.log('');

    // Get eligible users
    console.log('👥 Eligible Users:');
    const eligibleUsers = await contract.getEligibleUsers();
    console.log('   Count:', eligibleUsers.length);
    console.log('   Users:', eligibleUsers);
    console.log('');

    // Calculate distribution per user
    if (eligibleUsers.length > 0) {
      const perUser = globalPoolBalance / BigInt(eligibleUsers.length);
      console.log('💸 Distribution Per User:');
      console.log('   Wei:', perUser.toString());
      console.log('   USDT:', (Number(perUser) / 1e18).toFixed(6));
      console.log('');
    }

    // Get actual USDT balance of the contract
    console.log('🏦 Actual USDT Token Balance:');
    const usdtABI = [
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];
    const usdtContract = new ethers.Contract(usdtAddress, usdtABI, provider);
    const actualBalance = await usdtContract.balanceOf(contractAddress);
    console.log('   Wei:', actualBalance.toString());
    console.log('   USDT:', (Number(actualBalance) / 1e18).toFixed(6));
    console.log('');

    // Compare balances
    console.log('⚖️  Balance Comparison:');
    console.log('   Global Pool Balance:', (Number(globalPoolBalance) / 1e18).toFixed(6), 'USDT');
    console.log('   Actual USDT Balance:', (Number(actualBalance) / 1e18).toFixed(6), 'USDT');
    
    if (actualBalance < globalPoolBalance) {
      console.log('   ❌ PROBLEM: Actual balance is LESS than global pool balance!');
      console.log('   This will cause "transfer amount exceeds balance" error');
      console.log('');
      console.log('💡 Possible Causes:');
      console.log('   1. Global pool balance tracking is incorrect');
      console.log('   2. USDT was withdrawn from contract without updating global pool');
      console.log('   3. Contract accounting bug');
    } else if (actualBalance >= globalPoolBalance) {
      console.log('   ✅ Actual balance is sufficient for distribution');
    }
    console.log('');

    // Get other contract stats
    console.log('📊 Contract Stats:');
    try {
      const totalUsers = await contract.totalUsers();
      console.log('   Total Users:', totalUsers.toString());
    } catch (e) {
      console.log('   Total Users: N/A');
    }

    try {
      const levelIncomePercentage = await contract.levelIncomePercentage();
      const globalPoolPercentage = await contract.globalPoolPercentage();
      const reservePercentage = await contract.reservePercentage();
      console.log('   Level Income %:', levelIncomePercentage.toString());
      console.log('   Global Pool %:', globalPoolPercentage.toString());
      console.log('   Reserve %:', reservePercentage.toString());
    } catch (e) {
      console.log('   Percentages: N/A');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkGlobalPoolBalance().catch(console.error);
