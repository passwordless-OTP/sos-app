// Enhanced API Account Setup Automation Script
// Includes additional fraud detection and verification services
// Run with: node setup-apis-enhanced.js

const { chromium } = require('playwright');
const fs = require('fs').promises;
const readline = require('readline');

// Extended configuration for all API services
const API_CONFIGS = {
  // IP Reputation Services
  abuseipdb: {
    name: 'AbuseIPDB',
    category: 'IP Reputation',
    signupUrl: 'https://www.abuseipdb.com/register',
    apiKeyUrl: 'https://www.abuseipdb.com/account/api',
    freeLimit: '1,000/day',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
      apiKeyLocation: '.api-key-value'
    }
  },
  ipqualityscore: {
    name: 'IPQualityScore',
    category: 'IP Reputation',
    signupUrl: 'https://www.ipqualityscore.com/create-account',
    apiKeyUrl: 'https://www.ipqualityscore.com/user/settings',
    freeLimit: '200/day',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      apiKeyLocation: '.api-key-display'
    }
  },
  ipapi: {
    name: 'IP-API',
    category: 'IP Geolocation',
    signupUrl: 'https://ip-api.com',
    apiKeyUrl: 'none',
    freeLimit: '1,000/day',
    note: 'No API key required for free tier'
  },
  ipgeolocation: {
    name: 'IPGeolocation',
    category: 'IP Geolocation',
    signupUrl: 'https://ipgeolocation.io/signup.html',
    apiKeyUrl: 'https://ipgeolocation.io/dashboard',
    freeLimit: '1,000/day',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      apiKeyLocation: '#api-key'
    }
  },
  ipinfo: {
    name: 'IPinfo',
    category: 'IP Intelligence',
    signupUrl: 'https://ipinfo.io/signup',
    apiKeyUrl: 'https://ipinfo.io/account/token',
    freeLimit: '50,000/month',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      apiKeyLocation: '.token-container code'
    }
  },
  
  // Email Verification Services
  emailrep: {
    name: 'EmailRep.io',
    category: 'Email Reputation',
    signupUrl: 'https://emailrep.io/signup',
    apiKeyUrl: 'https://emailrep.io/account',
    freeLimit: '1,000/day',
    selectors: {
      emailField: 'input[type="email"]',
      passwordField: 'input[type="password"]',
      apiKeyLocation: '.api-key'
    }
  },
  abstractapi_email: {
    name: 'AbstractAPI Email',
    category: 'Email Validation',
    signupUrl: 'https://www.abstractapi.com/email-verification-api',
    apiKeyUrl: 'https://app.abstractapi.com/api/email-validation/documentation',
    freeLimit: '100/month',
    selectors: {
      signupButton: 'a[href*="signup"]',
      apiKeyLocation: '.api-key-container'
    }
  },
  zerobounce: {
    name: 'ZeroBounce',
    category: 'Email Validation',
    signupUrl: 'https://www.zerobounce.net/members/register',
    apiKeyUrl: 'https://www.zerobounce.net/members/api',
    freeLimit: '100 credits',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      apiKeyLocation: '.api-key-field'
    }
  },
  mailboxvalidator: {
    name: 'MailboxValidator',
    category: 'Email Validation',
    signupUrl: 'https://www.mailboxvalidator.com/plans#api',
    apiKeyUrl: 'https://www.mailboxvalidator.com/api',
    freeLimit: '300 queries',
    selectors: {
      freePlanButton: '.free-plan-btn',
      apiKeyLocation: '.api-key'
    }
  },
  
  // Phone Validation Services
  numverify: {
    name: 'Numverify',
    category: 'Phone Validation',
    signupUrl: 'https://numverify.com/product',
    apiKeyUrl: 'https://numverify.com/dashboard',
    freeLimit: '100/month',
    selectors: {
      freePlanButton: '.free-plan-select',
      apiKeyLocation: '.api_key'
    }
  },
  abstractapi_phone: {
    name: 'AbstractAPI Phone',
    category: 'Phone Validation',
    signupUrl: 'https://www.abstractapi.com/phone-validation-api',
    apiKeyUrl: 'https://app.abstractapi.com/api/phone-validation/documentation',
    freeLimit: '100/month',
    selectors: {
      signupButton: 'a[href*="signup"]',
      apiKeyLocation: '.api-key-container'
    }
  },
  veriphone: {
    name: 'Veriphone',
    category: 'Phone Intelligence',
    signupUrl: 'https://veriphone.io/signup',
    apiKeyUrl: 'https://veriphone.io/dashboard',
    freeLimit: '1,000/month',
    selectors: {
      emailField: 'input[type="email"]',
      passwordField: 'input[type="password"]',
      apiKeyLocation: '.api-key-display'
    }
  },
  
  // Fraud Detection Services
  siftscience: {
    name: 'Sift Science',
    category: 'Fraud Detection',
    signupUrl: 'https://sift.com/signup',
    apiKeyUrl: 'https://console.sift.com/developers/api-keys',
    freeLimit: 'Trial available',
    selectors: {
      companyField: 'input[name="company"]',
      emailField: 'input[name="email"]',
      apiKeyLocation: '.api-key-value'
    }
  },
  maxmind: {
    name: 'MaxMind',
    category: 'Fraud Scoring',
    signupUrl: 'https://www.maxmind.com/en/geolite2/signup',
    apiKeyUrl: 'https://www.maxmind.com/en/accounts/current/license-key',
    freeLimit: 'GeoLite2 free',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      apiKeyLocation: '.license-key'
    }
  },
  
  // Device Fingerprinting
  fingerprintjs: {
    name: 'FingerprintJS',
    category: 'Device Fingerprinting',
    signupUrl: 'https://dashboard.fingerprint.com/signup',
    apiKeyUrl: 'https://dashboard.fingerprint.com/api-keys',
    freeLimit: '20,000/month',
    selectors: {
      emailField: 'input[type="email"]',
      apiKeyLocation: '.api-key-item'
    }
  },
  
  // Proxy/VPN Detection
  proxycheck: {
    name: 'ProxyCheck',
    category: 'Proxy Detection',
    signupUrl: 'https://proxycheck.io/dashboard/signup',
    apiKeyUrl: 'https://proxycheck.io/dashboard',
    freeLimit: '100/day',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      apiKeyLocation: '.api-key-display'
    }
  },
  vpnapi: {
    name: 'VPNAPI',
    category: 'VPN Detection',
    signupUrl: 'https://vpnapi.io/signup',
    apiKeyUrl: 'https://vpnapi.io/dashboard',
    freeLimit: '1,000/day',
    selectors: {
      emailField: 'input[type="email"]',
      apiKeyLocation: '.api-key'
    }
  }
};

// Collected API keys storage
const apiKeys = {};

// Helper functions
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function waitForManualStep(page, instruction) {
  console.log(`\n⚠️  Manual Step Required:`);
  console.log(`   ${instruction}`);
  console.log(`   Press ENTER when completed...`);
  await prompt('');
}

// Setup individual API with retry logic
async function setupAPI(browser, apiName, config) {
  console.log(`\n🚀 Setting up ${config.name} (${config.category})...`);
  console.log(`   Free Tier: ${config.freeLimit}`);
  
  if (config.note) {
    console.log(`   Note: ${config.note}`);
    return;
  }
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Generate credentials
    const timestamp = Date.now();
    const email = await prompt(`Enter email for ${config.name} (or press ENTER for auto-generated): `);
    const finalEmail = email || `sos.manager+${apiName}${timestamp}@gmail.com`;
    const password = `SOS_${apiName}_${timestamp}!`;
    
    console.log(`📧 Using email: ${finalEmail}`);
    console.log(`🔐 Password saved for your records`);
    
    // Save credentials for user
    await fs.appendFile('api-credentials.txt', 
      `${config.name}:\n  Email: ${finalEmail}\n  Password: ${password}\n\n`
    );
    
    // Navigate to signup page
    console.log(`📄 Opening signup page...`);
    await page.goto(config.signupUrl);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for debugging
    await page.screenshot({ path: `screenshots/${apiName}-signup.png` });
    
    // Handle OAuth options
    const oauthProviders = ['Google', 'GitHub', 'Microsoft'];
    for (const provider of oauthProviders) {
      const oauthButton = await page.$(`button:has-text("Sign in with ${provider}"), button:has-text("Sign up with ${provider}")`);
      if (oauthButton) {
        console.log(`🔐 ${provider} Sign-in detected`);
        const useOAuth = await prompt(`Use ${provider} Sign-in? (y/n): `);
        
        if (useOAuth.toLowerCase() === 'y') {
          await oauthButton.click();
          await waitForManualStep(page, `Complete ${provider} sign-in in the browser window`);
          break;
        }
      }
    }
    
    // Fill regular form if needed
    const formFilled = await fillSignupForm(page, config, finalEmail, password);
    
    if (formFilled) {
      // Submit form
      const submitButton = await page.$(config.selectors.submitButton || 'button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Handle email verification
    await waitForManualStep(page, `Check ${finalEmail} for verification email and complete verification`);
    
    // Navigate to API key page
    console.log(`🔑 Navigating to API key page...`);
    await page.goto(config.apiKeyUrl);
    await page.waitForLoadState('networkidle');
    
    // Extract API key
    let apiKey = await extractAPIKey(page, config);
    
    if (!apiKey) {
      apiKey = await prompt(`Please manually copy and paste the API key from the browser: `);
    }
    
    if (apiKey) {
      apiKeys[apiName] = apiKey;
      console.log(`✅ ${config.name} API key collected successfully!`);
    }
    
  } catch (error) {
    console.error(`❌ Error setting up ${config.name}:`, error.message);
    const retry = await prompt(`Retry ${config.name}? (y/n): `);
    if (retry.toLowerCase() === 'y') {
      await setupAPI(browser, apiName, config);
    } else {
      const manualKey = await prompt(`Enter ${config.name} API key manually (or press ENTER to skip): `);
      if (manualKey) {
        apiKeys[apiName] = manualKey;
      }
    }
  } finally {
    await context.close();
  }
}

async function fillSignupForm(page, config, email, password) {
  try {
    if (config.selectors.emailField) {
      await page.fill(config.selectors.emailField, email);
    }
    if (config.selectors.passwordField) {
      await page.fill(config.selectors.passwordField, password);
    }
    if (config.selectors.companyField) {
      await page.fill(config.selectors.companyField, 'SOS Store Manager');
    }
    return true;
  } catch (error) {
    console.log('Could not auto-fill form, manual input required');
    return false;
  }
}

async function extractAPIKey(page, config) {
  try {
    const keyElement = await page.waitForSelector(config.selectors.apiKeyLocation, { timeout: 10000 });
    let apiKey = await keyElement.textContent();
    apiKey = apiKey.trim();
    
    // Clean up common formatting
    apiKey = apiKey.replace(/^API Key:?\s*/i, '');
    apiKey = apiKey.replace(/\s+/g, '');
    
    return apiKey;
  } catch (error) {
    return null;
  }
}

// Generate comprehensive .env.master file
async function generateEnvFile() {
  const envContent = `# SOS Store Manager API Keys
# Generated on: ${new Date().toISOString()}
# Store this file securely and never commit to version control

# ============================================
# IP REPUTATION & GEOLOCATION SERVICES
# ============================================

# AbuseIPDB - IP Reputation (1,000 req/day free)
ABUSEIPDB_API_KEY=${apiKeys.abuseipdb || ''}

# IPQualityScore - Fraud Scoring (200 req/day free)
IPQUALITYSCORE_API_KEY=${apiKeys.ipqualityscore || ''}

# IPinfo - IP Intelligence (50,000 req/month free)
IPINFO_API_KEY=${apiKeys.ipinfo || ''}

# IPGeolocation - Location Data (1,000 req/day free)
IPGEOLOCATION_API_KEY=${apiKeys.ipgeolocation || ''}

# IP-API - Basic Geolocation (No key required, 1,000 req/day)
IP_API_BASE_URL=http://ip-api.com/json/

# ============================================
# EMAIL VERIFICATION SERVICES
# ============================================

# EmailRep - Email Reputation (1,000 req/day free)
EMAILREP_API_KEY=${apiKeys.emailrep || ''}

# AbstractAPI - Email Validation (100 req/month free)
ABSTRACTAPI_EMAIL_KEY=${apiKeys.abstractapi_email || ''}

# ZeroBounce - Email Verification (100 credits free)
ZEROBOUNCE_API_KEY=${apiKeys.zerobounce || ''}

# MailboxValidator - Email Validation (300 queries free)
MAILBOXVALIDATOR_API_KEY=${apiKeys.mailboxvalidator || ''}

# ============================================
# PHONE VALIDATION SERVICES
# ============================================

# Numverify - Phone Validation (100 req/month free)
NUMVERIFY_API_KEY=${apiKeys.numverify || ''}

# AbstractAPI - Phone Validation (100 req/month free)
ABSTRACTAPI_PHONE_KEY=${apiKeys.abstractapi_phone || ''}

# Veriphone - Phone Intelligence (1,000 req/month free)
VERIPHONE_API_KEY=${apiKeys.veriphone || ''}

# ============================================
# FRAUD DETECTION & RISK SCORING
# ============================================

# Sift Science - ML Fraud Detection (Trial available)
SIFT_API_KEY=${apiKeys.siftscience || ''}

# MaxMind - GeoIP & Fraud Scoring (GeoLite2 free)
MAXMIND_LICENSE_KEY=${apiKeys.maxmind || ''}

# FingerprintJS - Device Fingerprinting (20,000 req/month free)
FINGERPRINTJS_API_KEY=${apiKeys.fingerprintjs || ''}

# ============================================
# PROXY/VPN DETECTION
# ============================================

# ProxyCheck - Proxy Detection (100 req/day free)
PROXYCHECK_API_KEY=${apiKeys.proxycheck || ''}

# VPNAPI - VPN Detection (1,000 req/day free)
VPNAPI_KEY=${apiKeys.vpnapi || ''}

# ============================================
# AI & PROCESSING
# ============================================

# OpenAI - For intelligent analysis
OPENAI_API_KEY=

# ============================================
# SHOPIFY INTEGRATION
# ============================================

# Shopify App Credentials
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_WEBHOOK_SECRET=

# ============================================
# RATE LIMITS & CONFIGURATION
# ============================================

# Daily rate limits for each service
RATE_LIMITS={
  "abuseipdb": 1000,
  "ipqualityscore": 200,
  "ipinfo": 1666,
  "ipgeolocation": 1000,
  "ipapi": 1000,
  "emailrep": 1000,
  "abstractapi_email": 3,
  "zerobounce": 100,
  "mailboxvalidator": 300,
  "numverify": 3,
  "abstractapi_phone": 3,
  "veriphone": 33,
  "fingerprintjs": 666,
  "proxycheck": 100,
  "vpnapi": 1000
}

# ============================================
# CACHING & PERFORMANCE
# ============================================

# Redis Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=86400  # 24 hours
CACHE_NEGATIVE_TTL=3600  # 1 hour for negative results

# ============================================
# APPLICATION SETTINGS
# ============================================

# Environment
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Security
ENCRYPTION_KEY=
JWT_SECRET=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sos_store_manager
`;

  await fs.writeFile('.env.master', envContent);
  console.log('\n✅ .env.master file created successfully!');
}

// Category-based setup menu
async function selectAPIsByCategory() {
  const categories = [...new Set(Object.values(API_CONFIGS).map(c => c.category))];
  
  console.log('\n📋 Available API Categories:');
  categories.forEach((cat, idx) => {
    const apis = Object.entries(API_CONFIGS).filter(([_, config]) => config.category === cat);
    console.log(`${idx + 1}. ${cat} (${apis.length} services)`);
  });
  
  const selection = await prompt('\nEnter category numbers to setup (comma-separated) or "all": ');
  
  if (selection.toLowerCase() === 'all') {
    return Object.keys(API_CONFIGS);
  }
  
  const selectedCategories = selection.split(',').map(s => {
    const idx = parseInt(s.trim()) - 1;
    return categories[idx];
  }).filter(Boolean);
  
  return Object.entries(API_CONFIGS)
    .filter(([_, config]) => selectedCategories.includes(config.category))
    .map(([name, _]) => name);
}

// Main setup flow
async function main() {
  console.log('🛠️  SOS Store Manager - Enhanced API Setup Tool');
  console.log('==============================================\n');
  
  console.log('This tool will help you create accounts for 17+ fraud detection APIs.');
  console.log('Total potential free requests per day: ~10,000+\n');
  
  // Create screenshots directory
  try {
    await fs.mkdir('screenshots', { recursive: true });
  } catch (e) {}
  
  const selectedAPIs = await selectAPIsByCategory();
  
  console.log(`\n📌 Selected ${selectedAPIs.length} APIs for setup`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--start-maximized']
  });
  
  try {
    // Setup each selected API
    for (const apiName of selectedAPIs) {
      const config = API_CONFIGS[apiName];
      await setupAPI(browser, apiName, config);
      
      // Progress update
      const completed = Object.keys(apiKeys).length;
      console.log(`\n📊 Progress: ${completed}/${selectedAPIs.length} APIs configured`);
    }
    
    // Generate .env file
    await generateEnvFile();
    
    // Display summary
    console.log('\n📊 Setup Summary:');
    console.log('================');
    
    const categories = [...new Set(Object.values(API_CONFIGS).map(c => c.category))];
    categories.forEach(category => {
      console.log(`\n${category}:`);
      Object.entries(API_CONFIGS)
        .filter(([_, config]) => config.category === category)
        .forEach(([api, config]) => {
          const status = apiKeys[api] ? '✅' : '❌';
          console.log(`  ${status} ${config.name}`);
        });
    });
    
    // Calculate total free requests
    const totalDailyRequests = Object.entries(API_CONFIGS)
      .filter(([api, _]) => apiKeys[api])
      .reduce((total, [_, config]) => {
        const limit = config.freeLimit.match(/(\d+)/);
        return total + (limit ? parseInt(limit[1]) : 0);
      }, 0);
    
    console.log(`\n💪 Total free requests available: ~${totalDailyRequests.toLocaleString()}/day`);
    
  } finally {
    await browser.close();
  }
}

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { API_CONFIGS, apiKeys };