#!/usr/bin/env node

/**
 * Minimal Fraud Detection Service for SOS
 * No external dependencies required - uses only Node.js built-ins
 * Runs on port 3001
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.PORT || 3001;

// Simple in-memory cache (24 hour TTL)
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clean cache every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Detect identifier type
function detectIdentifierType(identifier) {
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(identifier)) return 'ip';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return 'email';
  if (/^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''))) return 'phone';
  return 'unknown';
}

// Check IP with ip-api.com
function checkIP(ip) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ip-api.com',
      path: `/json/${ip}`,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.status === 'fail') {
            resolve(null);
            return;
          }
          
          const score = (result.proxy || result.hosting) ? 75 : 0;
          const factors = [];
          if (result.proxy) factors.push('Proxy detected');
          if (result.hosting) factors.push('Hosting provider IP');
          
          resolve({
            source: 'ip-api',
            score: score,
            factors: factors,
            data: {
              country: result.country,
              city: result.city,
              isp: result.isp,
              proxy: result.proxy || false,
              hosting: result.hosting || false
            }
          });
        } catch (error) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    
    req.end();
  });
}

// Handle lookup request
async function handleLookup(identifier, type) {
  // Check cache first
  const cacheKey = `${type}:${identifier}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    return { ...cached.data, cached: true };
  }

  // Perform lookup based on type
  let result = {
    identifier,
    type,
    riskScore: 0,
    factors: [],
    details: {},
    cached: false,
    timestamp: new Date().toISOString()
  };

  if (type === 'ip') {
    const ipCheck = await checkIP(identifier);
    if (ipCheck) {
      result.riskScore = ipCheck.score;
      result.factors = ipCheck.factors;
      result.details['ip-api'] = ipCheck.data;
    }
  } else if (type === 'email') {
    // Basic email validation
    const domain = identifier.split('@')[1];
    const suspiciousDomains = ['mailinator.com', 'guerrillamail.com', 'temp-mail.org'];
    
    if (suspiciousDomains.includes(domain)) {
      result.riskScore = 65;
      result.factors.push('Temporary email service');
    }
  } else if (type === 'phone') {
    // Basic phone validation (just format check for now)
    result.riskScore = 0;
    result.factors.push('Phone validation not implemented (no API key)');
  }

  // Cache the result
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });

  return result;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'SOS Fraud Detection (Minimal)',
      uptime: process.uptime(),
      cache: {
        size: cache.size,
        maxAge: '24 hours'
      }
    }));
    return;
  }

  // Lookup endpoint
  if (pathname === '/api/lookup' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { identifier, type } = data;

        if (!identifier) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'identifier is required' }));
          return;
        }

        const detectedType = type || detectIdentifierType(identifier);
        if (detectedType === 'unknown') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Could not detect identifier type' }));
          return;
        }

        console.log(`[${new Date().toISOString()}] Checking ${detectedType}: ${identifier}`);
        
        const result = await handleLookup(identifier, detectedType);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 SOS Fraud Detection Service (Minimal) Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Port: ${PORT}
🏥 Health: http://localhost:${PORT}/health
🔍 Lookup: POST http://localhost:${PORT}/api/lookup
📦 No external dependencies required
🆓 Using free IP-API.com service
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});