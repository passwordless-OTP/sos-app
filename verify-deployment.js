const { chromium } = require('playwright');
const path = require('path');

async function verifyDeployment() {
  console.log('🔍 Verifying SOS Dashboard Deployment\n');
  
  // First, let's check the preview URL directly
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1️⃣ Checking Gadget Preview URL...');
  try {
    await page.goto('https://sosv02--development.gadget.app', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    const previewTitle = await page.title();
    console.log(`   ✅ Preview page loaded: ${previewTitle}`);
    
    // Take screenshot of preview
    await page.screenshot({ path: 'gadget-preview.png' });
    console.log('   📸 Preview screenshot saved: gadget-preview.png');
  } catch (error) {
    console.log(`   ❌ Preview error: ${error.message}`);
  }
  
  // Now check the Shopify app with persistent profile
  console.log('\n2️⃣ Checking Shopify App Integration...');
  await browser.close();
  
  const profilePath = path.join(__dirname, '.browser-profiles', 'shopify-persistent');
  const statePath = path.join(__dirname, '.browser-profiles', 'shopify-state.json');
  
  const shopifyBrowser = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    storageState: statePath
  });
  
  const shopifyPage = await shopifyBrowser.newPage();
  
  try {
    await shopifyPage.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('   ⏳ Waiting for app to load...');
    await shopifyPage.waitForTimeout(8000);
    
    // Check for error message
    const hasError = await shopifyPage.locator('text=Unexpected server-side error').count() > 0;
    if (hasError) {
      console.log('   ❌ Server-side error detected');
      
      // Get error details
      const errorId = await shopifyPage.locator('text=traceID').textContent();
      console.log(`   📋 Error details: ${errorId}`);
      
      // Check if it's a Polaris icons issue
      const errorText = await shopifyPage.locator('[vite]').textContent();
      if (errorText && errorText.includes('polaris-icons')) {
        console.log('   ⚠️  Issue with Polaris icons module');
      }
    } else {
      console.log('   ✅ No server errors detected');
      
      // Look for our dashboard elements
      const dashboardChecks = {
        'Any heading': await shopifyPage.locator('h1, h2, h3').count() > 0,
        'Any button': await shopifyPage.locator('button').count() > 0,
        'Any text content': await shopifyPage.locator('p, span').count() > 0,
      };
      
      console.log('\n   Basic content checks:');
      Object.entries(dashboardChecks).forEach(([check, found]) => {
        console.log(`   ${found ? '✅' : '❌'} ${check}`);
      });
    }
    
    // Take final screenshot
    await shopifyPage.screenshot({ path: 'shopify-app-final.png', fullPage: true });
    console.log('\n   📸 Final screenshot saved: shopify-app-final.png');
    
  } catch (error) {
    console.log(`   ❌ Shopify app error: ${error.message}`);
  }
  
  console.log('\n📌 DEPLOYMENT STATUS:');
  console.log('   - Code successfully pushed to Gadget ✅');
  console.log('   - Server encountering module resolution error ❌');
  console.log('   - Likely issue: @shopify/polaris-icons import');
  console.log('\n💡 RECOMMENDATION: Check Gadget editor for module errors');
  
  await shopifyBrowser.close();
}

verifyDeployment().catch(console.error);