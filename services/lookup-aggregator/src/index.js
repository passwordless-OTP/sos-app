// services/lookup-aggregator/src/index.js
// Core lookup aggregation service - simplified version for MVP

const express = require('express');
const Redis = require('ioredis');
const crypto = require('crypto');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// Simple identifier type detection
function detectIdentifierType(identifier) {
  // IP Address
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(identifier)) {
    return 'ip';
  }
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    return 'email';
  }
  // Phone
  if (/^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''))) {
    return 'phone';
  }
  return 'unknown';
}

// Generate cache key
function getCacheKey(type, identifier) {
  return `lookup:${type}:${crypto.createHash('md5').update(identifier).digest('hex')}`;
}

// Main lookup endpoint
app.post('/api/lookup', async (req, res) => {
  const startTime = Date.now();
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Identifier required' });
  }

  const type = detectIdentifierType(identifier);
  if (type === 'unknown') {
    return res.status(400).json({ error: 'Invalid identifier format' });
  }

  // Check cache
  const cacheKey = getCacheKey(type, identifier);
  const cached = await redis.get(cacheKey);
  if (cached) {
    const result = JSON.parse(cached);
    result.cached = true;
    result.processingTime = Date.now() - startTime;
    return res.json(result);
  }

  // TODO: Implement actual API calls
  // For MVP, return mock data
  const mockResult = {
    identifier,
    type,
    riskScore: Math.floor(Math.random() * 100),
    riskLevel: 'MEDIUM',
    factors: ['Mock data - implement real APIs'],
    recommendation: {
      action: 'REVIEW',
      message: 'Manual review recommended'
    },
    sources: ['mock'],
    processingTime: Date.now() - startTime
  };

  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(mockResult));

  res.json(mockResult);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lookup-aggregator' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Lookup aggregator service running on port ${PORT}`);
});

module.exports = app;
