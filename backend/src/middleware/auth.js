import { config } from '../config/env.js';
import { AuthorizationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

// API Key authentication middleware (optional)
export const requireApiKey = (req, res, next) => {
  // Skip if no API key is configured
  if (!config.apiKey) {
    return next();
  }
  
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey || apiKey !== config.apiKey) {
      throw new AuthorizationError('Invalid or missing API key');
    }
    
    logger.info('🔑 API key authenticated');
    next();
  } catch (error) {
    next(error);
  }
};

// Rate limiting (basic implementation)
const requestCounts = new Map();
const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

export const rateLimit = (req, res, next) => {
  const clientId = req.ip;
  const now = Date.now();
  
  // Clean old entries
  for (const [id, data] of requestCounts.entries()) {
    if (now - data.windowStart > WINDOW_SIZE) {
      requestCounts.delete(id);
    }
  }
  
  // Get or create client data
  let clientData = requestCounts.get(clientId);
  if (!clientData || now - clientData.windowStart > WINDOW_SIZE) {
    clientData = { count: 0, windowStart: now };
    requestCounts.set(clientId, clientData);
  }
  
  clientData.count++;
  
  if (clientData.count > MAX_REQUESTS) {
    logger.warn(`🚫 Rate limit exceeded for IP: ${clientId}`);
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      type: 'rate_limit_error'
    });
  }
  
  next();
};
