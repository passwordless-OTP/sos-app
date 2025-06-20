# SOS Fraud Detection Integration Setup Guide

## Overview
This guide walks through setting up the multi-source fraud detection system for SOS.

## Architecture
```
Gadget App (sosv02)
    ↓
checkOrder Action
    ↓
Lookup Aggregator Service (port 3001)
    ↓
Multiple Fraud Detection APIs
```

## Step 1: Start the Lookup Aggregator Service

```bash
# Navigate to the service directory
cd services/lookup-aggregator

# Install dependencies
npm install

# Create .env file with API keys
cp .env.example .env

# Edit .env and add your API keys:
# ABUSEIPDB_API_KEY=your_key_here
# EMAILREP_API_KEY=your_key_here
# NUMVERIFY_API_KEY=your_key_here

# Start the service
npm start
```

## Step 2: Configure Environment Variables

### Required API Keys (Free Tiers Available):

1. **AbuseIPDB** (IP Reputation)
   - Sign up: https://www.abuseipdb.com/register
   - Free tier: 1,000 checks/day
   - Add to .env: `ABUSEIPDB_API_KEY=your_key`

2. **EmailRep** (Email Reputation)
   - Sign up: https://emailrep.io/signup
   - Free tier: 100 queries/day
   - Add to .env: `EMAILREP_API_KEY=your_key`

3. **Numverify** (Phone Validation)
   - Sign up: https://numverify.com/dashboard
   - Free tier: 250 requests/month
   - Add to .env: `NUMVERIFY_API_KEY=your_key`

## Step 3: Test the Integration

### Test the Lookup Service Directly:
```bash
# Test IP lookup
curl -X POST http://localhost:3001/api/lookup \
  -H "Content-Type: application/json" \
  -d '{"identifier": "8.8.8.8", "type": "ip"}'

# Test email lookup
curl -X POST http://localhost:3001/api/lookup \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com", "type": "email"}'
```

### Test from Gadget:
```javascript
// In Gadget API Playground
await api.checkOrder({
  orderId: "TEST-001",
  shopId: "shop-123",
  email: "suspicious@example.com",
  ipAddress: "192.168.1.1"
});
```

## Step 4: Connect to Shopify Orders

Create a webhook handler for new orders:

```javascript
// In api/models/shopifyOrder/actions/create.js
export const run = async ({ record, api, logger }) => {
  // Extract customer data
  const { email, customer_ip, phone, id: orderId } = record;
  
  // Run fraud check
  const fraudCheck = await api.checkOrder({
    orderId: orderId.toString(),
    shopId: record.shopId,
    email,
    ipAddress: customer_ip,
    phoneNumber: phone
  });
  
  // Take action based on recommendation
  if (fraudCheck.recommendation === "block") {
    // Cancel the order or flag for review
    logger.warn({ orderId, riskScore: fraudCheck.riskScore }, "High-risk order detected");
  }
};
```

## Step 5: Monitor Performance

The service includes:
- Redis caching (24-hour TTL)
- Request logging
- Error handling
- Circuit breaker pattern (ready for implementation)

### Check Redis Cache:
```bash
redis-cli
> KEYS lookup:*
> GET lookup:ip:098f6bcd4621d373cade4e832627b4f6
```

## API Response Format

```json
{
  "identifier": "192.168.1.1",
  "type": "ip",
  "riskScore": 75,
  "factors": [
    "Proxy detected",
    "High abuse score (85%)"
  ],
  "details": {
    "ip-api": {
      "country": "US",
      "proxy": true
    },
    "abuseipdb": {
      "abuseConfidenceScore": 85,
      "totalReports": 125
    }
  },
  "cached": false,
  "timestamp": "2025-01-17T10:30:00Z"
}
```

## Risk Score Thresholds

- **0-25**: Low risk (allow)
- **26-50**: Medium risk (review)
- **51-75**: High risk (challenge)
- **76-100**: Very high risk (block)

## Production Deployment

1. Use PM2 for process management:
```bash
pm2 start services/lookup-aggregator/src/index-updated.js --name sos-fraud-service
```

2. Set production environment variables
3. Configure reverse proxy (nginx)
4. Set up monitoring (Datadog, New Relic)

## Troubleshooting

### Service not responding:
- Check if service is running: `lsof -i :3001`
- Check logs: `pm2 logs sos-fraud-service`
- Verify Redis connection: `redis-cli ping`

### API keys not working:
- Verify keys in .env file
- Check API quotas/limits
- Test APIs directly with curl

### High latency:
- Check Redis cache hit rate
- Monitor API response times
- Consider adding more caching