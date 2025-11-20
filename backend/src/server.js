import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { config } from './config/env.js';
import { logger, requestLogger } from './utils/logger.js';
import { errorHandler } from './utils/errorHandler.js';
import { rateLimit } from './middleware/auth.js';
import { testConnection } from './config/blockchain.js';
import routes from './routes/index.js';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimit);

// API routes
app.use(config.apiPrefix, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'USDT Rain Backend API',
    version: '1.0.0',
    description: 'Backend API for managing eligible users and global pool distribution',
    endpoints: {
      health: `${config.apiPrefix}/health`,
      status: `${config.apiPrefix}/status`,
      stats: `${config.apiPrefix}/stats`,
      eligibleUsers: `${config.apiPrefix}/eligible-users`,
      globalPool: `${config.apiPrefix}/global-pool/stats`
    },
    documentation: 'See README.md for full API documentation'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test blockchain connection before starting server
    console.log('\n🔗 Testing blockchain connection...\n');
    const connectionResult = await testConnection();
    
    if (!connectionResult.success) {
      console.error('\n❌ Failed to connect to blockchain. Please check your configuration.');
      process.exit(1);
    }
    
    console.log('\n✅ Blockchain connection successful!\n');
    
    // Start Express server - Listen on all interfaces (0.0.0.0) to allow external access
    app.listen(config.port, '0.0.0.0', () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 USDT Rain Backend Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server running on: http://localhost:${config.port}`);
      console.log(`🌐 API endpoint: http://localhost:${config.port}${config.apiPrefix}`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
      console.log(`⛓️  Network: ${config.networkName} (Chain ID: ${config.chainId})`);
      console.log(`📝 Contract: ${config.contractAddress}`);
      console.log(`👤 Manager: ${connectionResult.managerAddress}`);
      console.log(`🔑 Manager Status: ${connectionResult.isManager ? '✅ Authorized' : '⚠️  Not Authorized'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      if (!connectionResult.isManager) {
        console.warn('⚠️  WARNING: Your wallet is not set as the contract manager!');
        console.warn('   You may not have permission to add/remove eligible users.\n');
      }
      
      logger.info('Server started successfully');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    logger.error('Server startup failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();
