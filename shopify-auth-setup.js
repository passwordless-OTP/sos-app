const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Shopify-specific browser profile
const SHOPIFY_PROFILE_DIR = path.join(__dirname, '.browser-profiles', 'shopify-persistent');
const SHOPIFY_STATE_FILE = path.join(__dirname, '.browser-profiles', 'shopify-state.json');

// Ensure directory exists
if (!fs.existsSync(SHOPIFY_PROFILE_DIR)) {
  fs.mkdirSync(SHOPIFY_PROFILE_DIR, { recursive: true });
}

async function setupShopifyAuth() {
  console.log('🛍️ Shopify Authentication Setup\n');
  console.log('This will set up persistent login for Shopify admin and app testing.\n');
  
  const browser = await chromium.launchPersistentContext(SHOPIFY_PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
    storageState: fs.existsSync(SHOPIFY_STATE_FILE) ? SHOPIFY_STATE_FILE : undefined,
    // Shopify-specific settings
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: ['clipboard-read', 'clipboard-write', 'notifications'],
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    // User agent for better compatibility
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await browser.newPage();
  
  console.log('📍 Step 1: Navigating to Shopify admin login...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Check if we need to login
  const currentUrl = page.url();
  const needsAuth = currentUrl.includes('accounts.shopify.com') || 
                   currentUrl.includes('/login') ||
                   currentUrl.includes('/auth') ||
                   await page.locator('input[type="email"], input[name="account[email]"]').count() > 0;
  
  if (needsAuth) {
    console.log('\n🔑 Please complete the Shopify login process:');
    console.log('   1. Enter your email/username');
    console.log('   2. Enter your password');
    console.log('   3. Complete any 2FA if required');
    console.log('\nWaiting for login completion...\n');
    
    // Wait for successful login (navigation to admin dashboard)
    try {
      await page.waitForFunction(
        () => {
          const url = window.location.href;
          return url.includes('/admin') && 
                 !url.includes('/login') && 
                 !url.includes('/auth') &&
                 !url.includes('accounts.shopify.com');
        },
        { timeout: 300000 } // 5 minutes to login
      );
      
      console.log('✅ Shopify login successful!');
    } catch (e) {
      console.log('⏱️ Login timeout - please complete login and run again.');
    }
  } else {
    console.log('✅ Already authenticated with Shopify!');
  }
  
  // Save authentication state
  await browser.storageState({ path: SHOPIFY_STATE_FILE });
  console.log('💾 Shopify session saved to shopify-state.json');
  
  // Navigate to the app
  console.log('\n📍 Step 2: Navigating to SOS app...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  await page.waitForTimeout(5000);
  
  // Check if app loaded
  const appLoaded = await page.locator('text=/SOS|Store Operations Shield|AI/').count() > 0;
  
  if (appLoaded) {
    console.log('✅ Successfully accessed SOS app!');
    
    // Look for AI Assistant elements
    const elements = {
      'SOS Dashboard': await page.locator('text=SOS Dashboard').count() > 0,
      'AI Store Assistant': await page.locator('text=AI Store Assistant').count() > 0,
      'Ask AI Button': await page.locator('button:has-text("Ask AI")').count() > 0,
      'Input Field': await page.locator('input[placeholder*="sales"]').count() > 0,
    };
    
    console.log('\n🔍 App elements found:');
    Object.entries(elements).forEach(([name, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${name}`);
    });
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, 'shopify-auth-success.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
  } else {
    console.log('⚠️ App not fully loaded - you may need to refresh or check app installation');
  }
  
  // Save final state
  await browser.storageState({ path: SHOPIFY_STATE_FILE });
  
  console.log('\n✨ Setup complete!');
  console.log('Future test runs will use the saved Shopify session automatically.');
  console.log('\n⏸️  Keeping browser open. Press Ctrl+C to close.');
  
  await new Promise(() => {});
}

setupShopifyAuth().catch(console.error);