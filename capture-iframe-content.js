const { chromium } = require('playwright');
const fs = require('fs');

async function captureIframeContent() {
  console.log('🔍 Modern approach: Capturing iframe content properly\n');
  
  const browser = await chromium.launchPersistentContext(
    '/Users/jarvis/Downloads/development/SOS/test-framework/browser-profile',
    {
      headless: false,
      viewport: { width: 1920, height: 1080 }
    }
  );
  
  const page = await browser.newPage();
  
  try {
    console.log('Loading page...');
    await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
      waitUntil: 'domcontentloaded'
    });
    
    console.log('Waiting for iframe to load...');
    // Wait for the iframe to exist
    await page.waitForSelector('iframe[name="app-iframe"]', { timeout: 30000 });
    await page.waitForTimeout(5000); // Let content load
    
    const timestamp = Date.now();
    
    // Get the iframe handle
    const iframeElement = await page.$('iframe[name="app-iframe"]');
    const iframe = await iframeElement.contentFrame();
    
    if (iframe) {
      console.log('✅ Found app iframe!\n');
      
      // 1. Save iframe HTML
      console.log('📄 Saving iframe HTML...');
      const iframeHtml = await iframe.content();
      fs.writeFileSync(`iframe-content-${timestamp}.html`, iframeHtml);
      console.log(`✅ Saved: iframe-content-${timestamp}.html (${(iframeHtml.length / 1024).toFixed(1)} KB)`);
      
      // 2. Modern full-page screenshot of iframe
      console.log('\n📸 Taking full iframe screenshot...');
      await iframe.screenshot({
        path: `iframe-fullpage-${timestamp}.png`,
        fullPage: true  // This captures the entire iframe content!
      });
      console.log('✅ Full iframe screenshot saved');
      
      // 3. Extract all text from iframe
      console.log('\n📝 Extracting iframe text...');
      const iframeText = await iframe.evaluate(() => document.body.innerText);
      fs.writeFileSync(`iframe-text-${timestamp}.txt`, iframeText);
      
      // 4. Search for features in iframe
      console.log('\n🔍 Features found in app:');
      const features = [
        'Network Intelligence Live Feed',
        'ROI Calculator',
        'What Merchants Say',
        'Simulate Network Alert',
        'Calculate My Savings',
        'AI Store Assistant',
        'Recent Fraud Checks',
        'Today\'s Sales'
      ];
      
      features.forEach(feature => {
        const found = iframeText.includes(feature) || iframeHtml.includes(feature);
        console.log(`${found ? '✅' : '❌'} ${feature}`);
      });
      
      // 5. Get iframe dimensions
      console.log('\n📐 Iframe dimensions:');
      const dimensions = await iframe.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      console.log(`Content: ${dimensions.scrollWidth}x${dimensions.scrollHeight}px`);
      console.log(`Viewport: ${dimensions.clientWidth}x${dimensions.clientHeight}px`);
      
      // 6. Try interacting with features
      console.log('\n🧪 Testing interactions...');
      try {
        const networkButton = await iframe.$('button:has-text("Simulate Network Alert")');
        if (networkButton) {
          console.log('✅ Found "Simulate Network Alert" button');
          await networkButton.scrollIntoViewIfNeeded();
          await iframe.screenshot({
            path: `network-section-${timestamp}.png`,
            fullPage: false
          });
        }
      } catch {}
      
      console.log('\n✨ Modern capture complete!');
      console.log(`\n📁 Files saved:`);
      console.log(`  - iframe-content-${timestamp}.html (full HTML)`);
      console.log(`  - iframe-fullpage-${timestamp}.png (complete screenshot)`);
      console.log(`  - iframe-text-${timestamp}.txt (all text)`);
      
    } else {
      console.log('❌ Could not access iframe content');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n👀 Browser staying open for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

captureIframeContent();