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

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Detect identifier type
function detectIdentifierType(identifier) {
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(identifier)) return 'ip';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return 'email';
  if (/^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''))) return 'phone';
  return 'unknown';
}

// Generate cache key
function getCacheKey(type, identifier) {
  return `lookup:${type}:${crypto.createHash('md5').update(identifier).digest('hex')}`;
}

// API Implementations

// Free IP-API lookup
async function checkIPAPI(ip) {
  try {
    console.log(`Checking IP-API for ${ip}`);
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 5000
    });
    const data = response.data;
    
    if (data.status === 'fail') {
      return null;
    }
    
    const score = (data.proxy || data.hosting) ? 75 : 0;
    const factors = [];
    if (data.proxy) factors.push('Proxy detected');
    if (data.hosting) factors.push('Hosting provider IP');
    
    return {
      source: 'ip-api',
      score: score,
      factors: factors,
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

// AbuseIPDB lookup
async function checkAbuseIPDB(ip) {
  if (!process.env.ABUSEIPDB_API_KEY) {
    console.log('AbuseIPDB API key not configured');
    return null;
  }
  
  try {
    console.log(`Checking AbuseIPDB for ${ip}`);
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
    const score = data.abuseConfidenceScore || 0;
    const factors = [];
    
    if (score > 50) factors.push(`High abuse score (${score}%)`);
    if (data.totalReports > 0) factors.push(`Reported ${data.totalReports} times`);
    if (data.isWhitelisted) factors.push('Whitelisted IP');
    
    return {
      source: 'abuseipdb',
      score: score,
      factors: factors,
      data: data
    };
  } catch (error) {
    console.error('AbuseIPDB error:', error.message);
    return null;
  }
}

// EmailRep lookup
async function checkEmailRep(email) {
  if (!process.env.EMAILREP_API_KEY) {
    console.log('EmailRep API key not configured');
    return null;
  }
  
  try {
    console.log(`Checking EmailRep for ${email}`);
    const response = await axios.get(`https://emailrep.io/${email}`, {
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
    
    return {
      source: 'emailrep',
      score: riskScore,
      factors: factors,
      data: data
    };
  } catch (error) {
    console.error('EmailRep error:', error.message);
    return null;
  }
}

// Numverify phone lookup
async function checkNumverify(phone) {
  if (!process.env.NUMVERIFY_API_KEY) {
    console.log('Numverify API key not configured');
    return null;
  }
  
  try {
    console.log(`Checking Numverify for ${phone}`);
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
      } else if (data.line_type === 'mobile') {
        score = 10;
        factors.push('Mobile number');
      } else if (data.line_type === 'landline') {
        score = 5;
        factors.push('Landline number');
      }
      
      factors.push(`Country: ${data.country_name}`);
      if (data.carrier) factors.push(`Carrier: ${data.carrier}`);
    }
    
    return {
      source: 'numverify',
      score: score,
      factors: factors,
      data: data
    };
  } catch (error) {
    console.error('Numverify error:', error.message);
    return null;
  }
}

// Aggregate results
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
  
  // Calculate average score
  const totalScore = validResults.reduce((sum, r) => sum + r.score, 0);
  const avgScore = Math.round(totalScore / validResults.length);
  
  // Collect all factors
  const allFactors = [];
  const details = {};
  
  validResults.forEach(result => {
    allFactors.push(...result.factors);
    details[result.source] = result.data;
  });
  
  return {
    score: avgScore,
    factors: allFactors.length > 0 ? allFactors : ['No risk factors detected'],
    sources: validResults.map(r => r.source),
    details: details
  };
}

// Main lookup endpoint
app.post('/api/lookup', async (req, res) => {
  const startTime = Date.now();
  const { identifier, skipCache = false } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Identifier required' });
  }

  const type = detectIdentifierType(identifier);
  if (type === 'unknown') {
    return res.status(400).json({ error: 'Invalid identifier format' });
  }

  // Check cache
  const cacheKey = getCacheKey(type, identifier);
  if (!skipCache) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const result = JSON.parse(cached);
      result.cached = true;
      result.processingTime = Date.now() - startTime;
      console.log(`Cache hit for ${type}: ${identifier}`);
      return res.json(result);
    }
  }

  console.log(`Performing fresh lookup for ${type}: ${identifier}`);

  // Perform lookups based on type
  let results = [];
  
  try {
    if (type === 'ip') {
      results = await Promise.all([
        checkIPAPI(identifier),
        checkAbuseIPDB(identifier)
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
  
  // Determine risk level
  let riskLevel = 'LOW';
  if (aggregated.score >= 75) riskLevel = 'HIGH';
  else if (aggregated.score >= 50) riskLevel = 'MEDIUM';
  
  // Generate recommendation
  let recommendation = { action: 'ALLOW', message: 'Safe to proceed' };
  if (aggregated.score >= 75) {
    recommendation = { action: 'BLOCK', message: 'High risk detected' };
  } else if (aggregated.score >= 50) {
    recommendation = { action: 'REVIEW', message: 'Manual review recommended' };
  }

  const result = {
    identifier,
    type,
    riskScore: aggregated.score,
    riskLevel,
    factors: aggregated.factors,
    recommendation,
    sources: aggregated.sources,
    details: aggregated.details,
    processingTime: Date.now() - startTime,
    cached: false
  };

  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  console.log(`Cached result for ${type}: ${identifier}`);

  res.json(result);
});

// Health check
app.get('/health', async (req, res) => {
  const apis = {
    'ip-api': 'Active (no key required)',
    'abuseipdb': process.env.ABUSEIPDB_API_KEY ? 'Configured' : 'Not configured',
    'emailrep': process.env.EMAILREP_API_KEY ? 'Configured' : 'Not configured',
    'numverify': process.env.NUMVERIFY_API_KEY ? 'Configured' : 'Not configured'
  };
  
  res.json({ 
    status: 'ok',
    service: 'lookup-aggregator',
    version: '2.0.0',
    apis: apis
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Lookup service (v2) running on port ${PORT}`);
  console.log('📊 Configured APIs:');
  console.log(`   • IP-API: ✅ Active`);
  console.log(`   • AbuseIPDB: ${process.env.ABUSEIPDB_API_KEY ? '✅' : '❌'}`);
  console.log(`   • EmailRep: ${process.env.EMAILREP_API_KEY ? '✅' : '❌'}`);
  console.log(`   • Numverify: ${process.env.NUMVERIFY_API_KEY ? '✅' : '❌'}`);
});
