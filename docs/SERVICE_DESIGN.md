# SOS Service Design Document

## 🎯 Design Principles

1. **Single Responsibility**: Each service has one clear purpose
2. **Loose Coupling**: Services communicate through well-defined APIs
3. **High Cohesion**: Related functionality stays together
4. **Fault Tolerance**: Failures are isolated and handled gracefully
5. **Scalability**: Services can scale independently

## 📐 Service Architecture

### Service Layers
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  Shopify Admin    Mobile App    Public API    Webhooks      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     GATEWAY LAYER                            │
│  Authentication    Rate Limiting    Routing    Monitoring    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LAYER                            │
│  Fraud Detection    Network Intel    Billing    Analytics   │
│                                                              │
│  External Services:                                          │
│  - Tracker Service (152.42.148.206) - Visitor behavior      │
│  - Lookup Aggregator - Fraud APIs                           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  PostgreSQL    Redis    S3    Event Stream    Time Series   │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Service Interfaces

### 1. Fraud Detection Service

**Endpoint**: `/api/v1/fraud/check`

**Request**:
```json
{
  "merchantId": "string",
  "orderId": "string",
  "customer": {
    "email": "string",
    "ip": "string",
    "phone": "string"
  },
  "orderValue": "number",
  "shippingAddress": "object"
}
```

**Response**:
```json
{
  "riskScore": 0-100,
  "riskLevel": "low|medium|high|critical",
  "factors": [
    {
      "type": "ip_risk",
      "score": 75,
      "reason": "Proxy detected"
    }
  ],
  "recommendation": "review|accept|reject",
  "networkIntelligence": {
    "flaggedByMerchants": 3,
    "networkRiskScore": 82
  }
}
```

### 2. Network Intelligence Service

**Endpoint**: `/api/v1/network/signal`

**Event Types**:
```typescript
type NetworkSignal = 
  | { type: 'BLOCK', identifier: string, reason: string }
  | { type: 'FLAG', identifier: string, severity: number }
  | { type: 'TRUST', identifier: string, confidence: number }
  | { type: 'PROBE', identifier: string, response?: any }
```

**WebSocket Events**:
```javascript
// Subscribe to network events
ws.send({ action: 'subscribe', channels: ['fraud-alerts', 'network-updates'] })

// Receive real-time updates
ws.on('message', (data) => {
  // { channel: 'fraud-alerts', event: { type: 'BLOCK', ... } }
})
```

### 3. API Gateway

**Request Flow**:
```
┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│  Client  │────▶│  Auth   │────▶│  Rate    │────▶│ Router  │
└──────────┘     └─────────┘     │  Limit   │     └────┬────┘
                                 └──────────┘           │
                                                       ▼
                                              ┌────────────────┐
                                              │ Target Service │
                                              └────────────────┘
```

**Gateway Responsibilities**:
- JWT validation
- API key management
- Rate limiting (per merchant)
- Request routing
- Response caching
- Metric collection

## 🔄 Service Communication

### Synchronous Communication

**HTTP/REST** for:
- Fraud checks (need immediate response)
- Dashboard queries
- Configuration updates

**gRPC** for (future):
- Inter-service communication
- High-performance requirements

### Asynchronous Communication

**Redis Pub/Sub** for:
- Real-time fraud alerts
- Network updates
- Cache invalidation

**Message Queue** (future) for:
- Batch processing
- Report generation
- Email notifications

## 🛡️ Fault Tolerance

### Circuit Breaker Pattern
```javascript
class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await this.service(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### Fallback Strategies

1. **Cache Fallback**: Return cached result if available
2. **Partial Response**: Return what's available
3. **Default Response**: Return safe defaults
4. **Queue for Retry**: Store for later processing

## 📊 Service Metrics

### Key Metrics to Track

**Availability**:
- Uptime percentage
- Error rates
- Circuit breaker trips

**Performance**:
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Cache hit rate

**Business**:
- Fraud detection accuracy
- False positive rate
- Network effect participation

### Monitoring Stack
```
Services ──▶ Metrics ──▶ Prometheus ──▶ Grafana
    │                                      │
    └──▶ Logs ──▶ ELK Stack ──▶ Kibana ◀──┘
```

## 🚀 Deployment Strategy

### Container Architecture
```yaml
# docker-compose.yml
version: '3.8'

services:
  gateway:
    image: sos/gateway:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres

  fraud-detector:
    image: sos/fraud-detector:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    deploy:
      replicas: 3

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

  postgres:
    image: postgres:15
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

### Service Discovery

**Development**: Docker Compose networking
**Production**: Kubernetes Services or AWS ECS Service Discovery

## 🔐 Security Considerations

### API Security
1. **Authentication**: JWT tokens with short expiry
2. **Authorization**: Role-based access control
3. **Encryption**: TLS 1.3 for all communications
4. **Secrets**: Vault or AWS Secrets Manager

### Data Security
1. **PII Handling**: Minimize storage, encrypt at rest
2. **Audit Logging**: Track all access and changes
3. **Data Retention**: Clear policies for deletion

## 📋 Implementation Roadmap

### Phase 1: Core Services (Week 1)
- [ ] API Gateway with basic routing
- [ ] Fraud Detection Service with 3 APIs
- [ ] Basic caching with Redis

### Phase 2: Resilience (Week 2)
- [ ] Circuit breakers
- [ ] Retry logic
- [ ] Health checks

### Phase 3: Network Effect (Week 3)
- [ ] Event streaming
- [ ] WebSocket server
- [ ] Real-time updates

### Phase 4: Scale (Week 4)
- [ ] Horizontal scaling
- [ ] Performance optimization
- [ ] Monitoring dashboard

---
Created: 2025-06-17
Status: Design Phase