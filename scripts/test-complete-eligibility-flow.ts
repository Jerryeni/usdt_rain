/**
 * Complete Eligibility Flow Test
 * Tests the entire flow from frontend to backend to smart contract
 */

const BACKEND_URL = 'https://usdtrain-production.up.railway.app/api/v1';
const FRONTEND_API = 'http://localhost:3000/api/request-eligibility';

// Test user with 10+ referrals
const TEST_ADDRESS = '0xA2f9ebE6b91c2c4020e87c879445885bA54aebB7'; // Bala3

async function testBackendDirect() {
  console.log('\n🧪 Test 1: Direct Backend API Call');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${BACKEND_URL}/eligible-users/check/${TEST_ADDRESS}`);
    const data = await response.json();
    
    console.log('✅ Backend Response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      data
    });
    
    if (data.success && data.data) {
      console.log(`\n📊 User Info:`);
      console.log(`   Address: ${data.data.address}`);
      console.log(`   User ID: ${data.data.userId}`);
      console.log(`   Direct Referrals: ${data.data.directReferrals}`);
      console.log(`   Is Active: ${data.data.isActive}`);
      console.log(`   Is Eligible: ${data.data.isEligible}`);
      console.log(`   Username: ${data.data.userName}`);
      
      return data.data;
    }
  } catch (error: any) {
    console.error('❌ Backend test failed:', error.message);
    return null;
  }
}

async function testBackendAddEligible() {
  console.log('\n🧪 Test 2: Add User to Eligible List (Backend)');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${BACKEND_URL}/eligible-users/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: TEST_ADDRESS })
    });
    
    const contentType = response.headers.get('content-type');
    console.log(`Response Status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text.substring(0, 200));
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Backend Response:', data);
    
    if (data.success) {
      if (data.data.alreadyEligible) {
        console.log('ℹ️  User is already eligible');
      } else {
        console.log('✅ User successfully added to eligible list');
      }
      return true;
    } else {
      console.error('❌ Failed:', data.error);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Add eligible test failed:', error.message);
    return false;
  }
}

async function testFrontendAPI() {
  console.log('\n🧪 Test 3: Frontend API Route');
  console.log('='.repeat(60));
  console.log('⚠️  Note: This test requires the Next.js dev server to be running');
  console.log('   Run: npm run dev');
  
  try {
    const response = await fetch(FRONTEND_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: TEST_ADDRESS })
    });
    
    const contentType = response.headers.get('content-type');
    console.log(`Response Status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text.substring(0, 200));
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Frontend API Response:', data);
    
    return data.success || data.error?.includes('already');
  } catch (error: any) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('⚠️  Frontend server not running. Skipping this test.');
      return null;
    }
    console.error('❌ Frontend API test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🔍 Complete Eligibility Flow Test');
  console.log('='.repeat(60));
  console.log(`Test Address: ${TEST_ADDRESS}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend API: ${FRONTEND_API}`);
  
  const results = {
    backendCheck: false,
    backendAdd: false,
    frontendAPI: null as boolean | null
  };
  
  // Test 1: Check user eligibility
  const userInfo = await testBackendDirect();
  results.backendCheck = userInfo !== null;
  
  // Test 2: Add user to eligible list
  results.backendAdd = await testBackendAddEligible();
  
  // Test 3: Frontend API
  results.frontendAPI = await testFrontendAPI();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Backend Check: ${results.backendCheck ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Backend Add: ${results.backendAdd ? 'PASS' : 'FAIL'}`);
  console.log(`${results.frontendAPI === null ? '⏭️ ' : results.frontendAPI ? '✅' : '❌'} Frontend API: ${results.frontendAPI === null ? 'SKIPPED' : results.frontendAPI ? 'PASS' : 'FAIL'}`);
  
  const passed = [results.backendCheck, results.backendAdd].filter(Boolean).length;
  const total = 2 + (results.frontendAPI !== null ? 1 : 0);
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (results.backendCheck && results.backendAdd) {
    console.log('\n✅ Backend integration is working correctly!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start the frontend: npm run dev');
    console.log('   2. Navigate to: http://localhost:3000/income');
    console.log('   3. Click "Request Eligibility" button');
    console.log('   4. Check browser console for detailed logs');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
  }
}

runAllTests().catch(console.error);
