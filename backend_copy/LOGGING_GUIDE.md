# Backend Logging System Guide

## Overview

The USDT Rain backend includes a comprehensive request/response logging system that tracks all API interactions, errors, and system events.

## Log Files

All logs are stored in the `backend/logs/` directory:

- **`requests.log`** - Detailed request/response logs with full payloads
- **`combined.log`** - All application logs (info, warnings, errors)
- **`error.log`** - Error-level logs only

## Log Rotation

- Maximum file size: 10MB (requests.log), 5MB (others)
- Maximum files kept: 10 (requests.log), 5 (others)
- Old logs are automatically rotated when size limits are reached

## Request Log Format

Each request generates two log entries:

### Request Entry
```json
{
  "requestId": "1699876543210-abc123",
  "timestamp": "2024-11-13T14:30:00.000Z",
  "type": "REQUEST",
  "method": "POST",
  "url": "/api/v1/eligible-users/add",
  "path": "/api/v1/eligible-users/add",
  "query": {},
  "headers": {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0...",
    "origin": "https://usdtrains.com"
  },
  "body": {
    "address": "0x1234..."
  },
  "ip": "192.168.1.1"
}
```

### Response Entry
```json
{
  "requestId": "1699876543210-abc123",
  "timestamp": "2024-11-13T14:30:01.234Z",
  "type": "RESPONSE",
  "method": "POST",
  "url": "/api/v1/eligible-users/add",
  "path": "/api/v1/eligible-users/add",
  "statusCode": 200,
  "statusMessage": "OK",
  "duration": "1234ms",
  "durationMs": 1234,
  "body": {
    "success": true,
    "message": "User successfully added",
    "data": {...}
  }
}
```

## Viewing Logs

### Option 1: Interactive Log Viewer (Recommended)

```bash
cd backend
./view-logs.sh
```

This provides an interactive menu with options to:
1. View recent requests
2. View failed requests
3. View request statistics
4. Live tail all requests
5. View error log
6. View combined log
7. Clear old logs

### Option 2: Command Line Tools

```bash
# View recent requests
node src/utils/logViewer.js recent 20

# View failed requests
node src/utils/logViewer.js failed

# View statistics
node src/utils/logViewer.js stats

# Clear old logs (7+ days)
node src/utils/logViewer.js clear 7
```

### Option 3: Direct File Access

```bash
# Tail requests log
tail -f logs/requests.log

# View last 50 errors
tail -n 50 logs/error.log

# Search for specific address
grep "0x1234..." logs/requests.log

# Count failed requests
grep '"statusCode":4' logs/requests.log | wc -l
```

### Option 4: API Endpoints

The backend exposes log viewing endpoints:

```bash
# Get recent logs
curl http://localhost:3001/api/v1/logs/recent?limit=50

# Get failed logs
curl http://localhost:3001/api/v1/logs/failed?limit=50

# Get statistics
curl http://localhost:3001/api/v1/logs/stats

# Get specific request by ID
curl http://localhost:3001/api/v1/logs/{requestId}
```

## Frontend Integration

The admin panel includes a `RequestLogsViewer` component that displays:
- Recent requests with details
- Failed requests with error messages
- Request statistics and endpoint analytics

To add it to the admin page:

```tsx
import RequestLogsViewer from '@/components/RequestLogsViewer';

// In your admin page
<RequestLogsViewer />
```

## Security Features

### Sensitive Data Redaction

The logging system automatically redacts sensitive information:
- Private keys → `***REDACTED***`
- Passwords → `***REDACTED***`
- API keys → `***` (in headers)
- Tokens → `***REDACTED***`

### Log Access Control

- Log viewing endpoints require API key authentication
- Logs are stored server-side only
- No sensitive data is exposed in client-side logs

## Troubleshooting

### Common Issues

**Issue: Logs not being created**
- Check that the `logs/` directory exists
- Verify write permissions: `chmod 755 backend/logs`
- Check server startup logs for errors

**Issue: Log files too large**
- Run: `./view-logs.sh` → Option 7 to clear old logs
- Or manually: `node src/utils/logViewer.js clear 7`

**Issue: Can't view logs via API**
- Ensure backend is running
- Check API key configuration in `.env`
- Verify CORS settings allow your frontend origin

### Debug Mode

To enable verbose logging, set in `backend/.env`:

```bash
LOG_LEVEL=debug
```

This will log additional details including:
- Database queries
- Contract calls
- Middleware execution
- Response body details

## Log Analysis Examples

### Find all requests from a specific address
```bash
grep "0xYourAddress" logs/requests.log | jq .
```

### Count requests per endpoint
```bash
grep '"type":"REQUEST"' logs/requests.log | jq -r .path | sort | uniq -c
```

### Find slowest requests
```bash
grep '"type":"RESPONSE"' logs/requests.log | jq -r '"\(.durationMs) \(.path)"' | sort -rn | head -10
```

### Get error rate by hour
```bash
grep '"statusCode":' logs/requests.log | jq -r '"\(.timestamp | split("T")[1] | split(":")[0]) \(.statusCode)"' | grep -E "4[0-9]{2}|5[0-9]{2}" | cut -d' ' -f1 | sort | uniq -c
```

## Best Practices

1. **Regular Monitoring**: Check failed requests daily
2. **Log Rotation**: Clear logs older than 7 days weekly
3. **Performance**: Monitor average response times
4. **Alerts**: Set up alerts for high error rates
5. **Backup**: Include logs in backup strategy for compliance

## Production Considerations

### Log Storage

For production deployments:
- Consider external log aggregation (e.g., CloudWatch, Datadog)
- Set up log shipping to prevent disk space issues
- Implement log retention policies

### Performance

- Logs are written asynchronously to minimize impact
- Request logging adds ~1-2ms overhead per request
- File rotation prevents unbounded growth

### Compliance

- Logs contain user addresses (public blockchain data)
- No personal information is logged
- Logs help with audit trails and debugging
- Consider GDPR implications if storing IP addresses

## Support

For issues or questions about the logging system:
1. Check this guide first
2. Review the code in `backend/src/utils/logger.js`
3. Check server startup logs for configuration issues
4. Verify file permissions and disk space
