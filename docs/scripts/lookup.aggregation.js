// lookup-aggregator.js
// Intelligent multi-source lookup aggregation with risk scoring

const axios = require('axios');
const Redis = require('ioredis');
const { RateLimiter } = require('limiter');
const crypto = require('crypto');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// API Clients Configuration
const API_CLIENTS = {
  // IP Reputation Services
  abuseipdb: {
    baseURL: 'https://api.abuseipdb.com/api/v2',
    headers: { 'Key': process.env.ABUSEIPDB_API_KEY },
    rateLimit: new RateLimiter({ tokensPerInterval: 1000, interval: 'day' }),
    weight: 0.25
  },
  ipqualityscore: {
    baseURL: 'https://ipqualityscore.com/api/json/ip',
    key: process.env.IPQUALITYSCORE_API_KEY,
    rateLimit: new RateLimiter({ tokensPerInterval: 200, interval: 'day' }),
    weight: 0.3
  },
  ipinfo: {
    baseURL: 'https://ipinfo.io',
    headers: { 'Authorization': `Bearer ${process.env.IPINFO_API_KEY}` },
    rateLimit: new RateLimiter({ tokensPerInterval: 50000, interval: 'month' }),
    weight: 0.2
  },
  proxycheck: {
    baseURL: 'https://proxycheck.io/v2',
    key: process.env.PROXYCHECK_API_KEY,
    rateLimit: new RateLimiter({ tokensPerInterval: 100, interval: 'day' }),
    weight: 0.25
  },

  // Email Services
  emailrep: {
    baseURL: 'https://emailrep.io',
    headers: { 'Key': process.env.EMAILREP_API_KEY },
    rateLimit: new RateLimiter({ tokensPerInterval: 1000, interval: 'day' }),
    weight: 0.35
  },
  zerobounce: {
    baseURL: 'https://api.zerobounce.net/v2',
    key: process.env.ZEROBOUNCE_API_KEY,
    rateLimit: new RateLimiter({ tokensPerInterval: 100, interval: 'month' }),
    weight: 0.3
  },
  abstractapi_email: {
    baseURL: 'https://emailvalidation.abstractapi.com/v1',
    key: process.env.ABSTRACTAPI_EMAIL_KEY,
    rateLimit: new RateLimiter({ tokensPerInterval: 100, interval: 'month' }),
    weight: 0.35
  },

  // Phone Services
  numverify: {
    baseURL: 'http://apilayer.net/api/validate',
    key: process.env.NUMVERIFY_API_KEY,
    rateLimit: new RateLimiter({ tokensPerInterval: 100, interval: 'month' }),
    weight: 0.4
  },
  abstractapi_phone: {
    baseURL: 'https://phonevalidation.abstractapi.com/v1',
    key: process.env.ABSTRACTAPI_PHONE_KEY,
    rateLimit: new RateLimiter({ tokensPerInterval: 100, interval: 'month' }),
    weight: 0.3
  },
  veriphone: {
    baseURL: 'https://api.veriphone.io/v2/verify',
    headers: { 'Authorization': `Bearer ${process.env.VERIPHONE_API_KEY}` },
    rateLimit: new RateLimiter({ tokensPerInterval: 1000, interval: 'month' }),
    weight: 0.3
  }
};

// Risk scoring thresholds
const RISK_THRESHOLDS = {
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25
};

// Main lookup aggregator class
class LookupAggregator {
  constructor() {
    this.cache = redis;
    this.cacheTTL = parseInt(process.env.CACHE_TTL_SECONDS) || 86400; // 24 hours
  }

  // Generate cache key
  getCacheKey(type, identifier) {
    return `lookup:${type}:${crypto.createHash('md5').update(identifier).digest('hex')}`;
  }

  // Main lookup method
  async lookup(identifier, options = {}) {
    const startTime = Date.now();
    const type = this.detectIdentifierType(identifier);
    
    // Check cache first
    const cacheKey = this.getCacheKey(type, identifier);
    const cached = await this.cache.get(cacheKey);
    if (cached && !options.skipCache) {
      const result = JSON.parse(cached);
      result.cached = true;
      return result;
    }

    // Perform fresh lookup
    let result;
    switch (type) {
      case 'ip':
        result = await this.lookupIP(identifier);
        break;
      case 'email':
        result = await this.lookupEmail(identifier);
        break;
      case 'phone':
        result = await this.lookupPhone(identifier);
        break;
      default:
        throw new Error(`Unknown identifier type: ${type}`);
    }

    // Add metadata
    result.identifier = identifier;
    result.type = type;
    result.timestamp = new Date().toISOString();
    result.processingTime = Date.now() - startTime;

    // Cache the result
    await this.cache.setex(cacheKey, this.cacheTTL, JSON.stringify(result));

    return result;
  }

  // Detect identifier type
  detectIdentifierType(identifier) {
    // IP Address (IPv4 or IPv6)
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(identifier) || 
        /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i.test(identifier)) {
      return 'ip';
    }
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      return 'email';
    }
    
    // Phone (basic international format)
    if (/^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''))) {
      return 'phone';
    }
    
    return 'unknown';
  }

  // IP Address Lookup
  async lookupIP(ip) {
    const services = ['abuseipdb', 'ipqualityscore', 'ipinfo', 'proxycheck'];
    const results = await this.queryMultipleServices(services, async (service) => {
      switch (service) {
        case 'abuseipdb':
          return this.queryAbuseIPDB(ip);
        case 'ipqualityscore':
          return this.queryIPQualityScore(ip);
        case 'ipinfo':
          return this.queryIPInfo(ip);
        case 'proxycheck':
          return this.queryProxyCheck(ip);
      }
    });

    return this.aggregateIPResults(results);
  }

  // Email Lookup
  async lookupEmail(email) {
    const services = ['emailrep', 'zerobounce', 'abstractapi_email'];
    const results = await this.queryMultipleServices(services, async (service) => {
      switch (service) {
        case 'emailrep':
          return this.queryEmailRep(email);
        case 'zerobounce':
          return this.queryZeroBounce(email);
        case 'abstractapi_email':
          return this.queryAbstractAPIEmail(email);
      }
    });

    return this.aggregateEmailResults(results);
  }

  // Phone Lookup
  async lookupPhone(phone) {
    const services = ['numverify', 'abstractapi_phone', 'veriphone'];
    const results = await this.queryMultipleServices(services, async (service) => {
      switch (service) {
        case 'numverify':
          return this.queryNumverify(phone);
        case 'abstractapi_phone':
          return this.queryAbstractAPIPhone(phone);
        case 'veriphone':
          return this.queryVeriphone(phone);
      }
    });

    return this.aggregatePhoneResults(results);
  }

  // Query multiple services with rate limiting and error handling
  async queryMultipleServices(services, queryFunction) {
    const results = {};
    const promises = services.map(async (service) => {
      try {
        const client = API_CLIENTS[service];
        
        // Check rate limit
        if (client.rateLimit) {
          const canProceed = await client.rateLimit.tryRemoveTokens(1);
          if (!canProceed) {
            console.log(`Rate limit reached for ${service}`);
            return { service, error: 'Rate limit exceeded' };
          }
        }

        const result = await queryFunction(service);
        results[service] = { success: true, data: result };
      } catch (error) {
        console.error(`Error querying ${service}:`, error.message);
        results[service] = { success: false, error: error.message };
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Individual API query methods
  async queryAbuseIPDB(ip) {
    const response = await axios.get(`${API_CLIENTS.abuseipdb.baseURL}/check`, {
      headers: API_CLIENTS.abuseipdb.headers,
      params: {
        ipAddress: ip,
        maxAgeInDays: 90,
        verbose: true
      }
    });
    return response.data.data;
  }

  async queryIPQualityScore(ip) {
    const response = await axios.get(
      `${API_CLIENTS.ipqualityscore.baseURL}/${API_CLIENTS.ipqualityscore.key}/${ip}`,
      { params: { strictness: 1 } }
    );
    return response.data;
  }

  async queryIPInfo(ip) {
    const response = await axios.get(`${API_CLIENTS.ipinfo.baseURL}/${ip}/json`, {
      headers: API_CLIENTS.ipinfo.headers
    });
    return response.data;
  }

  async queryProxyCheck(ip) {
    const response = await axios.get(`${API_CLIENTS.proxycheck.baseURL}/${ip}`, {
      params: {
        key: API_CLIENTS.proxycheck.key,
        vpn: 1,
        asn: 1
      }
    });
    return response.data[ip];
  }

  async queryEmailRep(email) {
    const response = await axios.get(`${API_CLIENTS.emailrep.baseURL}/${email}`, {
      headers: API_CLIENTS.emailrep.headers
    });
    return response.data;
  }

  async queryZeroBounce(email) {
    const response = await axios.get(`${API_CLIENTS.zerobounce.baseURL}/validate`, {
      params: {
        api_key: API_CLIENTS.zerobounce.key,
        email: email
      }
    });
    return response.data;
  }

  async queryAbstractAPIEmail(email) {
    const response = await axios.get(API_CLIENTS.abstractapi_email.baseURL, {
      params: {
        api_key: API_CLIENTS.abstractapi_email.key,
        email: email
      }
    });
    return response.data;
  }

  async queryNumverify(phone) {
    const response = await axios.get(API_CLIENTS.numverify.baseURL, {
      params: {
        access_key: API_CLIENTS.numverify.key,
        number: phone,
        format: 1
      }
    });
    return response.data;
  }

  async queryAbstractAPIPhone(phone) {
    const response = await axios.get(API_CLIENTS.abstractapi_phone.baseURL, {
      params: {
        api_key: API_CLIENTS.abstractapi_phone.key,
        phone: phone
      }
    });
    return response.data;
  }

  async queryVeriphone(phone) {
    const response = await axios.post(API_CLIENTS.veriphone.baseURL, 
      { phone: phone },
      { headers: API_CLIENTS.veriphone.headers }
    );
    return response.data;
  }

  // Aggregate IP results with weighted scoring
  aggregateIPResults(results) {
    let totalScore = 0;
    let totalWeight = 0;
    const factors = [];
    const details = {};

    // AbuseIPDB
    if (results.abuseipdb?.success) {
      const data = results.abuseipdb.data;
      const score = data.abuseConfidenceScore || 0;
      totalScore += score * API_CLIENTS.abuseipdb.weight;
      totalWeight += API_CLIENTS.abuseipdb.weight;
      
      if (score > 50) factors.push(`High abuse score (${score}%)`);
      if (data.usageType === 'Commercial') factors.push('Commercial IP');
      if (data.totalReports > 10) factors.push(`Reported ${data.totalReports} times`);
      
      details.abuseipdb = {
        score,
        reports: data.totalReports,
        lastReported: data.lastReportedAt
      };
    }

    // IPQualityScore
    if (results.ipqualityscore?.success) {
      const data = results.ipqualityscore.data;
      const score = data.fraud_score || 0;
      totalScore += score * API_CLIENTS.ipqualityscore.weight;
      totalWeight += API_CLIENTS.ipqualityscore.weight;
      
      if (data.proxy) factors.push('Proxy detected');
      if (data.vpn) factors.push('VPN detected');
      if (data.tor) factors.push('TOR exit node');
      if (data.recent_abuse) factors.push('Recent abuse detected');
      
      details.ipqualityscore = {
        score,
        proxy: data.proxy,
        vpn: data.vpn,
        tor: data.tor
      };
    }

    // Calculate final risk score
    const riskScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const riskLevel = this.getRiskLevel(riskScore);

    return {
      riskScore,
      riskLevel,
      factors,
      details,
      sources: Object.keys(results).filter(s => results[s].success),
      errors: Object.keys(results).filter(s => !results[s].success),
      recommendation: this.getRecommendation(riskScore, factors)
    };
  }

  // Aggregate Email results
  aggregateEmailResults(results) {
    let totalScore = 0;
    let totalWeight = 0;
    const factors = [];
    const details = {};

    // EmailRep
    if (results.emailrep?.success) {
      const data = results.emailrep.data;
      const score = 100 - (data.reputation || 0); // Convert reputation to risk
      totalScore += score * API_CLIENTS.emailrep.weight;
      totalWeight += API_CLIENTS.emailrep.weight;
      
      if (data.suspicious) factors.push('Marked as suspicious');
      if (data.credentials_leaked) factors.push('Credentials leaked');
      if (data.data_breach) factors.push('Found in data breach');
      if (data.malicious_activity) factors.push('Malicious activity detected');
      if (data.days_since_domain_creation < 30) factors.push('New domain (< 30 days)');
      
      details.emailrep = {
        reputation: data.reputation,
        suspicious: data.suspicious,
        breached: data.data_breach
      };
    }

    // ZeroBounce
    if (results.zerobounce?.success) {
      const data = results.zerobounce.data;
      let score = 0;
      
      if (data.status === 'invalid') score = 100;
      else if (data.status === 'catch-all') score = 60;
      else if (data.status === 'spamtrap') score = 90;
      else if (data.status === 'abuse') score = 80;
      else if (data.status === 'do_not_mail') score = 70;
      
      totalScore += score * API_CLIENTS.zerobounce.weight;
      totalWeight += API_CLIENTS.zerobounce.weight;
      
      if (data.free_email) factors.push('Free email provider');
      if (data.disposable) factors.push('Disposable email');
      
      details.zerobounce = {
        status: data.status,
        subStatus: data.sub_status,
        freeEmail: data.free_email
      };
    }

    const riskScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const riskLevel = this.getRiskLevel(riskScore);

    return {
      riskScore,
      riskLevel,
      factors,
      details,
      sources: Object.keys(results).filter(s => results[s].success),
      errors: Object.keys(results).filter(s => !results[s].success),
      recommendation: this.getRecommendation(riskScore, factors)
    };
  }

  // Aggregate Phone results
  aggregatePhoneResults(results) {
    let totalScore = 0;
    let totalWeight = 0;
    const factors = [];
    const details = {};

    // Numverify
    if (results.numverify?.success) {
      const data = results.numverify.data;
      let score = 0;
      
      if (!data.valid) score = 100;
      else if (data.line_type === 'voip') score = 40;
      else if (data.line_type === 'mobile') score = 10;
      
      totalScore += score * API_CLIENTS.numverify.weight;
      totalWeight += API_CLIENTS.numverify.weight;
      
      if (!data.valid) factors.push('Invalid phone number');
      if (data.line_type === 'voip') factors.push('VOIP number');
      
      details.numverify = {
        valid: data.valid,
        lineType: data.line_type,
        carrier: data.carrier
      };
    }

    const riskScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const riskLevel = this.getRiskLevel(riskScore);

    return {
      riskScore,
      riskLevel,
      factors,
      details,
      sources: Object.keys(results).filter(s => results[s].success),
      errors: Object.keys(results).filter(s => !results[s].success),
      recommendation: this.getRecommendation(riskScore, factors)
    };
  }

  // Get risk level from score
  getRiskLevel(score) {
    if (score >= RISK_THRESHOLDS.HIGH) return 'HIGH';
    if (score >= RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
    if (score >= RISK_THRESHOLDS.LOW) return 'LOW';
    return 'MINIMAL';
  }

  // Get recommendation based on risk
  getRecommendation(score, factors) {
    if (score >= RISK_THRESHOLDS.HIGH) {
      return {
        action: 'BLOCK',
        message: 'High risk detected. Recommend blocking this transaction.',
        requiresReview: true
      };
    } else if (score >= RISK_THRESHOLDS.MEDIUM) {
      return {
        action: 'REVIEW',
        message: 'Medium risk detected. Manual review recommended.',
        requiresReview: true
      };
    } else if (score >= RISK_THRESHOLDS.LOW) {
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

  // Batch lookup for multiple identifiers
  async batchLookup(identifiers, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 10;
    
    // Process in batches to avoid overwhelming APIs
    for (let i = 0; i < identifiers.length; i += batchSize) {
      const batch = identifiers.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(identifier => this.lookup(identifier, options))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  // Get current API usage stats
  async getUsageStats() {
    const stats = {};
    
    for (const [service, client] of Object.entries(API_CLIENTS)) {
      if (client.rateLimit) {
        stats[service] = {
          tokensRemaining: client.rateLimit.getTokensRemaining(),
          resetTime: new Date(client.rateLimit.interval).toISOString()
        };
      }
    }
    
    return stats;
  }
}

// Export singleton instance
module.exports = new LookupAggregator();

// Example usage:
/*
const aggregator = require('./lookup-aggregator');

// Single lookup
const result = await aggregator.lookup('suspicious@example.com');
console.log(result);

// Batch lookup
const results = await aggregator.batchLookup([
  '192.168.1.1',
  'test@example.com',
  '+1234567890'
]);

// Get API usage
const usage = await aggregator.getUsageStats();
console.log(usage);
*/