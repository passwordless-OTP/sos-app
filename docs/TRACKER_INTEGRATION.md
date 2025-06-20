# Tracker Service Integration

## 🔌 Existing Visitor Tracking Service

**Service Name**: Tracker (visitor-tracking-service)  
**URL**: http://152.42.148.206  
**API Docs**: http://152.42.148.206/api/docs/  
**GitHub**: https://github.com/otpplus/visitor-tracking-service

## 📐 Architecture Integration

### Current SOS Architecture with Tracker

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SHOPIFY MERCHANT STORE                         │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      │ Webhooks/OAuth
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GADGET.DEV CLOUD (sosv02)                        │
│  ┌─────────────────┐        ┌──────────────────┐                        │
│  │   React UI      │        │  API Actions     │                        │
│  │  - Dashboard    │───────▶│  - checkOrder    │                        │
│  │  - AI Assistant │        │  - getVisitors   │                        │
│  │  - Network Viz  │        │  - trackActivity │                        │
│  └─────────────────┘        └────────┬─────────┘                        │
└──────────────────────────────────────┼───────────────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │   TRACKER    │      │LOOKUP SERVICE│      │   NETWORK    │
        │   SERVICE    │      │  (Internal)  │      │ INTELLIGENCE │
        │ 152.42.148.206│     │              │      │              │
        └──────────────┘      └──────────────┘      └──────────────┘
                │                     │                     │
                └─────────────────────┴─────────────────────┘
                                      │
                              ┌──────────────┐
                              │    Redis     │
                              │  PostgreSQL  │
                              └──────────────┘
```

## 🔄 Integration Points

### 1. Visitor Tracking Integration

**From Gadget App to Tracker**:
```javascript
// In Gadget action: api/actions/getStoreVisitors.js
import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, logger, api }) => {
  const { storeId } = params;
  
  try {
    // Call tracker service
    const response = await fetch(`http://152.42.148.206/api/stores/${storeId}/visitors`, {
      headers: {
        'Authorization': `Bearer ${process.env.TRACKER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const visitors = await response.json();
    
    // Enhance with fraud signals
    const enhancedVisitors = await enhanceWithFraudSignals(visitors);
    
    return {
      success: true,
      visitors: enhancedVisitors
    };
  } catch (error) {
    logger.error("Failed to fetch visitors", { error });
    throw error;
  }
};
```

### 2. Fraud Check Enhancement

**Combine Visitor Behavior with Fraud Signals**:
```javascript
// Enhanced fraud check using visitor data
export async function checkOrderWithVisitorContext(order) {
  const { customerId, ip } = order;
  
  // Get visitor history from tracker
  const visitorData = await getVisitorData(ip);
  
  // Analyze behavior patterns
  const behaviorRisk = analyzeBehavior(visitorData);
  
  // Combine with existing fraud checks
  const fraudScore = calculateCombinedRisk({
    apiChecks: await runFraudAPIs(order),
    behaviorAnalysis: behaviorRisk,
    networkIntelligence: await queryNetwork(customerId)
  });
  
  return fraudScore;
}
```

## 📊 Data Flow

### Real-time Visitor Tracking
```
Customer Visit ──▶ Shopify Store ──▶ Tracker Service
                                           │
                                           ▼
                                    Store visitor data
                                           │
                  ┌────────────────────────┼────────────────────┐
                  ▼                        ▼                    ▼
            Behavior Analysis       Risk Scoring         Network Alert
```

### Visitor Risk Indicators

**Suspicious Patterns**:
- Multiple IP addresses in short time
- Rapid page navigation (bot-like)
- Direct checkout without browsing
- Multiple failed payment attempts

**Integration with SOS**:
```javascript
const visitorRiskFactors = {
  sessionDuration: visitor.duration < 30 ? 20 : 0,  // Too quick
  pagesViewed: visitor.pageCount < 2 ? 15 : 0,      // Direct to checkout
  deviceFingerprint: visitor.deviceChanges > 2 ? 30 : 0, // Device hopping
  geoVelocity: visitor.locationChanges > 1 ? 25 : 0  // Location changes
};
```

## 🔌 API Endpoints to Use

### From Tracker Service

**1. Get Store Visitors**
```http
GET /api/stores/{storeId}/visitors
Authorization: Bearer {API_KEY}

Response:
{
  "visitors": [
    {
      "visitorId": "visitor_123",
      "ip": "192.168.1.1",
      "sessions": 3,
      "firstSeen": "2025-06-10T10:00:00Z",
      "lastSeen": "2025-06-17T14:30:00Z",
      "pageViews": 15,
      "avgSessionDuration": 245,
      "deviceFingerprint": "abc123",
      "location": {
        "country": "US",
        "city": "New York"
      }
    }
  ]
}
```

**2. Get Visitor Details**
```http
GET /api/visitors/{visitorId}
Authorization: Bearer {API_KEY}

Response:
{
  "visitorId": "visitor_123",
  "behavior": {
    "bounceRate": 0.2,
    "conversionRate": 0.05,
    "cartAbandonment": 2,
    "averageOrderValue": 150.00
  },
  "riskIndicators": {
    "multipleDevices": false,
    "vpnDetected": true,
    "rapidActivity": false
  }
}
```

## 🔧 Implementation Steps

### Phase 1: Basic Integration (2 days)
1. [ ] Add Tracker API credentials to Gadget env
2. [ ] Create Gadget actions for visitor data
3. [ ] Display visitor info in dashboard
4. [ ] Add visitor count to network metrics

### Phase 2: Fraud Enhancement (3 days)
1. [ ] Combine visitor behavior with fraud checks
2. [ ] Create behavior risk scoring
3. [ ] Add visitor patterns to network intelligence
4. [ ] Alert on suspicious visitor behavior

### Phase 3: Advanced Features (1 week)
1. [ ] Real-time visitor tracking widget
2. [ ] Visitor journey visualization
3. [ ] Predictive risk based on behavior
4. [ ] A/B testing fraud thresholds

## 🎯 Benefits of Integration

1. **Behavioral Analysis**: See how fraudsters browse vs legitimate customers
2. **Early Detection**: Identify suspicious behavior before checkout
3. **Network Effect**: Share visitor patterns across merchant network
4. **Reduced False Positives**: Legitimate repeat visitors are recognized

## 📈 New Metrics Available

With Tracker integration, we can show:
- Visitor-to-order conversion rate
- Average time before fraudulent order
- Most common fraud browsing patterns
- Geographic velocity (location changes)
- Device fingerprint matches

## 🔐 Security Considerations

1. **API Key Management**: Store Tracker API key securely
2. **Data Privacy**: Don't expose PII from visitor data
3. **Rate Limiting**: Respect Tracker service limits
4. **Caching**: Cache visitor data appropriately

---
Created: 2025-06-17
Status: Ready for Implementation