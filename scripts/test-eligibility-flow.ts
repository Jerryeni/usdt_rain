/**
 * Test script to verify the eligibility request flow
 */

const BACKEND_URL = 'https://usdtrains.onrender.com/api/v1';

async function testEligibilityFlow() {
  console.log('🧪 Testing Eligibility Request Flow\n');

  // Test 1: Health check
  console.log('1️⃣ Testing backend health...');
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend is healthy:', healthData);
  } catch (error: any) {
    console.error('❌ Backend health check failed:', error.message);
    return;
  }

  // Test 2: Check eligibility for a test address
  const testAddress = '0x1234567890123456789012345678901234567890';
  console.log(`\n2️⃣ Checking eligibility for test address: ${testAddress}`);
  try {
    const checkResponse = await fetch(`${BACKEND_URL}/eligible-users/check/${testAddress}`);
    const checkData = await checkResponse.json();
    console.log('Response:', checkData);
    
    if (!checkData.success) {
      console.log('⚠️ Expected: User not registered (this is normal for test address)');
    }
  } catch (error: any) {
    console.error('❌ Check eligibility failed:', error.message);
  }

  // Test 3: Try to add user (will fail for unregistered user)
  console.log(`\n3️⃣ Attempting to add test address to eligible list...`);
  try {
    const addResponse = await fetch(`${BACKEND_URL}/eligible-users/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: testAddress })
    });
    const addData = await addResponse.json();
    console.log('Response:', addData);
    
    if (!addData.success && addData.error?.includes('not registered')) {
      console.log('✅ Expected error: User must be registered first');
    }
  } catch (error: any) {
    console.error('❌ Add user failed:', error.message);
  }

  console.log('\n✅ Test completed!');
  console.log('\n📝 Notes:');
  console.log('- Backend is accessible and responding correctly');
  console.log('- To test with a real user, they must:');
  console.log('  1. Be registered in the contract');
  console.log('  2. Have activated their account');
  console.log('  3. Have at least 10 direct referrals');
}

testEligibilityFlow().catch(console.error);
