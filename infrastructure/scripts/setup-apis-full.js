#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Helper function for user input
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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupAPIs() {
  log('\n🚀 SOS API Setup Tool', 'bright');
  log('====================\n', 'bright');
  log('This tool will help you set up API keys for fraud detection services.', 'cyan');
  log('You can register for free accounts and get thousands of free lookups per day!\n', 'cyan');
  
  const apiKeys = {};
  
  // Check if .env exists and read existing keys
  let existingEnv = '';
  try {
    existingEnv = await fs.readFile('.env', 'utf8');
    log('✓ Found existing .env file\n', 'green');
  } catch (e) {
    log('! No .env file found (will create one)\n', 'yellow');
  }
  
  log('📋 API Setup Instructions:\n', 'bright');
  
  // IP-API (Free, no key needed)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('✅ IP-API.com (FREE - No Registration Required!)', 'green');
  log('   • 45 requests per minute', 'green');
  log('   • Geolocation, ISP, proxy detection', 'green');
  log('   • Already integrated and working!\n', 'green');
  
  // AbuseIPDB
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('1. AbuseIPDB (IP Reputation)', 'bright');
  log('   Free tier: 1,000 checks per day', 'green');
  log('\n   Setup steps:', 'yellow');
  log('   1. Visit: https://www.abuseipdb.com/register', 'cyan');
  log('   2. Sign up with email or Google', 'cyan');
  log('   3. Verify your email', 'cyan');
  log('   4. Go to: https://www.abuseipdb.com/account/api', 'cyan');
  log('   5. Click "Create Key" button', 'cyan');
  log('   6. Copy the API key\n', 'cyan');
  
  const abuseKey = await prompt('Enter your AbuseIPDB API key (or press Enter to skip): ');
  if (abuseKey.trim()) {
    apiKeys.ABUSEIPDB_API_KEY = abuseKey.trim();
    log('✓ AbuseIPDB key saved\n', 'green');
  } else {
    log('- Skipped AbuseIPDB\n', 'yellow');
  }
  
  // EmailRep
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('2. EmailRep.io (Email Reputation)', 'bright');
  log('   Free tier: 1,000 checks per day', 'green');
  log('\n   Setup steps:', 'yellow');
  log('   1. Visit: https://emailrep.io/signup', 'cyan');
  log('   2. Create account with your email', 'cyan');
  log('   3. Check your email and verify', 'cyan');
  log('   4. Login and go to your profile', 'cyan');
  log('   5. Find your API key in account settings', 'cyan');
  log('   6. Copy the API key\n', 'cyan');
  
  const emailRepKey = await prompt('Enter your EmailRep API key (or press Enter to skip): ');
  if (emailRepKey.trim()) {
    apiKeys.EMAILREP_API_KEY = emailRepKey.trim();
    log('✓ EmailRep key saved\n', 'green');
  } else {
    log('- Skipped EmailRep\n', 'yellow');
  }
  
  // Numverify
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('3. Numverify (Phone Validation)', 'bright');
  log('   Free tier: 100 checks per month', 'green');
  log('\n   Setup steps:', 'yellow');
  log('   1. Visit: https://numverify.com/', 'cyan');
  log('   2. Click "Get Free API Key" button', 'cyan');
  log('   3. Sign up for free account', 'cyan');
  log('   4. Go to dashboard after login', 'cyan');
  log('   5. Copy your API Access Key\n', 'cyan');
  
  const numverifyKey = await prompt('Enter your Numverify API key (or press Enter to skip): ');
  if (numverifyKey.trim()) {
    apiKeys.NUMVERIFY_API_KEY = numverifyKey.trim();
    log('✓ Numverify key saved\n', 'green');
  } else {
    log('- Skipped Numverify\n', 'yellow');
  }
  
  // IPQualityScore (optional)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('4. IPQualityScore [OPTIONAL - More Advanced]', 'bright');
  log('   Free tier: 200 checks per day', 'green');
  log('   Provides: Advanced fraud scoring, VPN/proxy detection', 'green');
  log('\n   Setup steps:', 'yellow');
  log('   1. Visit: https://www.ipqualityscore.com/create-account', 'cyan');
  log('   2. Create free account', 'cyan');
  log('   3. Verify email', 'cyan');
  log('   4. Go to: https://www.ipqualityscore.com/user/settings', 'cyan');
  log('   5. Find API key in account settings\n', 'cyan');
  
  const ipqsKey = await prompt('Enter your IPQualityScore API key (or press Enter to skip): ');
  if (ipqsKey.trim()) {
    apiKeys.IPQUALITYSCORE_API_KEY = ipqsKey.trim();
    log('✓ IPQualityScore key saved\n', 'green');
  } else {
    log('- Skipped IPQualityScore\n', 'yellow');
  }
  
  // Update .env file
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('📝 Updating configuration...', 'yellow');
  
  // Build new env content
  let newEnvContent = existingEnv;
  
  // Add or update each key
  for (const [key, value] of Object.entries(apiKeys)) {
    const keyRegex = new RegExp(`^${key}=.*$`, 'm');
    const keyLine = `${key}=${value}`;
    
    if (keyRegex.test(newEnvContent)) {
      // Update existing key
      newEnvContent = newEnvContent.replace(keyRegex, keyLine);
    } else {
      // Add new key
      if (!newEnvContent.endsWith('\n')) newEnvContent += '\n';
      newEnvContent += `${keyLine}\n`;
    }
  }
  
  // Save .env file
  await fs.writeFile('.env', newEnvContent);
  log('✓ Updated .env file\n', 'green');
  
  // Create .env.master as backup
  const envMasterContent = `# SOS Store Manager API Keys
# Generated on: ${new Date().toISOString()}
# Store this file securely and never commit to version control

# ============================================
# IP LOOKUP SERVICES
# ============================================

# IP-API - Free geolocation (no key required)
IP_API_BASE_URL=http://ip-api.com/json/

# AbuseIPDB - IP reputation (1,000/day free)
ABUSEIPDB_API_KEY=${apiKeys.ABUSEIPDB_API_KEY || '# Not configured'}

# IPQualityScore - Advanced fraud scoring (200/day free)
IPQUALITYSCORE_API_KEY=${apiKeys.IPQUALITYSCORE_API_KEY || '# Not configured'}

# ============================================
# EMAIL VERIFICATION SERVICES
# ============================================

# EmailRep - Email reputation (1,000/day free)
EMAILREP_API_KEY=${apiKeys.EMAILREP_API_KEY || '# Not configured'}

# ============================================
# PHONE VALIDATION SERVICES
# ============================================

# Numverify - Phone validation (100/month free)
NUMVERIFY_API_KEY=${apiKeys.NUMVERIFY_API_KEY || '# Not configured'}

# ============================================
# FUTURE APIS (Add as needed)
# ============================================

# OpenAI - For AI-powered analysis
OPENAI_API_KEY=

# Shopify App Credentials
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=

# ============================================
# SERVICE CONFIGURATION
# ============================================

# Redis for caching
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://sos_user:sos_password@localhost:5432/sos_store_db

# Application
PORT=3001
NODE_ENV=development

# Cache settings
CACHE_TTL_SECONDS=86400  # 24 hours
`;
  
  await fs.writeFile('.env.master', envMasterContent);
  log('✓ Created .env.master backup file\n', 'green');
  
  // Summary
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('\n✨ Setup Summary:', 'bright');
  
  const configuredAPIs = Object.keys(apiKeys).filter(key => apiKeys[key]);
  if (configuredAPIs.length > 0) {
    log(`\n✅ Configured ${configuredAPIs.length} API(s):`, 'green');
    configuredAPIs.forEach(api => {
      log(`   • ${api}`, 'green');
    });
    
    // Calculate total free lookups
    let totalLookups = 45 * 60 * 24; // IP-API: 45/min
    if (apiKeys.ABUSEIPDB_API_KEY) totalLookups += 1000;
    if (apiKeys.EMAILREP_API_KEY) totalLookups += 1000;
    if (apiKeys.IPQUALITYSCORE_API_KEY) totalLookups += 200;
    if (apiKeys.NUMVERIFY_API_KEY) totalLookups += 3; // ~100/month
    
    log(`\n💪 Total free lookups available: ~${totalLookups.toLocaleString()} per day!`, 'cyan');
  } else {
    log('\n⚠️  No APIs configured. You can run this script again anytime to add keys.', 'yellow');
    log('   The app will still work with the free IP-API service!', 'yellow');
  }
  
  log('\n🚀 Next Steps:', 'bright');
  log('   1. Restart your API service to load new keys', 'cyan');
  log('   2. Test lookups in the web UI', 'cyan');
  log('   3. Check the API logs for detailed responses\n', 'cyan');
  
  // Test instructions
  log('📧 Test Commands:', 'bright');
  log('\n   # Test IP lookup:', 'yellow');
  log('   curl -X POST http://localhost:3001/api/lookup \\', 'cyan');
  log('     -H "Content-Type: application/json" \\', 'cyan');
  log('     -d \'{"identifier": "8.8.8.8"}\'', 'cyan');
  
  if (apiKeys.EMAILREP_API_KEY) {
    log('\n   # Test email lookup:', 'yellow');
    log('   curl -X POST http://localhost:3001/api/lookup \\', 'cyan');
    log('     -H "Content-Type: application/json" \\', 'cyan');
    log('     -d \'{"identifier": "test@gmail.com"}\'', 'cyan');
  }
  
  log('\n✅ Setup complete!\n', 'green');
}

// Run the setup
if (require.main === module) {
  setupAPIs().catch(error => {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { setupAPIs };
