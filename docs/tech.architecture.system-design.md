# SOS System Architecture

## Overview

SOS (Store Operations Shield) is built as a microservices architecture deployed on cloud infrastructure. The system is designed for high availability, scalability, and real-time fraud detection.

## Core Components

### 1. Shopify App (Frontend)
- Built with Gadget.dev
- React + Shopify Polaris UI
- Real-time risk scoring display
- Webhook handlers for order events

### 2. API Gateway
- Node.js + Express
- Rate limiting and caching
- Request routing to microservices
- Authentication middleware

### 3. Lookup Aggregator Service
- Queries multiple fraud detection APIs
- Implements circuit breakers
- Caches results in Redis
- Weighted risk scoring algorithm

### 4. Risk Engine
- Core fraud detection logic
- Machine learning models
- Pattern recognition
- Network effect calculations

### 5. Data Layer
- PostgreSQL: Transactional data
- Redis: Caching and sessions
- S3: Long-term storage

## API Integration

### IP Services
- AbuseIPDB
- IPQualityScore
- IPInfo
- ProxyCheck

### Email Services
- EmailRep
- ZeroBounce
- AbstractAPI

### Phone Services
- Numverify
- Veriphone
- AbstractAPI

## Security Measures

1. **API Key Encryption**: All API keys encrypted at rest
2. **Rate Limiting**: Per-merchant and global limits
3. **Input Validation**: Strict validation on all inputs
4. **Audit Logging**: Complete audit trail
5. **HTTPS Only**: All communications encrypted

## Scaling Strategy

1. **Horizontal Scaling**: Microservices can scale independently
2. **Caching**: Multi-layer caching strategy
3. **CDN**: Static assets served via CDN
4. **Database Replication**: Read replicas for queries
5. **Queue Processing**: Async processing for heavy operations