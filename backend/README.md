# USDT Rain Backend API

Backend API server for managing eligible users and global pool distribution for the USDT Rain platform on UCChain.

## Features

- ✅ Add/Remove eligible users for global pool distribution
- ✅ Check user eligibility status
- ✅ Distribute global pool to eligible users
- ✅ Get global pool statistics
- ✅ Get contract statistics
- ✅ Comprehensive error handling
- ✅ Request logging
- ✅ Rate limiting
- ✅ API key authentication (optional)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# UCChain Network
RPC_URL=https://rpc.mainnet.ucchain.org
CHAIN_ID=1137
CONTRACT_ADDRESS=0x9b7f2CF537F81f2fCfd3252B993b7B12a47648d1

# Manager Wallet (KEEP SECRET!)
MANAGER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Optional: API Key for authentication
API_KEY=your-secret-api-key
```

### 3. Test Connection

```bash
npm test
```

This will verify:
- ✅ Blockchain connection
- ✅ Manager wallet balance
- ✅ Contract access
- ✅ Manager permissions

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

Base URL: `http://localhost:3001/api/v1`

### System Endpoints

#### GET /health
Health check endpoint (no auth required)

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### GET /status
System status with blockchain connection info

**Response:**
```json
{
  "system": {
    "status": "operational",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "blockchain": {
    "success": true,
    "network": "ucchain-mainnet",
    "chainId": "1137",
    "managerAddress": "0x...",
    "isManager": true
  }
}
```

#### GET /stats
Get contract statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": "100",
      "activated": "80",
      "eligible": "15"
    },
    "globalPool": {
      "balance": {
        "wei": "1000000000000000000",
        "usdt": "1.0"
      },
      "totalDistributed": {
        "wei": "5000000000000000000",
        "usdt": "5.0"
      }
    }
  }
}
```

### Eligible Users Endpoints

#### GET /eligible-users
Get all eligible users

**Response:**
```json
{
  "success": true,
  "data": {
    "eligibleUsers": [
      {
        "address": "0x...",
        "userId": "123",
        "directReferrals": "15",
        "isActive": true,
        "userName": "John Doe"
      }
    ],
    "totalCount": "15"
  }
}
```

#### GET /eligible-users/check/:address
Check if a specific user is eligible

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "userId": "123",
    "isEligible": true,
    "directReferrals": "15",
    "isActive": true
  }
}
```

#### POST /eligible-users/add
Add a user to the eligible list

**Request Body:**
```json
{
  "address": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User successfully added to eligible list",
  "data": {
    "address": "0x...",
    "userId": "123",
    "userName": "John Doe",
    "directReferrals": 15,
    "transaction": {
      "hash": "0x...",
      "blockNumber": 12345,
      "gasUsed": "50000"
    }
  }
}
```

**Requirements:**
- User must be registered
- User must be activated
- User must have at least 10 direct referrals (configurable)

#### POST /eligible-users/remove
Remove a user from the eligible list

**Request Body:**
```json
{
  "address": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User successfully removed from eligible list",
  "data": {
    "address": "0x...",
    "transaction": {
      "hash": "0x...",
      "blockNumber": 12346
    }
  }
}
```

### Global Pool Endpoints

#### GET /global-pool/stats
Get global pool statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAllocated": {
      "wei": "10000000000000000000",
      "usdt": "10.0"
    },
    "totalClaimed": {
      "wei": "5000000000000000000",
      "usdt": "5.0"
    },
    "totalPending": {
      "wei": "5000000000000000000",
      "usdt": "5.0"
    },
    "eligibleCount": "15",
    "eligibleUsers": 15
  }
}
```

#### POST /global-pool/distribute
Distribute global pool to all eligible users

**Response:**
```json
{
  "success": true,
  "message": "Global pool successfully distributed to 15 eligible users",
  "data": {
    "distribution": {
      "eligibleUsers": 15,
      "totalDistributed": {
        "wei": "10000000000000000000",
        "usdt": "10.0"
      },
      "perUser": {
        "wei": "666666666666666666",
        "usdt": "0.666666666666666666"
      }
    },
    "transaction": {
      "hash": "0x...",
      "blockNumber": 12347,
      "gasUsed": "150000"
    }
  }
}
```

## Authentication

If `API_KEY` is set in `.env`, include it in requests:

**Header:**
```
X-API-Key: your-secret-api-key
```

**Query Parameter:**
```
?apiKey=your-secret-api-key
```

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "type": "error_type"
}
```

Error types:
- `validation_error` - Invalid input (400)
- `authorization_error` - Authentication failed (403)
- `not_found_error` - Resource not found (404)
- `blockchain_error` - Blockchain transaction failed (500)
- `server_error` - Internal server error (500)

## Logging

Logs are stored in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

## Security

- ⚠️ **NEVER** commit your `.env` file
- ⚠️ **NEVER** share your `MANAGER_PRIVATE_KEY`
- ✅ Use API key authentication in production
- ✅ Configure CORS for your frontend domain
- ✅ Use HTTPS in production
- ✅ Keep your manager wallet secure

## Troubleshooting

### "Manager wallet does not have required permissions"

Your wallet is not set as the contract manager. Contact the contract owner to set your wallet as manager using `setManager(address)`.

### "Insufficient funds for transaction"

Your manager wallet needs UCH tokens for gas fees. Send some UCH to your manager wallet address.

### "User must have at least 10 direct referrals"

The user doesn't meet the minimum referral requirement. You can adjust this in `.env`:

```env
MIN_REFERRALS_FOR_ELIGIBILITY=10
```

## Development

Watch mode with auto-reload:
```bash
npm run dev
```

Test connection:
```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure a strong `API_KEY`
3. Set proper `CORS_ORIGIN`
4. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name usdtrain-backend
pm2 save
pm2 startup
```

## Support

For issues or questions, contact the USDT Rain development team.
