import currentAbi from '../lib/contracts/abi/USDTRain.json';
import backupAbi from '../lib/contracts/abis_backup.json';

interface AbiItem {
  name?: string;
  type: string;
  inputs?: any[];
  outputs?: any[];
  stateMutability?: string;
}

function extractFunctions(abi: AbiItem[]) {
  return abi
    .filter(item => item.type === 'function' && item.name)
    .map(item => ({
      name: item.name!,
      type: item.stateMutability === 'view' || item.stateMutability === 'pure' ? 'read' : 'write',
      inputs: item.inputs?.length || 0,
      outputs: item.outputs?.length || 0,
      stateMutability: item.stateMutability
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function extractEvents(abi: AbiItem[]) {
  return abi
    .filter(item => item.type === 'event' && item.name)
    .map(item => item.name!)
    .sort();
}

const currentFunctions = extractFunctions(currentAbi as AbiItem[]);
const backupFunctions = extractFunctions(backupAbi as AbiItem[]);

const currentEvents = extractEvents(currentAbi as AbiItem[]);
const backupEvents = extractEvents(backupAbi as AbiItem[]);

const currentFunctionNames = new Set(currentFunctions.map(f => f.name));
const backupFunctionNames = new Set(backupFunctions.map(f => f.name));

const currentEventNames = new Set(currentEvents);
const backupEventNames = new Set(backupEvents);

const removedFunctions = backupFunctions.filter(f => !currentFunctionNames.has(f.name));
const addedFunctions = currentFunctions.filter(f => !backupFunctionNames.has(f.name));
const keptFunctions = currentFunctions.filter(f => backupFunctionNames.has(f.name));

const removedEvents = backupEvents.filter(e => !currentEventNames.has(e));
const addedEvents = currentEvents.filter(e => !backupEventNames.has(e));

console.log('='.repeat(80));
console.log('CONTRACT ABI COMPARISON REPORT');
console.log('='.repeat(80));
console.log();

console.log('📊 SUMMARY');
console.log('-'.repeat(80));
console.log(`Total Functions (Before): ${backupFunctions.length}`);
console.log(`Total Functions (After):  ${currentFunctions.length}`);
console.log(`Change:                   ${currentFunctions.length - backupFunctions.length > 0 ? '+' : ''}${currentFunctions.length - backupFunctions.length}`);
console.log();
console.log(`Total Events (Before):    ${backupEvents.length}`);
console.log(`Total Events (After):     ${currentEvents.length}`);
console.log(`Change:                   ${currentEvents.length - backupEvents.length > 0 ? '+' : ''}${currentEvents.length - backupEvents.length}`);
console.log();

if (removedFunctions.length > 0) {
  console.log('❌ REMOVED FUNCTIONS (' + removedFunctions.length + ')');
  console.log('-'.repeat(80));
  removedFunctions.forEach(f => {
    console.log(`  • ${f.name} (${f.type}) - ${f.inputs} inputs, ${f.outputs} outputs`);
  });
  console.log();
}

if (addedFunctions.length > 0) {
  console.log('✅ ADDED FUNCTIONS (' + addedFunctions.length + ')');
  console.log('-'.repeat(80));
  addedFunctions.forEach(f => {
    console.log(`  • ${f.name} (${f.type}) - ${f.inputs} inputs, ${f.outputs} outputs`);
  });
  console.log();
}

if (removedEvents.length > 0) {
  console.log('❌ REMOVED EVENTS (' + removedEvents.length + ')');
  console.log('-'.repeat(80));
  removedEvents.forEach(e => {
    console.log(`  • ${e}`);
  });
  console.log();
}

if (addedEvents.length > 0) {
  console.log('✅ ADDED EVENTS (' + addedEvents.length + ')');
  console.log('-'.repeat(80));
  addedEvents.forEach(e => {
    console.log(`  • ${e}`);
  });
  console.log();
}

console.log('📋 FUNCTION BREAKDOWN');
console.log('-'.repeat(80));
const currentReadFunctions = currentFunctions.filter(f => f.type === 'read').length;
const currentWriteFunctions = currentFunctions.filter(f => f.type === 'write').length;
const backupReadFunctions = backupFunctions.filter(f => f.type === 'read').length;
const backupWriteFunctions = backupFunctions.filter(f => f.type === 'write').length;

console.log(`Read Functions:  ${backupReadFunctions} → ${currentReadFunctions} (${currentReadFunctions - backupReadFunctions > 0 ? '+' : ''}${currentReadFunctions - backupReadFunctions})`);
console.log(`Write Functions: ${backupWriteFunctions} → ${currentWriteFunctions} (${currentWriteFunctions - backupWriteFunctions > 0 ? '+' : ''}${currentWriteFunctions - backupWriteFunctions})`);
console.log();

console.log('='.repeat(80));
console.log('DETAILED FUNCTION LIST');
console.log('='.repeat(80));
console.log();

console.log('ALL CURRENT FUNCTIONS (' + currentFunctions.length + '):');
console.log('-'.repeat(80));
currentFunctions.forEach(f => {
  const status = backupFunctionNames.has(f.name) ? '  ' : '✨';
  console.log(`${status} ${f.name} (${f.type})`);
});
