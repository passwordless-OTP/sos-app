const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyPolarisApp() {
  console.log('🔍 Verifying Polaris-Compliant SOS App\n');
  
  const SHOPIFY_PROFILE_DIR = path.join(__dirname, '.browser-profiles', 'shopify-persistent');
  const SHOPIFY_STATE_FILE = path.join(__dirname, '.browser-profiles', 'shopify-state.json');
  
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
  
  // Wait for app to fully load
  console.log('⏳ Waiting for app to load...');
  await page.waitForTimeout(10000);
  
  // Take screenshot
  const timestamp = Date.now();
  const screenshotPath = `polaris-app-verification-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
  
  // Check for Polaris components
  console.log('\n🎨 Checking Polaris Components:');
  
  const polarisChecks = {
    'Frame component': await page.locator('.Polaris-Frame').count() > 0,
    'Page component': await page.locator('.Polaris-Page').count() > 0,
    'LegacyCard components': await page.locator('.Polaris-LegacyCard').count() > 0,
    'Primary button (green)': await page.locator('.Polaris-Button--primary').count() > 0,
    'TextField with label': await page.locator('.Polaris-TextField').count() > 0,
    'Banner component': await page.locator('.Polaris-Banner').count() > 0,
    'Badge components': await page.locator('.Polaris-Badge').count() > 0,
    'DataTable': await page.locator('.Polaris-DataTable').count() > 0,
    'Icons': await page.locator('.Polaris-Icon').count() > 0,
    'Toast ready': await page.locator('body').evaluate(() => window.React !== undefined),
  };
  
  console.log('\n📋 Polaris Component Check:');
  let allPassed = true;
  Object.entries(polarisChecks).forEach(([component, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${component}`);
    if (!found) allPassed = false;
  });
  
  // Check for AI Assistant functionality
  console.log('\n🤖 Checking AI Assistant:');
  
  const aiChecks = {
    'AI Store Assistant heading': await page.locator('text=AI Store Assistant').count() > 0,
    'Ask AI button': await page.locator('button:has-text("Ask AI")').count() > 0,
    'Input field': await page.locator('input[placeholder*="What were my sales"]').count() > 0,
    'Help text': await page.locator('text=/Try questions about|sales.*orders.*inventory/').count() > 0,
  };
  
  Object.entries(aiChecks).forEach(([feature, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${feature}`);
    if (!found) allPassed = false;
  });
  
  // Check metrics cards
  console.log('\n📊 Checking Metrics Cards:');
  
  const metrics = {
    'Sales metric ($12,450)': await page.locator('text=$12,450').count() > 0,
    'Orders metric (23)': await page.locator('text=23').first().count() > 0,
    'Risk level (Low)': await page.locator('text=Low').count() > 0,
    'Network size (17,453)': await page.locator('text=17,453').count() > 0,
  };
  
  Object.entries(metrics).forEach(([metric, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${metric}`);
    if (!found) allPassed = false;
  });
  
  // Overall result
  if (allPassed) {
    console.log('\n🎉 SUCCESS! The app is fully Polaris-compliant and working!');
    console.log('✨ All components are using proper Polaris design system');
  } else {
    console.log('\n⚠️ Some Polaris components not detected. Check the screenshot.');
  }
  
  // Debug info
  const pageTitle = await page.title();
  const pageUrl = page.url();
  console.log(`\n📌 Debug info:`);
  console.log(`  Page title: ${pageTitle}`);
  console.log(`  Current URL: ${pageUrl}`);
  
  console.log('\n⏸️ Keeping browser open for inspection. Press Ctrl+C to close.');
  await new Promise(() => {});
}

verifyPolarisApp().catch(console.error);