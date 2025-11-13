import { contract } from './src/config/blockchain.js';
import { config } from './src/config/env.js';

// Test address - replace with actual user address
const TEST_ADDRESS = process.argv[2] || '0xa2f9ebe6b91c2c4020e87c879445885ba54aebb7';

(async () => {
  try {
    console.log('🧪 Testing addEligibleUser function');
    console.log(`📍 Target address: ${TEST_ADDRESS}`);
    console.log('');

    // Step 1: Get user info
    console.log('1️⃣ Checking user info...');
    const userInfo = await contract.getUserInfo(TEST_ADDRESS);
    const userId = userInfo[0];
    const directReferrals = Number(userInfo[2]);
    const isActive = userInfo[5];
    const userName = userInfo[9];

    console.log(`   User ID: ${userId.toString()}`);
    console.log(`   Username: ${userName || 'Not set'}`);
    console.log(`   Direct Referrals: ${directReferrals}`);
    console.log(`   Is Active: ${isActive}`);
    console.log('');

    // Step 2: Validate
    if (userId === 0n) {
      console.log('❌ User is not registered');
      process.exit(1);
    }

    if (!isActive) {
      console.log('❌ User is not activated');
      process.exit(1);
    }

    if (directReferrals < config.minReferralsForEligibility) {
      console.log(`❌ User needs ${config.minReferralsForEligibility} referrals (has ${directReferrals})`);
      process.exit(1);
    }

    console.log('✅ User meets all requirements');
    console.log('');

    // Step 3: Check if already eligible
    console.log('2️⃣ Checking if already eligible...');
    const eligibleUsers = await contract.getEligibleUsers();
    const alreadyEligible = eligibleUsers.some(
      addr => addr.toLowerCase() === TEST_ADDRESS.toLowerCase()
    );

    if (alreadyEligible) {
      console.log('ℹ️  User is already in the eligible list');
      process.exit(0);
    }

    console.log('   Not in eligible list yet');
    console.log('');

    // Step 4: Estimate gas
    console.log('3️⃣ Estimating gas...');
    const gasEstimate = await contract.addEligibleUser.estimateGas(TEST_ADDRESS);
    const gasLimit = gasEstimate * 120n / 100n;
    console.log(`   Gas estimate: ${gasEstimate.toString()}`);
    console.log(`   Gas limit (with 20% buffer): ${gasLimit.toString()}`);
    console.log('');

    // Step 5: Send transaction
    console.log('4️⃣ Sending transaction...');
    const tx = await contract.addEligibleUser(TEST_ADDRESS, { gasLimit });
    console.log(`   TX Hash: ${tx.hash}`);
    console.log('');

    // Step 6: Wait for confirmation
    console.log('5️⃣ Waiting for confirmation...');
    const receipt = await tx.wait(1);
    console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log('');

    console.log('🎉 SUCCESS! User added to eligible list');

  } catch (error) {
    console.error('❌ FAILED:', error.reason || error.message);
    console.error('');
    console.error('Error details:', error);
    process.exit(1);
  }
})();
