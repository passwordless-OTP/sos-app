# SOS API Contracts

## 🔌 Service API Specifications

### Base URLs
- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://api-staging.sos-shield.com/v1`
- **Production**: `https://api.sos-shield.com/v1`

## 1. Fraud Detection API

### Check Order
```http
POST /fraud/check
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "merchantId": "merchant_123",
  "orderId": "order_456",
  "customer": {
    "email": "john@example.com",
    "ip": "192.168.1.1",
    "phone": "+1234567890"
  },
  "orderValue": 299.99,
  "currency": "USD",
  "shippingAddress": {
    "country": "US",
    "city": "New York",
    "zip": "10001"
  },
  "billingAddress": {
    "country": "US",
    "city": "New York", 
    "zip": "10001"
  },
  "items": [
    {
      "sku": "ABC123",
      "quantity": 2,
      "price": 149.99
    }
  ]
}

Response 200 OK:
{
  "fraudCheckId": "check_789",
  "timestamp": "2025-06-17T10:30:00Z",
  "riskScore": 72,
  "riskLevel": "high",
  "recommendation": "review",
  "factors": [
    {
      "type": "ip_risk",
      "score": 85,
      "source": "AbuseIPDB",
      "details": {
        "isProxy": true,
        "proxyType": "VPN",
        "abuseConfidence": 75
      }
    },
    {
      "type": "email_risk", 
      "score": 45,
      "source": "EmailRep",
      "details": {
        "reputation": "medium",
        "suspicious": true,
        "domainAge": 2
      }
    },
    {
      "type": "network_intelligence",
      "score": 90,
      "source": "SOS Network",
      "details": {
        "flaggedByMerchants": 3,
        "lastFlaggedDate": "2025-06-16T08:00:00Z",
        "flagReasons": ["chargeback", "suspicious_behavior"]
      }
    }
  ],
  "processingTime": 234,
  "cached": false
}

Response 429 Too Many Requests:
{
  "error": "rate_limit_exceeded",
  "message": "API rate limit exceeded",
  "retryAfter": 3600
}
```

### Batch Check
```http
POST /fraud/batch-check
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "merchantId": "merchant_123",
  "orders": [
    { /* order 1 */ },
    { /* order 2 */ }
  ]
}

Response 200 OK:
{
  "results": [
    { /* result 1 */ },
    { /* result 2 */ }
  ],
  "summary": {
    "totalChecked": 2,
    "highRisk": 1,
    "mediumRisk": 0,
    "lowRisk": 1
  }
}
```

## 2. Network Intelligence API

### Report Fraud
```http
POST /network/report
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "merchantId": "merchant_123",
  "signalType": "BLOCK",
  "identifier": "user@fraudulent.com",
  "identifierType": "email",
  "reason": "chargeback",
  "metadata": {
    "orderId": "order_456",
    "amount": 299.99,
    "chargebackDate": "2025-06-15"
  }
}

Response 201 Created:
{
  "signalId": "signal_abc123",
  "status": "accepted",
  "networkEffect": {
    "merchantsAlerted": 1453,
    "previousReports": 2
  }
}
```

### Query Network
```http
GET /network/query?identifier=user@example.com&type=email
Authorization: Bearer {JWT_TOKEN}

Response 200 OK:
{
  "identifier": "user@example.com",
  "type": "email",
  "networkScore": 65,
  "signals": [
    {
      "signalId": "signal_123",
      "type": "FLAG",
      "reportedBy": "merchant_abc",
      "timestamp": "2025-06-10T14:00:00Z",
      "reason": "suspicious_activity"
    }
  ],
  "summary": {
    "totalReports": 1,
    "uniqueMerchants": 1,
    "firstSeen": "2025-06-10T14:00:00Z",
    "lastSeen": "2025-06-10T14:00:00Z"
  }
}
```

### Subscribe to Network Events (WebSocket)
```javascript
// Client connection
const ws = new WebSocket('wss://api.sos-shield.com/v1/network/stream');

// Authentication
ws.send(JSON.stringify({
  action: 'auth',
  token: 'Bearer {JWT_TOKEN}'
}));

// Subscribe to channels
ws.send(JSON.stringify({
  action: 'subscribe',
  channels: ['fraud-alerts', 'network-updates', 'merchant_123']
}));

// Receive events
ws.on('message', (data) => {
  const event = JSON.parse(data);
  // {
  //   "channel": "fraud-alerts",
  //   "type": "BLOCK",
  //   "identifier": "192.168.1.1",
  //   "timestamp": "2025-06-17T10:35:00Z",
  //   "affectedMerchants": 234
  // }
});
```

## 3. Analytics API

### Get Dashboard Stats
```http
GET /analytics/dashboard?period=7d
Authorization: Bearer {JWT_TOKEN}

Response 200 OK:
{
  "period": {
    "start": "2025-06-10T00:00:00Z",
    "end": "2025-06-17T00:00:00Z"
  },
  "summary": {
    "totalChecks": 1234,
    "fraudsPrevented": 45,
    "amountSaved": 12450.00,
    "averageRiskScore": 32.5
  },
  "trends": {
    "checksPerDay": [150, 175, 190, 165, 180, 195, 179],
    "riskScores": [30, 35, 28, 40, 32, 29, 33]
  },
  "topThreats": [
    {
      "type": "proxy_ip",
      "count": 23,
      "percentage": 51.1
    },
    {
      "type": "suspicious_email",
      "count": 15,
      "percentage": 33.3
    }
  ],
  "networkStats": {
    "activeStores": 17453,
    "signalsShared": 48247,
    "networkValue": 1300000
  }
}
```

## 4. Configuration API

### Get Merchant Settings
```http
GET /config/merchant
Authorization: Bearer {JWT_TOKEN}

Response 200 OK:
{
  "merchantId": "merchant_123",
  "settings": {
    "riskThreshold": 70,
    "autoBlockScore": 90,
    "enableNetworkIntelligence": true,
    "webhookUrl": "https://mystore.com/webhook",
    "notifications": {
      "email": "security@mystore.com",
      "highRiskAlerts": true,
      "dailySummary": true
    }
  },
  "usage": {
    "plan": "professional",
    "checksUsed": 3421,
    "checksLimit": 5000,
    "billingPeriodEnd": "2025-07-01"
  }
}
```

### Update Settings
```http
PATCH /config/merchant
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "settings": {
    "riskThreshold": 65,
    "notifications": {
      "highRiskAlerts": false
    }
  }
}

Response 200 OK:
{
  "status": "updated",
  "settings": { /* updated settings */ }
}
```

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "Invalid request parameters",
  "details": [
    {
      "field": "customer.email",
      "error": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions for this operation"
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred",
  "requestId": "req_abc123"
}
```

## Rate Limiting

| Plan | Requests/Hour | Burst |
|------|--------------|--------|
| Free | 100 | 10/min |
| Starter | 1,000 | 50/min |
| Professional | 5,000 | 200/min |
| Enterprise | Unlimited | Custom |

Headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623456789
```

---
Created: 2025-06-17
Version: 1.0.0