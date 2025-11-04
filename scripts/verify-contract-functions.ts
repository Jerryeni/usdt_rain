/**
 * Script to verify all contract functions are accessible
 * Run this to ensure the ABI is properly loaded
 */

import USDTRainABI from '../lib/contracts/abi/USDTRain.json';

console.log('🔍 Verifying Contract ABI...\n');

// Check if ABI is an array
if (!Array.isArray(USDTRainABI)) {
  console.error('❌ ERROR: ABI is not an array!');
  console.error('ABI type:', typeof USDTRainABI);
  process.exit(1);
}

console.log(`✅ ABI is an array with ${USDTRainABI.length} items\n`);

// Extract all function names
const functions = USDTRainABI.filter((item: any) => item.type === 'function');
const readFunctions = functions.filter((f: any) => 
  f.stateMutability === 'view' || f.stateMutability === 'pure'
);
const writeFunctions = functions.filter((f: any) => 
  f.stateMutability !== 'view' && f.stateMutability !== 'pure'
);

console.log(`📊 Function Summary:`);
console.log(`   Total Functions: ${functions.length}`);
console.log(`   Read Functions: ${readFunctions.length}`);
console.log(`   Write Functions: ${writeFunctions.length}\n`);

// Check for critical functions used in the app
const criticalFunctions = [
  'getContractStats',
  'getAdminSummary',
  'getUserInfo',
  'getUserLevelCounts10',
  'getUserLevelCounts10ById',
  'isAchieverRewarded',
  'markAchieverReward',
  'getUserAchieverInfo',
  'getAchieverProgress',
  'getAchieverRequirements',
  'getLevelIncomeStats',
  'getLevelIncomeStatsById',
  'getUserTotalNetworkCountById',
  'activateAccount',
  'registerUser',
];

console.log('🔑 Checking Critical Functions:\n');

const functionNames = functions.map((f: any) => f.name);
let allFound = true;

criticalFunctions.forEach(funcName => {
  const found = functionNames.includes(funcName);
  const status = found ? '✅' : '❌';
  console.log(`   ${status} ${funcName}`);
  if (!found) allFound = false;
});

console.log('\n');

if (allFound) {
  console.log('✅ All critical functions found in ABI!');
} else {
  console.log('❌ Some critical functions are missing!');
  console.log('\n📝 Available functions:');
  functionNames.sort().forEach((name: string) => {
    console.log(`   - ${name}`);
  });
  process.exit(1);
}

// Check for events
const events = USDTRainABI.filter((item: any) => item.type === 'event');
console.log(`\n📢 Events: ${events.length} found`);
events.forEach((event: any) => {
  console.log(`   - ${event.name}`);
});

console.log('\n✅ Contract ABI verification complete!');
