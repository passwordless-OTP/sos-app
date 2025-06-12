#!/usr/bin/env node

/**
 * SOS Store Manager - Complete Setup Script
 * This script sets up all API integrations and creates the necessary files
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.blue}[Step ${step}]${colors.reset} ${colors.bright}${message}${colors.reset}`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

// Main setup function
async function setupSOS() {
  log('🚀 SOS Store Manager - Complete Setup', 'bright');
  log('=====================================\n', 'bright');

  // Step 1: Check prerequisites
  logStep(1, 'Checking prerequisites...');
  
  const checks = {
    node: await checkCommand('node --version'),
    npm: await checkCommand('npm --version'),
    docker: await checkCommand('docker --version')
  };
  
  for (const [tool, installed] of Object.entries(checks)) {
    if (installed) {
      log(`✅ ${tool} is installed`, 'green');
    } else {
      log(`❌ ${tool} is not installed`, 'red');
      if (tool === 'docker') {
        log('   Docker is optional but recommended. You can continue without it.', 'yellow');
      } else {
        process.exit(1);
      }
    }
  }

  // Step 2: Create directory structure
  logStep(2, 'Creating project structure...');
  
  const directories = [
    'apps/shopify-app/api',
    'apps/shopify-app/frontend',
    'apps/api-gateway/src',
    'packages/risk-engine/src',
    'packages/api-clients/src',
    'services/lookup-aggregator/src',
    'services/network-intelligence/src',
    'infrastructure/scripts',
    'infrastructure/docker',
    'infrastructure/db'
  ];
  
  for (const dir of directories) {
    await ensureDirectory(dir);
    log(`  📁 Created ${dir}`, 'green');
  }

  // Step 3: Install dependencies
  logStep(3, 'Installing dependencies...');
  
  try {
    await execPromise('npm install express ioredis axios dotenv limiter playwright');
    log('✅ Dependencies installed', 'green');
  } catch (error) {
    log('⚠️  Some dependencies failed to install, continuing...', 'yellow');
  }

  // Step 4: Create API client files
  logStep(4, 'Creating API client modules...');
  
  // Create the API clients module
  await fs.writeFile('packages/api-clients/src/index.js', `
const axios = require('axios');

// Rate limiting configuration
const rateLimits = {
  abuseipdb: { requests: 1000, window: 'day' },
  emailrep: { requests: 1000, window: 'day' },
  ipapi: { requests: 1000, window: 'day' },
  numverify: { requests: 100, window: 'month' }
};

// Cache for rate limiting
const requestCounts = {};

// Check rate limit
function checkRateLimit(service) {
  const now = Date.now();
  const key = \`\${service}:\${new Date().toDateString()}\`;
  
  if (!requestCounts[key]) {
    requestCounts[key] = { count: 0, reset: now + 86400000 };
  }
  
  if (requestCounts[key].count >= rateLimits[service].requests) {
    return false;
  }
  
  requestCounts[key].count++;
  return true;
}

// IP Lookup Services
async function checkAbuseIPDB(ip) {
  if (!process.env.ABUSEIPDB_API_KEY) {
    console.log('AbuseIPDB API key not configured');
    return null;
  }
  
  if (!checkRateLimit('abuseipdb')) {
    console.log('AbuseIPDB rate limit reached');
    return null;
  }
  
  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      headers: { 'Key': process.env.ABUSEIPDB_API_KEY },
      params: {
        ipAddress: ip,
        maxAgeInDays: 90,
        verbose: true
      },
      timeout: 5000
    });
    
    const data = response.data.data;
    return {
      source: 'abuseipdb',
      score: data.abuseConfidenceScore || 0,
      factors: [],
      data: {
        totalReports: data.totalReports,
        countryCode: data.countryCode,
        usageType: data.usageType,
        isp: data.isp
      }
    };
  } catch (error) {
    console.error('AbuseIPDB error:', error.message);
    return null;
  }
}

async function checkIPAPI(ip) {
  if (!checkRateLimit('ipapi')) {
    console.log('IP-API rate limit reached');
    return null;
  }
  
  try {
    const response = await axios.get(\`http://ip-api.com/json/\${ip}\`, {
      params: {
        fields: 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting'
      },
      timeout: 5000
    });
    
    if (response.data.status === 'fail') {
      return null;
    }
    
    const data = response.data;
    const score = (data.proxy || data.hosting) ? 75 : 0;
    
    return {
      source: 'ip-api',
      score: score,
      factors: [
        data.proxy && 'Proxy detected',
        data.hosting && 'Hosting provider IP'
      ].filter(Boolean),
      data: {
        country: data.country,
        city: data.city,
        isp: data.isp,
        proxy: data.proxy,
        hosting: data.hosting
      }
    };
  } catch (error) {
    console.error('IP-API error:', error.message);
    return null;
  }
}

// Email Verification Services
async function checkEmailRep(email) {
  if (!process.env.EMAILREP_API_KEY) {
    console.log('EmailRep API key not configured');
    return null;
  }
  
  if (!checkRateLimit('emailrep')) {
    console.log('EmailRep rate limit reached');
    return null;
  }
  
  try {
    const response = await axios.get(\`https://emailrep.io/\${email}\`, {
      headers: { 'Key': process.env.EMAILREP_API_KEY },
      timeout: 5000
    });
    
    const data = response.data;
    const riskScore = 100 - (data.reputation || 0);
    
    const factors = [];
    if (data.suspicious) factors.push('Marked as suspicious');
    if (data.credentials_leaked) factors.push('Credentials leaked');
    if (data.data_breach) factors.push('Found in data breach');
    if (data.malicious_activity) factors.push('Malicious activity detected');
    if (data.spam) factors.push('Associated with spam');
    if (data.free_provider) factors.push('Free email provider');
    if (data.disposable) factors.push('Disposable email');
    
    return {
      source: 'emailrep',
      score: riskScore,
      factors: factors,
      data: {
        reputation: data.reputation,
        suspicious: data.suspicious,
        references: data.references,
        details: data.details
      }
    };
  } catch (error) {
    console.error('EmailRep error:', error.message);
    return null;
  }
}

// Phone Validation Services
async function checkNumverify(phone) {
  if (!process.env.NUMVERIFY_API_KEY) {
    console.log('Numverify API key not configured');
    return null;
  }
  
  if (!checkRateLimit('numverify')) {
    console.log('Numverify rate limit reached');
    return null;
  }
  
  try {
    const response = await axios.get('http://apilayer.net/api/validate', {
      params: {
        access_key: process.env.NUMVERIFY_API_KEY,
        number: phone,
        format: 1
      },
      timeout: 5000
    });
    
    const data = response.data;
    let score = 0;
    const factors = [];
    
    if (!data.valid) {
      score = 100;
      factors.push('Invalid phone number');
    } else {
      if (data.line_type === 'voip') {
        score = 60;
        factors.push('VOIP number');
      }
      if (data.line_type === 'mobile') {
        score = 10;
      }
    }
    
    return {
      source: 'numverify',
      score: score,
      factors: factors,
      data: {
        valid: data.valid,
        lineType: data.line_type,
        carrier: data.carrier,
        country: data.country_name
      }
    };
  } catch (error) {
    console.error('Numverify error:', error.message);
    return null;
  }
}

module.exports = {
  checkAbuseIPDB,
  checkIPAPI,
  checkEmailRep,
  checkNumverify,
  rateLimits,
  requestCounts
};
`);
  
  log('✅ Created API clients module', 'green');

  // Step 5: Create the enhanced lookup service
  logStep(5, 'Creating enhanced lookup service...');
  
  await fs.writeFile('services/lookup-aggregator/src/index.js', `
const express = require('express');
const Redis = require('ioredis');
const crypto = require('crypto');
require('dotenv').config();

const {
  checkAbuseIPDB,
  checkIPAPI,
  checkEmailRep,
  checkNumverify
} = require('../../../packages/api-clients/src');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// Middleware for logging
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next();
});

// Detect identifier type
function detectIdentifierType(identifier) {
  if (/^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(identifier)) return 'ip';
  if (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(identifier)) return 'email';
  if (/^\\+?[1-9]\\d{1,14}$/.test(identifier.replace(/[\\s\\-\\(\\)]/g, ''))) return 'phone';
  return 'unknown';
}

// Generate cache key
function getCacheKey(type, identifier) {
  return \`lookup:\${type}:\${crypto.createHash('md5').update(identifier).digest('hex')}\`;
}

// Calculate risk level
function getRiskLevel(score) {
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 25) return 'LOW';
  return 'MINIMAL';
}

// Generate recommendation
function getRecommendation(score, factors) {
  if (score >= 75) {
    return {
      action: 'BLOCK',
      message: 'High risk detected. Recommend blocking this transaction.',
      requiresReview: true
    };
  } else if (score >= 50) {
    return {
      action: 'REVIEW',
      message: 'Medium risk detected. Manual review recommended.',
      requiresReview: true
    };
  } else if (score >= 25) {
    return {
      action: 'MONITOR',
      message: 'Low risk detected. Proceed with monitoring.',
      requiresReview: false
    };
  } else {
    return {
      action: 'ALLOW',
      message: 'Minimal risk detected. Safe to proceed.',
      requiresReview: false
    };
  }
}

// Aggregate results from multiple sources
function aggregateResults(results) {
  const validResults = results.filter(r => r !== null);
  
  if (validResults.length === 0) {
    return {
      score: 0,
      factors: ['No data available from API sources'],
      sources: [],
      details: {}
    };
  }
  
  // Calculate weighted average score
  const totalScore = validResults.reduce((sum, r) => sum + r.score, 0);
  const avgScore = Math.round(totalScore / validResults.length);
  
  // Collect all factors
  const allFactors = [];
  const details = {};
  
  validResults.forEach(result => {
    allFactors.push(...result.factors);
    details[result.source] = result.data;
  });
  
  // Remove duplicates
  const uniqueFactors = [...new Set(allFactors)];
  
  return {
    score: avgScore,
    factors: uniqueFactors.length > 0 ? uniqueFactors : ['No specific risk factors identified'],
    sources: validResults.map(r => r.source),
    details: details
  };
}

// Main lookup endpoint
app.post('/api/lookup', async (req, res) => {
  const startTime = Date.now();
  const { identifier, skipCache = false } = req.body;

  if (!identifier) {
    return res.status(400).json({ 
      error: 'Identifier required',
      message: 'Please provide an IP address, email, or phone number to check'
    });
  }

  const type = detectIdentifierType(identifier);
  if (type === 'unknown') {
    return res.status(400).json({ 
      error: 'Invalid identifier format',
      message: 'Please provide a valid IP address, email, or phone number'
    });
  }

  // Check cache
  const cacheKey = getCacheKey(type, identifier);
  if (!skipCache) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const result = JSON.parse(cached);
      result.cached = true;
      result.processingTime = Date.now() - startTime;
      console.log(\`Cache hit for \${type}: \${identifier}\`);
      return res.json(result);
    }
  }

  console.log(\`Performing fresh lookup for \${type}: \${identifier}\`);

  // Perform lookups based on type
  let results = [];
  
  try {
    if (type === 'ip') {
      results = await Promise.all([
        checkAbuseIPDB(identifier),
        checkIPAPI(identifier)
      ]);
    } else if (type === 'email') {
      results = await Promise.all([
        checkEmailRep(identifier)
      ]);
    } else if (type === 'phone') {
      results = await Promise.all([
        checkNumverify(identifier)
      ]);
    }
  } catch (error) {
    console.error('Error during API calls:', error);
  }

  // Aggregate results
  const aggregated = aggregateResults(results);
  const riskLevel = getRiskLevel(aggregated.score);
  const recommendation = getRecommendation(aggregated.score, aggregated.factors);

  const result = {
    identifier,
    type,
    riskScore: aggregated.score,
    riskLevel,
    factors: aggregated.factors,
    recommendation,
    sources: aggregated.sources,
    details: aggregated.details,
    timestamp: new Date().toISOString(),
    processingTime: Date.now() - startTime,
    cached: false
  };

  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  console.log(\`Cached result for \${type}: \${identifier}\`);

  // Store in database (if connected)
  // TODO: Add PostgreSQL storage

  res.json(result);
});

// Batch lookup endpoint
app.post('/api/batch-lookup', async (req, res) => {
  const { identifiers } = req.body;
  
  if (!identifiers || !Array.isArray(identifiers)) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Please provide an array of identifiers'
    });
  }
  
  const results = await Promise.all(
    identifiers.map(async (identifier) => {
      try {
        const response = await fetch(\`http://localhost:\${PORT}/api/lookup\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier })
        });
        return await response.json();
      } catch (error) {
        return { identifier, error: error.message };
      }
    })
  );
  
  res.json({ results });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const redisConnected = redis.status === 'ready';
  
  res.json({ 
    status: 'ok',
    service: 'lookup-aggregator',
    version: '1.0.0',
    uptime: process.uptime(),
    redis: redisConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API usage statistics
app.get('/api/stats', async (req, res) => {
  const stats = {
    // TODO: Implement real statistics
    totalLookups: 0,
    todayLookups: 0,
    cacheHitRate: 0,
    apiUsage: {}
  };
  
  res.json(stats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`🚀 Lookup aggregator service running on port \${PORT}\`);
  console.log(\`   Health check: http://localhost:\${PORT}/health\`);
  console.log(\`   API endpoint: http://localhost:\${PORT}/api/lookup\`);
});

module.exports = app;
`);

  log('✅ Created enhanced lookup service', 'green');

  // Step 6: Create a simple web UI
  logStep(6, 'Creating web UI...');
  
  await fs.writeFile('apps/shopify-app/frontend/index.html', `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOS - Store Operations Shield</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #5c6ac4;
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .lookup-form {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        button {
            background: #5c6ac4;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        
        button:hover {
            background: #4b5ab3;
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .result {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            display: none;
        }
        
        .risk-score {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        
        .risk-low { color: #108043; }
        .risk-medium { color: #ff6900; }
        .risk-high { color: #d72b2b; }
        
        .factors {
            background: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        
        .factor {
            padding: 5px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        
        .factor:last-child {
            border-bottom: none;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            display: none;
        }
        
        .error {
            background: #fbeae5;
            color: #d72b2b;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            display: none;
        }
        
        .examples {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
        
        .example-link {
            color: #5c6ac4;
            cursor: pointer;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SOS - Store Operations Shield</h1>
            <p>AI-powered fraud detection for Shopify merchants</p>
        </div>
        
        <div class="lookup-form">
            <form id="lookupForm">
                <div class="form-group">
                    <label for="identifier">Enter IP, Email, or Phone to Check:</label>
                    <input 
                        type="text" 
                        id="identifier" 
                        name="identifier" 
                        placeholder="e.g., 192.168.1.1, user@example.com, +1234567890"
                        required
                    >
                </div>
                <button type="submit" id="submitBtn">Check Risk Score</button>
                
                <div class="examples">
                    Try these examples:
                    <span class="example-link" onclick="setExample('8.8.8.8')">8.8.8.8</span> |
                    <span class="example-link" onclick="setExample('test@gmail.com')">test@gmail.com</span> |
                    <span class="example-link" onclick="setExample('+14155552671')">+14155552671</span>
                </div>
            </form>
        </div>
        
        <div class="loading">
            <p>🔍 Checking multiple fraud detection sources...</p>
        </div>
        
        <div class="error" id="error"></div>
        
        <div class="result" id="result">
            <h2>Risk Assessment</h2>
            <div class="risk-score" id="riskScore"></div>
            <div id="riskLevel"></div>
            
            <h3>Risk Factors</h3>
            <div class="factors" id="factors"></div>
            
            <h3>Recommendation</h3>
            <div id="recommendation"></div>
            
            <h3>Data Sources</h3>
            <div id="sources"></div>
            
            <div style="margin-top: 20px; font-size: 14px; color: #666;">
                <p>Processing time: <span id="processingTime"></span>ms</p>
                <p>Cached result: <span id="cached"></span></p>
            </div>
        </div>
    </div>

    <script>
        const API_URL = 'http://localhost:3001/api/lookup';
        
        function setExample(value) {
            document.getElementById('identifier').value = value;
        }
        
        document.getElementById('lookupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const identifier = document.getElementById('identifier').value.trim();
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.querySelector('.loading');
            const error = document.getElementById('error');
            const result = document.getElementById('result');
            
            // Reset UI
            submitBtn.disabled = true;
            loading.style.display = 'block';
            error.style.display = 'none';
            result.style.display = 'none';
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ identifier })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to check identifier');
                }
                
                // Display results
                displayResult(data);
                
            } catch (err) {
                error.textContent = err.message;
                error.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                loading.style.display = 'none';
            }
        });
        
        function displayResult(data) {
            const result = document.getElementById('result');
            const riskScore = document.getElementById('riskScore');
            const riskLevel = document.getElementById('riskLevel');
            const factors = document.getElementById('factors');
            const recommendation = document.getElementById('recommendation');
            const sources = document.getElementById('sources');
            const processingTime = document.getElementById('processingTime');
            const cached = document.getElementById('cached');
            
            // Set risk score with color
            riskScore.textContent = data.riskScore;
            riskScore.className = 'risk-score';
            if (data.riskScore >= 75) {
                riskScore.classList.add('risk-high');
            } else if (data.riskScore >= 50) {
                riskScore.classList.add('risk-medium');
            } else {
                riskScore.classList.add('risk-low');
            }
            
            // Set risk level
            riskLevel.innerHTML = \`<strong>Risk Level:</strong> \${data.riskLevel}\`;
            
            // Set factors
            factors.innerHTML = data.factors.map(factor => 
                \`<div class="factor">• \${factor}</div>\`
            ).join('');
            
            // Set recommendation
            recommendation.innerHTML = \`
                <strong>Action:</strong> \${data.recommendation.action}<br>
                <strong>Message:</strong> \${data.recommendation.message}
            \`;
            
            // Set sources
            sources.innerHTML = data.sources.length > 0 
                ? data.sources.join(', ')
                : 'No API sources available';
            
            // Set metadata
            processingTime.textContent = data.processingTime;
            cached.textContent = data.cached ? 'Yes' : 'No';
            
            result.style.display = 'block';
        }
    </script>
</body>
</html>
`);

  log('✅ Created web UI', 'green');

  // Step 7: Create API setup helper
  logStep(7, 'Creating API setup helper...');
  
  await fs.writeFile('infrastructure/scripts/api-setup-guide.md', `
# SOS API Setup Guide

## Quick Start APIs (No Account Required)

1. **IP-API** - Free geolocation API
   - No API key required
   - Limit: 45 requests per minute
   - Already integrated!

## APIs Requiring Registration

### 1. AbuseIPDB (IP Reputation)
- Visit: https://www.abuseipdb.com/register
- Sign up with email or Google
- Verify your email
- Go to: https://www.abuseipdb.com/account/api
- Create new key
- Copy and add to .env: ABUSEIPDB_API_KEY=your_key_here

### 2. EmailRep.io (Email Reputation)
- Visit: https://emailrep.io/signup
- Create account
- Go to account settings
- Copy API key
- Add to .env: EMAILREP_API_KEY=your_key_here

### 3. Numverify (Phone Validation)
- Visit: https://numverify.com/product
- Click "Get Free API Key"
- Sign up for free account
- Copy API key from dashboard
- Add to .env: NUMVERIFY_API_KEY=your_key_here

### 4. IPQualityScore (Advanced Fraud Scoring)
- Visit: https://www.ipqualityscore.com/create-account
- Sign up for free account
- Verify email
- Go to: https://www.ipqualityscore.com/user/settings
- Copy API key
- Add to .env: IPQUALITYSCORE_API_KEY=your_key_here

## Testing Your APIs

After adding keys to .env, restart the service and test:

\`\`\`bash
# Test IP lookup
curl -X POST http://localhost:3001/api/lookup \\
  -H "Content-Type: application/json" \\
  -d '{"identifier": "8.8.8.8"}'

# Test email lookup
curl -X POST http://localhost:3001/api/lookup \\
  -H "Content-Type: application/json" \\
  -d '{"identifier": "test@gmail.com"}'

# Test phone lookup
curl -X POST http://localhost:3001/api/lookup \\
  -H "Content-Type: application/json" \\
  -d '{"identifier": "+1234567890"}'
\`\`\`

## Free Tier Limits

| Service | Free Limit | Reset Period |
|---------|------------|--------------|
| AbuseIPDB | 1,000 | Daily |
| EmailRep | 1,000 | Daily |
| IP-API | 45/minute | Per minute |
| Numverify | 100 | Monthly |
| IPQualityScore | 200 | Daily |

Total potential: ~2,200+ lookups per day!
`);

  // Step 8: Create startup script
  logStep(8, 'Creating startup script...');
  
  await fs.writeFile('start.sh', `#!/bin/bash

echo "🚀 Starting SOS Store Manager..."

# Check if Redis is running
if ! docker ps | grep -q sos-redis; then
  echo "Starting Redis..."
  docker run --name sos-redis -p 6379:6379 -d redis:7-alpine
fi

# Check if PostgreSQL is running
if ! docker ps | grep -q sos-postgres; then
  echo "Starting PostgreSQL..."
  docker run --name sos-postgres \\
    -e POSTGRES_PASSWORD=sos_password \\
    -e POSTGRES_USER=sos_user \\
    -e POSTGRES_DB=sos_store_db \\
    -p 5432:5432 \\
    -d postgres:15-alpine
  
  # Wait for PostgreSQL to start
  sleep 5
  
  # Initialize database
  docker exec -i sos-postgres psql -U sos_user -d sos_store_db < infrastructure/db/init.sql
fi

# Start the lookup service
echo "Starting lookup aggregator service..."
node services/lookup-aggregator/src/index.js &

# Start the web UI server
echo "Starting web UI..."
cd apps/shopify-app/frontend && python3 -m http.server 8080 &

echo ""
echo "✅ SOS is running!"
echo ""
echo "🌐 Web UI: http://localhost:8080"
echo "🔌 API: http://localhost:3001/api/lookup"
echo "❤️  Health: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
wait
`);

  await execPromise('chmod +x start.sh');

  // Step 9: Final summary
  logStep(9, 'Setup complete!');
  
  log('\n✨ SOS Store Manager is ready!', 'green');
  log('================================\n', 'green');
  
  log('Next steps:', 'yellow');
  log('1. Add your API keys to .env file', 'yellow');
  log('2. Start the services: ./start.sh', 'yellow');
  log('3. Open web UI: http://localhost:8080', 'yellow');
  log('4. Test API: http://localhost:3001/api/lookup', 'yellow');
  
  log('\nFor API setup instructions, see:', 'blue');
  log('infrastructure/scripts/api-setup-guide.md', 'blue');
}

// Helper function to check if a command exists
async function checkCommand(command) {
  try {
    await execPromise(command);
    return true;
  } catch {
    return false;
  }
}

// Run the setup
if (require.main === module) {
  setupSOS().catch(error => {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { setupSOS };
`