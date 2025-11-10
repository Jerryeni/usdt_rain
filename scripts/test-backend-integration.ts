#!/usr/bin/env ts-node

/**
 * Backend Integration Test Script
 * 
 * Tests the backend API integration and verifies all endpoints are working
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY;

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  url: string,
  options: RequestInit = {}
): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

   

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    const duration = Date.now() - start;

    if (!response.ok) {
      return {
        name,
        passed: false,
        message: `HTTP ${response.status}: ${data.error || response.statusText}`,
        duration,
      };
    }

    return {
      name,
      passed: true,
      message: 'Success',
      duration,
    };
  } catch (error: any) {
    return {
      name,
      passed: false,
      message: error.message || 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Backend Integration\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`API Key: ${API_KEY ? '✅ Configured' : '⚠️  Not configured'}\n`);
  console.log('━'.repeat(80));

  // Test 1: Health Check
  results.push(
    await testEndpoint(
      'Health Check',
      `${BACKEND_URL}/api/v1/health`
    )
  );

  // Test 2: System Status
  results.push(
    await testEndpoint(
      'System Status',
      `${BACKEND_URL}/api/v1/status`
    )
  );

  // Test 3: Contract Stats
  results.push(
    await testEndpoint(
      'Contract Stats',
      `${BACKEND_URL}/api/v1/stats`
    )
  );

  // Test 4: Get Eligible Users
  results.push(
    await testEndpoint(
      'Get Eligible Users',
      `${BACKEND_URL}/api/v1/eligible-users`
    )
  );

  // Test 5: Global Pool Stats
  results.push(
    await testEndpoint(
      'Global Pool Stats',
      `${BACKEND_URL}/api/v1/global-pool/stats`
    )
  );

  // Test 6: Check Eligibility (with dummy address)
  results.push(
    await testEndpoint(
      'Check Eligibility',
      `${BACKEND_URL}/api/v1/eligible-users/check/0x0000000000000000000000000000000000000000`
    )
  );

  // Print results
  console.log('\n📊 Test Results\n');
  console.log('━'.repeat(80));

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASS' : 'FAIL';
    
    console.log(`${icon} ${result.name.padEnd(30)} ${status.padEnd(6)} ${result.duration}ms`);
    
    if (!result.passed) {
      console.log(`   └─ ${result.message}`);
      failed++;
    } else {
      passed++;
    }
  });

  console.log('━'.repeat(80));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed out of ${results.length} tests\n`);

  // Overall status
  if (failed === 0) {
    console.log('🎉 All tests passed! Backend integration is working correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the backend configuration.\n');
    console.log('Troubleshooting steps:');
    console.log('1. Ensure backend is running: cd backend && npm run dev');
    console.log('2. Check backend .env configuration');
    console.log('3. Verify CORS settings allow your frontend domain');
    console.log('4. Check API key matches between frontend and backend\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
