const { chromium } = require('playwright');

async function verifyWithProfile() {
  console.log('🔍 Using PERSISTENT PROFILE for verification\n');
  
  // ALWAYS use the persistent profile - NO EXCUSES
  const browser = await chromium.launchPersistentContext(
    '/Users/jarvis/Downloads/development/SOS/test-framework/browser-profile',
    {
      headless: false,
      viewport: { width: 1920, height: 1080 }
    }
  );
  
  const page = await browser.newPage();
  
  try {
    console.log('✅ Using saved profile with Shopify session');
    
    // Go directly to the app within Shopify admin
    await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    
    // Take screenshot
    const timestamp = Date.now();
    await page.screenshot({ 
      path: `demo-with-profile-${timestamp}.png`, 
      fullPage: true 
    });
    
    console.log(`📸 Screenshot saved: demo-with-profile-${timestamp}.png`);
    console.log('\n🔎 Checking for new features in the Shopify iframe...');
    
    // The app is in an iframe within Shopify admin
    const appFrame = page.frameLocator('iframe[name="app-iframe"]').first();
    
    // Check features within the iframe
    const features = [
      'Network Intelligence Live Feed',
      'Simulate Network Alert',
      'ROI Calculator',
      'Calculate My Savings',
      'What Merchants Say'
    ];
    
    for (const feature of features) {
      try {
        const visible = await appFrame.locator(`text="${feature}"`).isVisible({ timeout: 2000 });
        console.log(`${visible ? '✅' : '❌'} ${feature}`);
      } catch {
        console.log(`❌ ${feature} - not found`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n✅ Keeping browser open for inspection...');
  await page.waitForTimeout(60000);
  
  await browser.close();
}

verifyWithProfile();