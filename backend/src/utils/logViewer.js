import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logsDir = join(__dirname, '../../logs');
const requestsLogPath = join(logsDir, 'requests.log');

/**
 * Parse a log line into a structured object
 */
function parseLogLine(line) {
  try {
    return JSON.parse(line);
  } catch (error) {
    return null;
  }
}

/**
 * Get recent requests from the log file
 */
export async function getRecentRequests(limit = 50) {
  if (!fs.existsSync(requestsLogPath)) {
    return [];
  }

  const requests = [];
  const fileStream = fs.createReadStream(requestsLogPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const log = parseLogLine(line);
    if (log && log.type === 'REQUEST') {
      requests.push(log);
    }
  }

  return requests.slice(-limit);
}

/**
 * Get request/response pairs by request ID
 */
export async function getRequestById(requestId) {
  if (!fs.existsSync(requestsLogPath)) {
    return null;
  }

  let request = null;
  let response = null;

  const fileStream = fs.createReadStream(requestsLogPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const log = parseLogLine(line);
    if (log && log.requestId === requestId) {
      if (log.type === 'REQUEST') {
        request = log;
      } else if (log.type === 'RESPONSE') {
        response = log;
      }
    }
  }

  return { request, response };
}

/**
 * Get failed requests (status code >= 400)
 */
export async function getFailedRequests(limit = 50) {
  if (!fs.existsSync(requestsLogPath)) {
    return [];
  }

  const failedRequests = [];
  const fileStream = fs.createReadStream(requestsLogPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const log = parseLogLine(line);
    if (log && log.type === 'RESPONSE' && log.statusCode >= 400) {
      failedRequests.push(log);
    }
  }

  return failedRequests.slice(-limit);
}

/**
 * Get requests by endpoint
 */
export async function getRequestsByEndpoint(endpoint, limit = 50) {
  if (!fs.existsSync(requestsLogPath)) {
    return [];
  }

  const requests = [];
  const fileStream = fs.createReadStream(requestsLogPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const log = parseLogLine(line);
    if (log && log.type === 'REQUEST' && log.path.includes(endpoint)) {
      requests.push(log);
    }
  }

  return requests.slice(-limit);
}

/**
 * Get request statistics
 */
export async function getRequestStats() {
  if (!fs.existsSync(requestsLogPath)) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      averageDuration: 0,
      endpoints: {}
    };
  }

  const stats = {
    total: 0,
    successful: 0,
    failed: 0,
    totalDuration: 0,
    endpoints: {}
  };

  const fileStream = fs.createReadStream(requestsLogPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const log = parseLogLine(line);
    if (log && log.type === 'RESPONSE') {
      stats.total++;
      
      if (log.statusCode < 400) {
        stats.successful++;
      } else {
        stats.failed++;
      }
      
      if (log.durationMs) {
        stats.totalDuration += log.durationMs;
      }
      
      const endpoint = log.path || log.url;
      if (!stats.endpoints[endpoint]) {
        stats.endpoints[endpoint] = { count: 0, failed: 0 };
      }
      stats.endpoints[endpoint].count++;
      if (log.statusCode >= 400) {
        stats.endpoints[endpoint].failed++;
      }
    }
  }

  stats.averageDuration = stats.total > 0 ? Math.round(stats.totalDuration / stats.total) : 0;

  return stats;
}

/**
 * Clear old logs (keep last N days)
 */
export function clearOldLogs(daysToKeep = 7) {
  const files = ['requests.log', 'combined.log', 'error.log'];
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

  for (const file of files) {
    const filePath = join(logsDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < cutoffTime) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old log file: ${file}`);
      }
    }
  }
}

// CLI tool for viewing logs
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'recent':
      const limit = parseInt(process.argv[3]) || 20;
      getRecentRequests(limit).then(requests => {
        console.log(`\n📋 Recent ${limit} Requests:\n`);
        requests.forEach(req => {
          console.log(`[${req.timestamp}] ${req.method} ${req.path}`);
          if (req.body) {
            console.log(`   Body: ${JSON.stringify(req.body)}`);
          }
        });
      });
      break;
      
    case 'failed':
      getFailedRequests(20).then(requests => {
        console.log('\n❌ Recent Failed Requests:\n');
        requests.forEach(req => {
          console.log(`[${req.timestamp}] ${req.method} ${req.path} - ${req.statusCode}`);
          if (req.body) {
            console.log(`   Response: ${JSON.stringify(req.body)}`);
          }
        });
      });
      break;
      
    case 'stats':
      getRequestStats().then(stats => {
        console.log('\n📊 Request Statistics:\n');
        console.log(`Total Requests: ${stats.total}`);
        console.log(`Successful: ${stats.successful} (${Math.round(stats.successful/stats.total*100)}%)`);
        console.log(`Failed: ${stats.failed} (${Math.round(stats.failed/stats.total*100)}%)`);
        console.log(`Average Duration: ${stats.averageDuration}ms`);
        console.log('\nEndpoints:');
        Object.entries(stats.endpoints).forEach(([endpoint, data]) => {
          console.log(`  ${endpoint}: ${data.count} requests (${data.failed} failed)`);
        });
      });
      break;
      
    case 'clear':
      const days = parseInt(process.argv[3]) || 7;
      clearOldLogs(days);
      break;
      
    default:
      console.log('\n📖 Log Viewer Usage:\n');
      console.log('  node src/utils/logViewer.js recent [limit]  - Show recent requests');
      console.log('  node src/utils/logViewer.js failed          - Show failed requests');
      console.log('  node src/utils/logViewer.js stats           - Show request statistics');
      console.log('  node src/utils/logViewer.js clear [days]    - Clear logs older than N days\n');
  }
}
