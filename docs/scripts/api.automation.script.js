// API Account Setup Automation Script
// Uses Playwright for browser automation
// Run with: node setup-apis.js

const { chromium } = require('playwright');
const fs = require('fs').promises;
const readline = require('readline');

// Configuration for each API service
const API_CONFIGS = {
  abuseipdb: {
    name: 'AbuseIPDB',
    signupUrl: 'https://www.abuseipdb.com/register',
    apiKeyUrl: 'https://www.abuseipdb.com/account/api',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
      apiKeyLocation: '.api-key-value'
    }
  },
  ipqualityscore: {
    name: 'IPQualityScore',
    signupUrl: 'https://www.ipqualityscore.com/create-account',
    apiKeyUrl: 'https://www.ipqualityscore.com/user/settings',
    selectors: {
      emailField: 'input[name="email"]',
      passwordField: 'input[name="password"]',
      apiKeyLocation: '.api-key-display'
    }
  },
  emailrep: {
    name: 'EmailRep.io',
    signupUrl: 'https://emailrep.io/signup',
    apiKeyUrl: 'https://emailrep.io/account',
    selectors: {
      emailField: 'input[type="email"]',
      passwordField: 'input[type="password"]',
      apiKeyLocation: '.api-key'
    }
  },
  numverify: {
    name: 'Numverify',
    signupUrl: 'https://numverify.com/product',
    apiKeyUrl: 'https://numverify.com/dashboard',
    selectors: {
      freePlanButton: '.free-plan-select',
      apiKeyLocation: '.api_key'
    }
  }
};

// Collected API keys
const apiKeys = {};

// Helper function to prompt user input
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

// Helper function to wait and handle manual steps
async function waitForManualStep(page, instruction) {
  console.log(`\n⚠️  Manual Step Required:`);
  console.log(`   ${instruction}`);
  console.log(`   Press ENTER when completed...`);
  await prompt('');
}

// Setup individual API
async function setupAPI(browser, apiName, config) {
  console.log(`\n🚀 Setting up ${config.name}...`);
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Generate credentials
    const email = await prompt(`Enter email for ${config.name} (or press ENTER for auto-generated): `);
    const finalEmail = email || `sos.manager+${apiName}@gmail.com`;
    const password = 'SOS_Manager_2024!';
    
    console.log(`📧 Using email: ${finalEmail}`);
    
    // Navigate to signup page
    console.log(`📄 Opening signup page...`);
    await page.goto(config.signupUrl);
    await page.waitForLoadState('networkidle');
    
    // Handle Google Sign-in if available
    const googleButton = await page.$('button:has-text("Sign in with Google"), button:has-text("Sign up with Google")');
    if (googleButton) {
      console.log(`🔐 Google Sign-in detected`);
      const useGoogle = await prompt('Use Google Sign-in? (y/n): ');
      
      if (useGoogle.toLowerCase() === 'y') {
        await googleButton.click();
        await waitForManualStep(page, 'Complete Google sign-in in the browser window');
      }
    }
    
    // If not using Google, fill regular form
    if (!googleButton || useGoogle?.toLowerCase() !== 'y') {
      // Fill signup form
      if (config.selectors.emailField) {
        await page.fill(config.selectors.emailField, finalEmail);
      }
      if (config.selectors.passwordField) {
        await page.fill(config.selectors.passwordField, password);
      }
      
      // Submit form
      if (config.selectors.submitButton) {
        await page.click(config.selectors.submitButton);
      }
    }
    
    // Wait for email verification
    await waitForManualStep(page, `Check ${finalEmail} for verification email and complete verification`);
    
    // Navigate to API key page
    console.log(`🔑 Navigating to API key page...`);
    await page.goto(config.apiKeyUrl);
    await page.waitForLoadState('networkidle');
    
    // Try to extract API key
    let apiKey = null;
    try {
      const keyElement = await page.waitForSelector(config.selectors.apiKeyLocation, { timeout: 10000 });
      apiKey = await keyElement.textContent();
      apiKey = apiKey.trim();
    } catch (e) {
      console.log(`⚠️  Could not automatically extract API key`);
      apiKey = await prompt(`Please manually copy and paste the API key from the browser: `);
    }
    
    if (apiKey) {
      apiKeys[apiName] = apiKey;
      console.log(`✅ ${config.name} API key collected successfully!`);
    }
    
  } catch (error) {
    console.error(`❌ Error setting up ${config.name}:`, error.message);
    const manualKey = await prompt(`Enter ${config.name} API key manually (or press ENTER to skip): `);
    if (manualKey) {
      apiKeys[apiName] = manualKey;
    }
  } finally {
    await context.close();
  }
}

// Generate .env.master file
async function generateEnvFile() {
  const envContent = `# SOS Store Manager API Keys
# Generated on: ${new Date().toISOString()}
# Store this file securely and never commit to version control

# IP Lookup Services
ABUSEIPDB_API_KEY=${apiKeys.abuseipdb || ''}
IPQUALITYSCORE_API_KEY=${apiKeys.ipqualityscore || ''}

# Email Verification Services  
EMAILREP_API_KEY=${apiKeys.emailrep || ''}

# Phone Validation Services
NUMVERIFY_API_KEY=${apiKeys.numverify || ''}

# OpenAI for Intelligence Layer (add manually)
OPENAI_API_KEY=

# Shopify App Credentials (add after creating partner account)
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=

# Free API Services (No key required)
IP_API_BASE_URL=http://ip-api.com/json/
GEOJS_BASE_URL=https://get.geojs.io/v1/ip/geo/

# Rate Limits Configuration
ABUSEIPDB_RATE_LIMIT=1000
IPQUALITYSCORE_RATE_LIMIT=200
EMAILREP_RATE_LIMIT=1000
NUMVERIFY_RATE_LIMIT=3

# Cache Settings
CACHE_TTL_SECONDS=86400  # 24 hours
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
`;

  await fs.writeFile('.env.master', envContent);
  console.log('\n✅ .env.master file created successfully!');
}

// Main setup flow
async function main() {
  console.log('🛠️  SOS Store Manager - API Account Setup Tool');
  console.log('===========================================\n');
  
  console.log('This tool will help you create accounts and collect API keys.');
  console.log('You may need to manually verify emails and complete CAPTCHAs.\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser for manual steps
    slowMo: 100      // Slow down for visibility
  });
  
  try {
    // Setup each API
    for (const [apiName, config] of Object.entries(API_CONFIGS)) {
      const setup = await prompt(`\nSetup ${config.name}? (y/n/skip all): `);
      
      if (setup.toLowerCase() === 'skip all') {
        break;
      }
      
      if (setup.toLowerCase() === 'y') {
        await setupAPI(browser, apiName, config);
      }
    }
    
    // Generate .env file
    await generateEnvFile();
    
    // Display summary
    console.log('\n📊 Setup Summary:');
    console.log('================');
    for (const [api, key] of Object.entries(apiKeys)) {
      console.log(`${API_CONFIGS[api].name}: ${key ? '✅ Configured' : '❌ Skipped'}`);
    }
    
  } finally {
    await browser.close();
  }
}

// Run the setup
main().catch(console.error);

// Instructions for running this script:
console.log(`
To run this automation:

1. Install Node.js and npm
2. Create a new directory and save this as 'setup-apis.js'
3. Run:
   npm init -y
   npm install playwright
   node setup-apis.js

The script will:
- Open browser windows for each API signup
- Pre-fill forms where possible  
- Pause for manual steps (email verification, CAPTCHAs)
- Collect API keys automatically or via manual input
- Generate .env.master with all keys
`);