const { chromium } = require('playwright');
const path = require('path');

async function checkShopifyIframe() {
  console.log('🔍 Checking Shopify Embedded App Structure\n');
  
  const browser = await chromium.launchPersistentContext(
    path.join(__dirname, '.browser-profiles', 'shopify-persistent'),
    {
      headless: false,
      viewport: { width: 1440, height: 900 },
      storageState: path.join(__dirname, '.browser-profiles', 'shopify-state.json')
    }
  );
  
  const page = await browser.newPage();
  
  console.log('📍 Navigating to Shopify app...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  await page.waitForTimeout(8000);
  
  console.log('🔍 Looking for iframes...');
  const iframes = await page.frames();
  console.log(`   Found ${iframes.length} frames total`);
  
  for (let i = 0; i < iframes.length; i++) {
    const frame = iframes[i];
    const url = frame.url();
    console.log(`\n   Frame ${i}: ${url}`);
    
    if (url.includes('sosv02') || url.includes('gadget')) {
      console.log('   ✅ This is our app frame!');
      
      // Check content in this frame
      try {
        const dashboardInFrame = await frame.locator('text=SOS Dashboard').count() > 0;
        const aiInFrame = await frame.locator('text=AI Store Assistant').count() > 0;
        const errorInFrame = await frame.locator('text=error').count() > 0;
        
        console.log(`   Dashboard in frame: ${dashboardInFrame ? '✅' : '❌'}`);
        console.log(`   AI Assistant in frame: ${aiInFrame ? '✅' : '❌'}`);
        console.log(`   Error in frame: ${errorInFrame ? '⚠️ Yes' : '✅ No'}`);
        
        if (errorInFrame) {
          const errorText = await frame.locator('text=error').first().textContent().catch(() => 'Could not get error text');
          console.log(`   Error text: ${errorText}`);
        }
        
        // Get frame content preview
        const frameText = await frame.locator('body').innerText().catch(() => 'Could not get frame text');
        console.log(`   Frame content preview: ${frameText.substring(0, 200)}...`);
      } catch (e) {
        console.log('   ❌ Could not access frame content:', e.message);
      }
    }
  }
  
  console.log('\n📸 Taking screenshot with all frames...');
  await page.screenshot({ path: 'shopify-iframe-check.png', fullPage: true });
  
  await browser.close();
}

checkShopifyIframe().catch(console.error);