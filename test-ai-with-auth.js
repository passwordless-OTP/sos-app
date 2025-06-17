const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAIWithAuth() {
  console.log('🤖 Testing AI Assistant with Shopify Auth\n');
  
  const SHOPIFY_PROFILE_DIR = path.join(__dirname, '.browser-profiles', 'shopify-persistent');
  const SHOPIFY_STATE_FILE = path.join(__dirname, '.browser-profiles', 'shopify-state.json');
  
  if (!fs.existsSync(SHOPIFY_STATE_FILE)) {
    console.log('❌ No Shopify auth found. Run shopify-auth-setup.js first!');
    process.exit(1);
  }
  
  const browser = await chromium.launchPersistentContext(SHOPIFY_PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
    storageState: SHOPIFY_STATE_FILE,
  });
  
  const page = await browser.newPage();
  
  console.log('📍 Navigating to SOS app...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  // Wait for app to load
  console.log('⏳ Waiting for app to load...');
  await page.waitForTimeout(10000);
  
  // Take screenshot
  const timestamp = Date.now();
  const screenshotPath = `ai-assistant-authenticated-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
  
  // Check for AI Assistant elements
  console.log('\n🔍 Checking for AI Assistant...');
  
  const elements = {
    'Page loaded': await page.locator('body').count() > 0,
    'SOS Dashboard title': await page.locator('text=/SOS Dashboard|Store Operations Shield/').count() > 0,
    'AI Store Assistant section': await page.locator('text=AI Store Assistant').count() > 0,
    'Ask AI button': await page.locator('button:has-text("Ask AI")').count() > 0,
    'Input field for questions': await page.locator('input[placeholder*="sales"], input[placeholder*="ask"], textarea').count() > 0,
    'Sales metrics': await page.locator('text=/Sales|\\$[0-9]+/').count() > 0,
    'Fraud table': await page.locator('text=/Fraud|Recent Fraud Checks/').count() > 0,
  };
  
  console.log('\n📋 Test Results:');
  let allPassed = true;
  Object.entries(elements).forEach(([name, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${name}`);
    if (!found) allPassed = false;
  });
  
  if (allPassed) {
    console.log('\n🎉 SUCCESS! AI Assistant is fully loaded and functional!');
  } else {
    console.log('\n⚠️ Some elements not found. Check the screenshot for details.');
    
    // Try to get page content for debugging
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`\nDebug info:`);
    console.log(`  Page title: ${pageTitle}`);
    console.log(`  Current URL: ${pageUrl}`);
  }
  
  console.log('\n⏸️ Keeping browser open for inspection. Press Ctrl+C to close.');
  await new Promise(() => {});
}

testAIWithAuth().catch(console.error);