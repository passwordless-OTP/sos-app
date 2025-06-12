#!/usr/bin/env node

/**
 * SOS API Setup - Browser Automation
 * This script uses Playwright to automate API key collection
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const readline = require('readline');
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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

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

// Wait for manual steps
async function waitForManualStep(page, instruction) {
  log(`\n⚠️  Manual Step Required:`, 'yellow');
  log(`   ${instruction}`, 'cyan');
  log(`   Press ENTER when completed...`, 'yellow');
  await prompt('');
}

// API Configurations
const API_CONFIGS = {
  abuseipdb: {
    name: 'AbuseIPDB',
    signupUrl: 'https://www.abuseipdb.com/register',
    apiKeyUrl: 'https://www.abuseipdb.com/account/api',
    freeLimit: '1,000 requests/day',
    steps: async (page, browser) => {
      log('\n🔍 Setting up AbuseIPDB...', 'bright');
      
      // Go to signup page
      log('Opening signup page...', 'cyan');
      await page.goto('https://www.abuseipdb.com/register');
      await page.waitForLoadState('networkidle');
      
      // Check for Google Sign-in
      const googleButton = await page.$('a:has-text("Sign in with Google")');
      if (googleButton) {
        log('Google Sign-in available!', 'green');
        const useGoogle = await prompt('Use Google Sign-in? (y/n): ');
        
        if (useGoogle.toLowerCase() === 'y') {
          await googleButton.click();
          await waitForManualStep(page, 'Complete Google sign-in in the browser');
        } else {
          await waitForManualStep(page, 'Fill in the registration form and submit');
        }
      } else {
        await waitForManualStep(page, 'Fill in the registration form and submit');
      }
      
      // Wait for email verification
      await waitForManualStep(page, 'Check your email and verify your account');
      
      // Go to API key page
      log('Navigating to API key page...', 'cyan');
      await page.goto('https://www.abuseipdb.com/account/api');
      await page.waitForLoadState('networkidle');
      
      // Try to create a new key
      const createKeyButton = await page.$('button:has-text("Create Key"), a:has-text("Create Key")');
      if (createKeyButton) {
        log('Creating new API key...', 'cyan');
        await createKeyButton.click();
        await page.waitForTimeout(2000);
      }
      
      // Look for API key
      let apiKey = null;
      const keyElements = await page.$$('.api-key, code, pre, .key-value, input[readonly]');
      
      for (const element of keyElements) {
        const text = await element.textContent();
        if (text && text.length > 20 && text.length < 100) {
          apiKey = text.trim();
          break;
        }
      }
      
      if (!apiKey) {
        apiKey = await prompt('Please copy and paste the API key from the browser: ');
      }
      
      return apiKey;
    }
  },
  
  emailrep: {
    name: 'EmailRep.io',
    signupUrl: 'https://emailrep.io/signup',
    apiKeyUrl: 'https://emailrep.io/account',
    freeLimit: '1,000 requests/day',
    steps: async (page, browser) => {
      log('\n📧 Setting up EmailRep.io...', 'bright');
      
      // Go to signup page
      log('Opening signup page...', 'cyan');
      await page.goto('https://emailrep.io/signup');
      await page.waitForLoadState('networkidle');
      
      await waitForManualStep(page, 'Create an account (fill form and submit)');
      await waitForManualStep(page, 'Check your email and verify your account');
      
      // Go to account page
      log('Navigating to account page...', 'cyan');
      await page.goto('https://emailrep.io/account');
      await page.waitForLoadState('networkidle');
      
      // Look for API key
      let apiKey = null;
      const keyElements = await page.$$('.api-key, code, pre, .token, input[readonly]');
      
      for (const element of keyElements) {
        const text = await element.textContent();
        if (text && text.length > 20 && text.length < 100) {
          apiKey = text.trim();
          break;
        }
      }
      
      if (!apiKey) {
        apiKey = await prompt('Please copy and paste the API key from the browser: ');
      }
      
      return apiKey;
    }
  },
  
  numverify: {
    name: 'Numverify',
    signupUrl: 'https://numverify.com/product',
    apiKeyUrl: 'https://numverify.com/dashboard',
    freeLimit: '100 requests/month',
    steps: async (page, browser) => {
      log('\n☎️  Setting up Numverify...', 'bright');
      
      // Go to product page
      log('Opening signup page...', 'cyan');
      await page.goto('https://numverify.com/product');
      await page.waitForLoadState('networkidle');
      
      // Click free plan
      const freePlanButton = await page.$('a:has-text("Get Free API Key")');
      if (freePlanButton) {
        await freePlanButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      await waitForManualStep(page, 'Create account and select free plan');
      
      // Go to dashboard
      log('Navigating to dashboard...', 'cyan');
      await page.goto('https://numverify.com/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Look for API key
      let apiKey = null;
      const keyElements = await page.$$('.api_key, code, pre, input[readonly]');
      
      for (const element of keyElements) {
        const text = await element.textContent();
        if (text && text.length > 20 && text.length < 100) {
          apiKey = text.trim();
          break;
        }
      }
      
      if (!apiKey) {
        apiKey = await prompt('Please copy and paste the API key from the browser: ');
      }
      
      return apiKey;
    }
  },
  
  ipqualityscore: {
    name: 'IPQualityScore',
    signupUrl: 'https://www.ipqualityscore.com/create-account',
    apiKeyUrl: 'https://www.ipqualityscore.com/user/settings',
    freeLimit: '200 requests/day',
    steps: async (page, browser) => {
      log('\n🛡️  Setting up IPQualityScore...', 'bright');
      
      // Go to signup page
      log('Opening signup page...', 'cyan');
      await page.goto('https://www.ipqualityscore.com/create-account');
      await page.waitForLoadState('networkidle');
      
      await waitForManualStep(page, 'Create account (fill form and submit)');
      await waitForManualStep(page, 'Check your email and verify your account');
      
      // Go to settings page
      log('Navigating to settings page...', 'cyan');
      await page.goto('https://www.ipqualityscore.com/user/settings');
      await page.waitForLoadState('networkidle');
      
      // Look for API key
      let apiKey = null;
      const keyElements = await page.$$('.api-key, code, pre, input[readonly], .private_key');
      
      for (const element of keyElements) {
        const text = await element.textContent();
        if (text && text.length > 20 && text.length < 100) {
          apiKey = text.trim();
          break;
        }
      }
      
      if (!apiKey) {
        apiKey = await prompt('Please copy and paste the API key from the browser: ');
      }
      
      return apiKey;
    }
  }
};

// Main automation function
async function automateAPISetup() {
  log('\n🤖 SOS API Setup - Browser Automation', 'bright');
  log('=====================================\n', 'bright');
  
  log('This tool will:', 'cyan');
  log('  • Open browser windows for each API service', 'cyan');
  log('  • Guide you through the signup process', 'cyan');
  log('  • Help extract API keys automatically', 'cyan');
  log('  • Save everything to your .env file\n', 'cyan');
  
  const startNow = await prompt('Ready to start? (y/n): ');
  if (startNow.toLowerCase() !== 'y') {
    log('Setup cancelled.', 'yellow');
    return;
  }
  
  // Check if Playwright browsers are installed
  try {
    await chromium.launch({ headless: true }).then(b => b.close());
  } catch (error) {
    log('\n⚠️  Playwright browsers not installed!', 'yellow');
    log('Installing browsers (this may take a minute)...', 'cyan');
    const { execSync } = require('child_process');
    execSync('npx playwright install chromium', { stdio: 'inherit' });
  }
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null, // Use full screen
    ignoreHTTPSErrors: true
  });
  
  const collectedKeys = {};
  
  // Show API selection menu
  log('\n📋 Available APIs:', 'bright');
  const apis = Object.entries(API_CONFIGS);
  apis.forEach(([key, config], index) => {
    log(`${index + 1}. ${config.name} (${config.freeLimit})`, 'cyan');
  });
  log(`${apis.length + 1}. Setup all APIs`, 'cyan');
  log('0. Exit', 'cyan');
  
  const choice = await prompt('\nSelect an option (0-5): ');
  
  let selectedAPIs = [];
  if (choice === '0') {
    await browser.close();
    return;
  } else if (choice === String(apis.length + 1)) {
    selectedAPIs = apis;
  } else {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < apis.length) {
      selectedAPIs = [apis[index]];
    }
  }
  
  // Process selected APIs
  for (const [key, config] of selectedAPIs) {
    try {
      const page = await context.newPage();
      const apiKey = await config.steps(page, browser);
      
      if (apiKey && apiKey.trim()) {
        collectedKeys[key] = apiKey.trim();
        log(`✅ Successfully collected ${config.name} API key!`, 'green');
      } else {
        log(`⚠️  No API key collected for ${config.name}`, 'yellow');
      }
      
      await page.close();
    } catch (error) {
      log(`❌ Error setting up ${config.name}: ${error.message}`, 'red');
    }
  }
  
  await browser.close();
  
  // Save collected keys
  if (Object.keys(collectedKeys).length > 0) {
    log('\n💾 Saving API keys...', 'cyan');
    
    // Read existing .env
    let envContent = '';
    try {
      envContent = await fs.readFile('.env', 'utf8');
    } catch (e) {
      // .env doesn't exist
    }
    
    // Update with new keys
    const keyMap = {
      abuseipdb: 'ABUSEIPDB_API_KEY',
      emailrep: 'EMAILREP_API_KEY',
      numverify: 'NUMVERIFY_API_KEY',
      ipqualityscore: 'IPQUALITYSCORE_API_KEY'
    };
    
    for (const [service, apiKey] of Object.entries(collectedKeys)) {
      const envKey = keyMap[service];
      const keyLine = `${envKey}=${apiKey}`;
      const keyRegex = new RegExp(`^${envKey}=.*$`, 'm');
      
      if (keyRegex.test(envContent)) {
        envContent = envContent.replace(keyRegex, keyLine);
      } else {
        if (!envContent.endsWith('\n')) envContent += '\n';
        envContent += `${keyLine}\n`;
      }
    }
    
    await fs.writeFile('.env', envContent);
    log('✅ Updated .env file!', 'green');
    
    // Create backup
    await fs.writeFile('.env.backup', envContent);
    log('✅ Created .env.backup!', 'green');
  }
  
  // Summary
  log('\n📊 Setup Summary:', 'bright');
  log(`Collected ${Object.keys(collectedKeys).length} API keys:`, 'cyan');
  Object.entries(collectedKeys).forEach(([service, key]) => {
    log(`  ✅ ${API_CONFIGS[service].name}: ${key.substring(0, 10)}...`, 'green');
  });
  
  log('\n🚀 Next steps:', 'yellow');
  log('1. Restart your API service to load the new keys', 'cyan');
  log('2. Test the APIs with: curl -X POST http://localhost:3001/api/lookup -H "Content-Type: application/json" -d \'{"identifier": "8.8.8.8"}\'', 'cyan');
  
  log('\n✨ Automation complete!', 'green');
}

// Run if called directly
if (require.main === module) {
  automateAPISetup().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { automateAPISetup };
