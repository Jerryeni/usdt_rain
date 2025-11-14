import winston from 'winston';
import { config } from '../config/env.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure logs directory exists
const logsDir = join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ' ' + JSON.stringify(meta, null, 2);
    }
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logLevel,
  format: fileFormat,
  defaultMeta: { service: 'usdtrain-backend' },
  transports: [
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Dedicated request/response log
    new winston.transports.File({
      filename: join(logsDir, 'requests.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
});

// Add console transport for development
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Request logging middleware with detailed request/response tracking
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Attach request ID to request object
  req.requestId = requestId;
  
  // Log incoming request with full details
  const requestLog = {
    requestId,
    timestamp: new Date().toISOString(),
    type: 'REQUEST',
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'x-api-key': req.headers['x-api-key'] ? '***' : undefined,
      'origin': req.headers['origin']
    },
    body: req.body && Object.keys(req.body).length > 0 ? sanitizeBody(req.body) : undefined,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };
  
  logger.info('📥 Incoming request', requestLog);
  
  // Capture response
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody;
  
  // Override res.json to capture response
  res.json = function(data) {
    responseBody = data;
    return originalJson.call(this, data);
  };
  
  // Override res.send to capture response
  res.send = function(data) {
    if (!responseBody) {
      responseBody = data;
    }
    return originalSend.call(this, data);
  };
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    // Log response with full details
    const responseLog = {
      requestId,
      timestamp: new Date().toISOString(),
      type: 'RESPONSE',
      method: req.method,
      url: req.url,
      path: req.path,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      durationMs: duration,
      body: responseBody ? sanitizeBody(responseBody) : undefined,
      headers: {
        'content-type': res.getHeader('content-type')
      }
    };
    
    logger.log(logLevel, '📤 Request completed', responseLog);
    
    // Log summary for console
    const emoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${emoji} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

// Sanitize sensitive data from logs
function sanitizeBody(body) {
  if (typeof body !== 'object' || body === null) {
    return body;
  }
  
  const sanitized = { ...body };
  const sensitiveFields = ['privateKey', 'password', 'secret', 'token', 'apiKey'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  // Truncate long addresses for readability
  if (sanitized.address && typeof sanitized.address === 'string') {
    sanitized.address = sanitized.address;
  }
  
  return sanitized;
}
