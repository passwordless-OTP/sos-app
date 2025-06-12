#!/usr/bin/env node

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.blue}[Step ${step}]${colors.reset} ${colors.bright}${message}${colors.reset}`);
}

async function setupSOS() {
  log('🚀 SOS Store Manager - Quick Setup', 'bright');
  log('==================================\n', 'bright');

  try {
    // Step 1: Create directories
    logStep(1, 'Creating project structure...');
    const dirs = [
      'apps/shopify-app/frontend',
      'packages/api-clients/src',
      'services/lookup-aggregator/src'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
      log(`  📁 Created ${dir}`, 'green');
    }

    // Step 2: Install dependencies
    logStep(2, 'Installing dependencies...');
    await execPromise('npm install express ioredis axios dotenv');
    log('✅ Dependencies installed', 'green');

    // Step 3: Create simple API client
    logStep(3, 'Creating API integration...');
    await fs.writeFile('services/lookup-aggregator/src/index.js', `
const express = require('express');
const Redis = require('ioredis');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next();
});

// Enable CORS for web UI
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

function detectIdentifierType(identifier) {
  if (/^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(identifier)) return 'ip';
  if (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(identifier)) return 'email';
  if (/^\\+?[1-9]\\d{1,14}$/.test(identifier.replace(/[\\s\\-\\(\\)]/g, ''))) return 'phone';
  return 'unknown';
}

function getCacheKey(type, identifier) {
  return \`lookup:\${type}:\${crypto.createHash('md5').update(identifier).digest('hex')}\`;
}

// Free IP lookup using ip-api.com
async function checkIPAPI(ip) {
  try {
    const response = await axios.get(\`http://ip-api.com/json/\${ip}\`);
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
  console.log(\`🚀 Lookup service running on port \${PORT}\`);
});
`);

    // Step 4: Create web UI
    logStep(4, 'Creating web UI...');
    await fs.writeFile('apps/shopify-app/frontend/index.html', `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOS - Fraud Detection</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #5c6ac4;
            text-align: center;
        }
        input {
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 10px;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #5c6ac4;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover {
            background: #4b5ab3;
        }
        .result {
            margin-top: 20px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 5px;
            display: none;
        }
        .risk-score {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .risk-high { color: #d72b2b; }
        .risk-medium { color: #ff6900; }
        .risk-low { color: #108043; }
    </style>
</head>
<body>
    <div class="container">
        <h1>SOS Fraud Detection</h1>
        <input type="text" id="identifier" placeholder="Enter IP, email, or phone">
        <button onclick="checkRisk()">Check Risk</button>
        <div id="result" class="result"></div>
    </div>
    <script>
        async function checkRisk() {
            const identifier = document.getElementById('identifier').value;
            const resultDiv = document.getElementById('result');
            
            try {
                const response = await fetch('http://localhost:3001/api/lookup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    resultDiv.innerHTML = \`<p style="color: red;">\${data.error}</p>\`;
                } else {
                    resultDiv.innerHTML = \`
                        <div class="risk-score risk-\${data.riskLevel.toLowerCase()}">\${data.riskScore}</div>
                        <p><strong>Risk Level:</strong> \${data.riskLevel}</p>
                        <p><strong>Recommendation:</strong> \${data.recommendation.action}</p>
                        <p><strong>Factors:</strong> \${data.factors.join(', ')}</p>
                    \`;
                }
                resultDiv.style.display = 'block';
            } catch (error) {
                resultDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
                resultDiv.style.display = 'block';
            }
        }
    </script>
</body>
</html>
`);

    // Step 5: Create start script
    logStep(5, 'Creating start script...');
    await fs.writeFile('start.sh', `#!/bin/bash
echo "Starting SOS services..."

# Start Redis if not running
if ! docker ps | grep -q sos-redis; then
  docker run --name sos-redis -p 6379:6379 -d redis:7-alpine
fi

# Start the API service
node services/lookup-aggregator/src/index.js &

# Start web UI
cd apps/shopify-app/frontend && python3 -m http.server 8080 &

echo "✅ SOS is running!"
echo "🌐 Web UI: http://localhost:8080"
echo "🔌 API: http://localhost:3001/api/lookup"

wait
`);
    
    await execPromise('chmod +x start.sh');

    log('\n✨ Setup complete!', 'green');
    log('\nNext steps:', 'yellow');
    log('1. Run: ./start.sh', 'yellow');
    log('2. Open: http://localhost:8080', 'yellow');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
}

setupSOS();
