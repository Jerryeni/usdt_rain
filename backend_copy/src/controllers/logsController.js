import { asyncHandler } from '../utils/errorHandler.js';
import { 
  getRecentRequests, 
  getFailedRequests, 
  getRequestById,
  getRequestsByEndpoint,
  getRequestStats 
} from '../utils/logViewer.js';
import { logger } from '../utils/logger.js';

/**
 * Get recent request logs
 */
export const getRecentLogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  logger.info(`📋 Fetching recent ${limit} request logs`);
  
  const requests = await getRecentRequests(limit);
  
  res.json({
    success: true,
    data: {
      requests,
      count: requests.length
    }
  });
});

/**
 * Get failed request logs
 */
export const getFailedLogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  logger.info(`❌ Fetching recent ${limit} failed request logs`);
  
  const requests = await getFailedRequests(limit);
  
  res.json({
    success: true,
    data: {
      requests,
      count: requests.length
    }
  });
});

/**
 * Get request by ID
 */
export const getLogById = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  
  logger.info(`🔍 Fetching log for request ID: ${requestId}`);
  
  const log = await getRequestById(requestId);
  
  if (!log.request && !log.response) {
    return res.status(404).json({
      success: false,
      error: 'Request log not found'
    });
  }
  
  res.json({
    success: true,
    data: log
  });
});

/**
 * Get logs by endpoint
 */
export const getLogsByEndpoint = asyncHandler(async (req, res) => {
  const { endpoint } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  
  logger.info(`🔍 Fetching logs for endpoint: ${endpoint}`);
  
  const requests = await getRequestsByEndpoint(endpoint, limit);
  
  res.json({
    success: true,
    data: {
      endpoint,
      requests,
      count: requests.length
    }
  });
});

/**
 * Get request statistics
 */
export const getLogStats = asyncHandler(async (req, res) => {
  logger.info('📊 Fetching request statistics');
  
  const stats = await getRequestStats();
  
  res.json({
    success: true,
    data: stats
  });
});
