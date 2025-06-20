# SOS Architecture Visualization

## 🏗️ Current Architecture (AS-IS)

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
│  │  - AI Assistant │        │  - getDashboard  │                        │
│  │  - Network Viz  │        │  - reportFraud   │                        │
│  └─────────────────┘        └────────┬─────────┘                        │
│                                      │                                   │
│                                      │ Direct calls (PROBLEM!)           │
└──────────────────────────────────────┼───────────────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │  Mock Data   │      │   ip-api     │      │    Redis     │
        │  (PROBLEM!)  │      │  (Limited)   │      │   (Local)    │
        └──────────────┘      └──────────────┘      └──────────────┘

ISSUES:
- No central API gateway
- Direct external API calls from Gadget
- Mock data still in use
- No circuit breakers
- No unified logging
```

## 🎯 Target Architecture (TO-BE)

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
│  │  - Dashboard    │───────▶│  - Thin layer   │                        │
│  │  - AI Assistant │        │  - Just routing │                        │
│  │  - Network Viz  │        │  - No logic     │                        │
│  └─────────────────┘        └────────┬─────────┘                        │
└──────────────────────────────────────┼───────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY (Express)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │Rate Limiting │  │   Auth       │  │   Logging    │  │  Metrics   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      LOOKUP AGGREGATOR SERVICE                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        Circuit Breakers                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ AbuseIPDB    │  │  EmailRep    │  │IPQualityScore│  │ Numverify  │  │
│  │  Adapter     │  │   Adapter    │  │   Adapter    │  │  Adapter   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│           │                │                 │                │          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Risk Score Calculator                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │    Redis     │      │  PostgreSQL  │      │   S3/Logs    │
        │   (Cache)    │      │  (Persist)   │      │  (Archive)   │
        └──────────────┘      └──────────────┘      └──────────────┘
```

## 🔄 Data Flow Diagrams

### Order Check Flow
```
┌──────┐      ┌────────┐      ┌─────────┐      ┌────────┐      ┌──────┐
│Client│      │Gadget  │      │Gateway  │      │Aggregator│     │APIs  │
└──┬───┘      └───┬────┘      └────┬────┘      └────┬────┘     └──┬───┘
   │              │                 │                 │             │
   │ Check Order  │                 │                 │             │
   ├─────────────▶│                 │                 │             │
   │              │                 │                 │             │
   │              │ Route Request   │                 │             │
   │              ├────────────────▶│                 │             │
   │              │                 │                 │             │
   │              │                 │ Check Cache     │             │
   │              │                 ├────────────────▶│             │
   │              │                 │                 │             │
   │              │                 │                 │ Cache Miss  │
   │              │                 │                 ├────────────▶│
   │              │                 │                 │             │
   │              │                 │                 │◀────────────┤
   │              │                 │                 │   Results   │
   │              │                 │                 │             │
   │              │                 │ Risk Score      │             │
   │              │                 │◀────────────────┤             │
   │              │                 │                 │             │
   │              │ Response        │                 │             │
   │              │◀────────────────┤                 │             │
   │              │                 │                 │             │
   │   Display    │                 │                 │             │
   │◀──────────────┤                 │                 │             │
   │              │                 │                 │             │
```

### Network Intelligence Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                        NETWORK INTELLIGENCE                          │
│                                                                      │
│  Store A           Store B           Store C           Store D       │
│     │                 │                 │                 │          │
│     │   BLOCK IP     │                 │                 │          │
│     └────────────────┼─────────────────┼─────────────────┘          │
│                      ▼                 ▼                 ▼          │
│                 ┌─────────────────────────────────────┐             │
│                 │    EVENT STREAM (Redis/Kafka)       │             │
│                 └─────────────────────────────────────┘             │
│                      │                                              │
│                      ▼                                              │
│                 ┌─────────────────────────────────────┐             │
│                 │    PATTERN DETECTION ENGINE         │             │
│                 └─────────────────────────────────────┘             │
│                      │                                              │
│     ┌────────────────┼────────────────┬────────────────┐           │
│     ▼                ▼                ▼                ▼           │
│  Store A          Store B          Store C          Store D         │
│  ALERTED         ALERTED          ALERTED          ALERTED         │
└─────────────────────────────────────────────────────────────────────┘
```

## 🏛️ Service Architecture

### Microservices Overview
```
┌─────────────────────────────────────────────────────────────────────┐
│                          SOS PLATFORM                                │
├─────────────────────────┬───────────────────┬───────────────────────┤
│   PRESENTATION LAYER    │   BUSINESS LAYER  │    DATA LAYER         │
├─────────────────────────┼───────────────────┼───────────────────────┤
│                         │                   │                       │
│  ┌─────────────────┐    │ ┌───────────────┐ │  ┌───────────────┐   │
│  │  Shopify App    │    │ │Fraud Detection│ │  │   PostgreSQL  │   │
│  │  (Gadget.dev)   │────┼▶│   Service     │─┼─▶│               │   │
│  └─────────────────┘    │ └───────────────┘ │  └───────────────┘   │
│                         │                   │                       │
│  ┌─────────────────┐    │ ┌───────────────┐ │  ┌───────────────┐   │
│  │   Admin Panel   │    │ │  Network      │ │  │     Redis     │   │
│  │   (Future)      │────┼▶│  Intelligence │─┼─▶│               │   │
│  └─────────────────┘    │ └───────────────┘ │  └───────────────┘   │
│                         │                   │                       │
│  ┌─────────────────┐    │ ┌───────────────┐ │  ┌───────────────┐   │
│  │   Public API    │    │ │   Billing     │ │  │      S3       │   │
│  │   (Future)      │────┼▶│   Service     │─┼─▶│               │   │
│  └─────────────────┘    │ └───────────────┘ │  └───────────────┘   │
└─────────────────────────┴───────────────────┴───────────────────────┘
```

## 📦 Component Details

### Lookup Aggregator Service Components
```
lookup-aggregator/
│
├── src/
│   ├── index.js              # Express server entry
│   ├── routes/
│   │   ├── lookup.js         # /api/lookup endpoint
│   │   └── health.js         # /health endpoint
│   │
│   ├── services/
│   │   ├── fraudDetector.js  # Main orchestrator
│   │   ├── riskCalculator.js # Scoring algorithm
│   │   └── cacheManager.js   # Redis operations
│   │
│   ├── adapters/             # External API adapters
│   │   ├── abuseIPDB.js
│   │   ├── emailRep.js
│   │   ├── ipQualityScore.js
│   │   └── numverify.js
│   │
│   └── utils/
│       ├── circuitBreaker.js
│       ├── logger.js
│       └── metrics.js
```

### Database Schema
```
┌─────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Schema                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────┐     ┌────────────────────┐                  │
│  │   fraud_checks    │     │  network_signals   │                  │
│  ├───────────────────┤     ├────────────────────┤                  │
│  │ id (UUID)         │     │ id (UUID)          │                  │
│  │ merchant_id       │     │ merchant_id        │                  │
│  │ identifier        │     │ signal_type        │                  │
│  │ identifier_type   │     │ identifier         │                  │
│  │ risk_score        │     │ metadata (JSONB)   │                  │
│  │ sources (JSONB)   │     │ created_at         │                  │
│  │ created_at        │     └────────────────────┘                  │
│  └───────────────────┘                                              │
│                                                                      │
│  ┌───────────────────┐     ┌────────────────────┐                  │
│  │   api_usage       │     │   merchant_config  │                  │
│  ├───────────────────┤     ├────────────────────┤                  │
│  │ merchant_id       │     │ merchant_id        │                  │
│  │ api_name          │     │ settings (JSONB)   │                  │
│  │ count             │     │ tier               │                  │
│  │ month             │     │ api_keys (encrypted)│                 │
│  └───────────────────┘     └────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Network Layer:      HTTPS only, Cloudflare WAF                  │
│                                                                      │
│  2. Application Layer:  JWT tokens, API key validation               │
│                                                                      │
│  3. Service Layer:      Service-to-service auth, Rate limiting      │
│                                                                      │
│  4. Data Layer:         Encryption at rest, Field-level encryption  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ENVIRONMENT                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐                    ┌─────────────────┐        │
│  │   Cloudflare    │                    │   Gadget.dev   │        │
│  │      (CDN)      │───────────────────▶│   (Managed)    │        │
│  └─────────────────┘                    └─────────────────┘        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │                     AWS/GCP/Azure                        │        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │        │
│  │  │   ECS/K8s   │  │   RDS       │  │   ElastiCache│     │        │
│  │  │  Services   │  │  PostgreSQL │  │    Redis     │     │        │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Next Steps

1. **Document API Contracts** (2 hours)
2. **Create Service Interfaces** (1 day)
3. **Implement Circuit Breakers** (1 day)
4. **Set up Monitoring** (1 day)

---
Created: 2025-06-17
Status: Draft - Needs Review