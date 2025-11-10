import { testConnection } from './config/blockchain.js';

console.log('🧪 Testing blockchain connection...\n');

testConnection()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Connection test successful!');
      console.log('\nYou can now start the server with: npm start');
      process.exit(0);
    } else {
      console.log('\n❌ Connection test failed!');
      console.log('Error:', result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Connection test failed with error:', error.message);
    process.exit(1);
  });
