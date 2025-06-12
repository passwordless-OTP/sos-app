# Lookup Aggregator Service

Microservice for aggregating fraud detection API calls

## Features
- Multi-source querying
- Intelligent caching
- Rate limit management
- Circuit breaker pattern

## API Endpoints

- `POST /lookup` - Single identifier lookup
- `POST /batch` - Batch lookup
- `GET /stats` - API usage statistics

## Environment Variables

See `.env.example` for required API keys