
const express = require('express');
const Redis = require('ioredis');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Enable CORS for web UI
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

function detectIdentifierType(identifier) {
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(identifier)) return 'ip';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return 'email';
  if (/^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''))) return 'phone';
  return 'unknown';
}

function getCacheKey(type, identifier) {
  return `lookup:${type}:${crypto.createHash('md5').update(identifier).digest('hex')}`;
}

// Free IP lookup using ip-api.com
async function checkIPAPI(ip) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;
    const score = (data.proxy || data.hosting) ? 75 : 0;
    return {
      source: 'ip-api',
      score: score,
      factors: [
        data.proxy && 'Proxy detected',
        data.hosting && 'Hosting provider IP'
      ].filter(Boolean),
      data: data
    };
  } catch (error) {
    console.error('IP-API error:', error.message);
    return null;
  }
}

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

  // Perform lookup
  let score = 0;
  let factors = [];
  let sources = [];
  
  if (type === 'ip') {
    const ipResult = await checkIPAPI(identifier);
    if (ipResult) {
      score = ipResult.score;
      factors = ipResult.factors;
      sources = [ipResult.source];
    }
  } else {
    // Mock data for email/phone until APIs are configured
    score = Math.floor(Math.random() * 100);
    factors = ['API keys not configured - using mock data'];
    sources = ['mock'];
  }

  const result = {
    identifier,
    type,
    riskScore: score,
    riskLevel: score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW',
    factors: factors.length > 0 ? factors : ['No risk factors detected'],
    recommendation: {
      action: score >= 75 ? 'BLOCK' : score >= 50 ? 'REVIEW' : 'ALLOW',
      message: score >= 75 ? 'High risk detected' : score >= 50 ? 'Manual review recommended' : 'Safe to proceed'
    },
    sources,
    processingTime: Date.now() - startTime,
    cached: false
  };

  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  res.json(result);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lookup-aggregator', version: '1.0.0' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Lookup service running on port ${PORT}`);
});
