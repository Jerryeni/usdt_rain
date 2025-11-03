/**
 * Test script to verify USDTRain ABI structure and iterability
 * Run with: npx ts-node scripts/test-abi-structure.ts
 */

import USDTRainABI from '../lib/contracts/abi/USDTRain.json';

console.log('🔍 Testing USDTRain ABI Structure\n');

// Test 1: Check if ABI is an object
console.log('✓ Test 1: ABI is an object');
console.log(`  Type: ${typeof USDTRainABI}`);
console.log(`  Is Array: ${Array.isArray(USDTRainABI)}`);

// Test 2: Check structure
console.log('\n✓ Test 2: ABI Structure');
const keys = Object.keys(USDTRainABI);
console.log(`  Keys: ${keys.join(', ')}`);

// Test 3: Check if functions array exists and is iterable
if ('functions' in USDTRainABI && Array.isArray(USDTRainABI.functions)) {
  console.log('\n✓ Test 3: Functions Array');
  console.log(`  Total functions: ${USDTRainABI.functions.length}`);
  console.log(`  Is iterable: ${typeof USDTRainABI.functions[Symbol.iterator] === 'function'}`);
} else {
  // ABI might be in flat array format
  console.log('\n✓ Test 3: ABI Format');
  if (Array.isArray(USDTRainABI)) {
    console.log(`  Format: Flat array`);
    console.log(`  Total items: ${USDTRainABI.length}`);
    console.log(`  Is iterable: ${typeof USDTRainABI[Symbol.iterator] === 'function'}`);
  }
}

// Test 4: Find specific functions
console.log('\n✓ Test 4: Profile Functions');

const findFunction = (name: string) => {
  if (Array.isArray(USDTRainABI)) {
    return USDTRainABI.find((item: any) => item.type === 'function' && item.name === name);
  } else if ('functions' in USDTRainABI && Array.isArray(USDTRainABI.functions)) {
    return USDTRainABI.functions.find((item: any) => item.name === name);
  }
  return null;
};

const profileFunctions = ['setProfile', 'updateProfile', 'getUserInfo', 'getUserProfile'];

profileFunctions.forEach(funcName => {
  const func = findFunction(funcName);
  if (func) {
    console.log(`  ✓ ${funcName} found`);
    console.log(`    Inputs: ${func.inputs?.length || 0}`);
    console.log(`    Outputs: ${func.outputs?.length || 0}`);
    console.log(`    State: ${func.stateMutability}`);
  } else {
    console.log(`  ✗ ${funcName} NOT FOUND`);
  }
});

// Test 5: Check events
console.log('\n✓ Test 5: Events');

const findEvent = (name: string) => {
  if (Array.isArray(USDTRainABI)) {
    return USDTRainABI.find((item: any) => item.type === 'event' && item.name === name);
  } else if ('events' in USDTRainABI && Array.isArray(USDTRainABI.events)) {
    return USDTRainABI.events.find((item: any) => item.name === name);
  }
  return null;
};

const events = ['ProfileUpdated', 'UserRegistered', 'UserActivated'];

events.forEach(eventName => {
  const event = findEvent(eventName);
  if (event) {
    console.log(`  ✓ ${eventName} found`);
    console.log(`    Inputs: ${event.inputs?.length || 0}`);
  } else {
    console.log(`  ✗ ${eventName} NOT FOUND`);
  }
});

// Test 6: Iteration test
console.log('\n✓ Test 6: Iteration Test');

let functionCount = 0;
let eventCount = 0;

if (Array.isArray(USDTRainABI)) {
  for (const item of USDTRainABI) {
    if (item.type === 'function') functionCount++;
    if (item.type === 'event') eventCount++;
  }
} else {
  if ('functions' in USDTRainABI && Array.isArray(USDTRainABI.functions)) {
    functionCount = USDTRainABI.functions.length;
  }
  if ('events' in USDTRainABI && Array.isArray(USDTRainABI.events)) {
    eventCount = USDTRainABI.events.length;
  }
}

console.log(`  Functions iterated: ${functionCount}`);
console.log(`  Events iterated: ${eventCount}`);

// Test 7: ethers.js compatibility
console.log('\n✓ Test 7: ethers.js Compatibility');
try {
  const { ethers } = require('ethers');
  const iface = new ethers.Interface(USDTRainABI as any);
  console.log(`  Interface created: ✓`);
  console.log(`  Functions in interface: ${iface.fragments.filter(f => f.type === 'function').length}`);
  console.log(`  Events in interface: ${iface.fragments.filter(f => f.type === 'event').length}`);
} catch (error) {
  console.log(`  Error: ${(error as Error).message}`);
}

console.log('\n✅ All tests completed!\n');
