const { chromium } = require('playwright');
const fs = require('fs');

async function captureFullHTML() {
  console.log('🔍 Smart capture using HTML and full-page screenshot\n');
  
  const browser = await chromium.launchPersistentContext(
    '/Users/jarvis/Downloads/development/SOS/test-framework/browser-profile',
    {
      headless: false,
      viewport: { width: 1920, height: 1080 }
    }
  );
  
  const page = await browser.newPage();
  
  try {
    console.log('Loading dashboard...');
    await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(8000);
    const timestamp = Date.now();
    
    // 1. Save the complete HTML
    console.log('\n📄 Saving complete HTML...');
    const html = await page.content();
    fs.writeFileSync(`full-page-${timestamp}.html`, html);
    console.log(`✅ HTML saved: full-page-${timestamp}.html`);
    
    // 2. Use Playwright's built-in full page screenshot
    console.log('\n📸 Taking REAL full-page screenshot...');
    await page.screenshot({ 
      path: `full-page-screenshot-${timestamp}.png`,
      fullPage: true  // This should capture everything!
    });
    console.log(`✅ Full page screenshot saved`);
    
    // 3. Extract all text content for verification
    console.log('\n📝 Extracting all text content...');
    const textContent = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    // Check for our features in the text
    const features = [
      'Network Intelligence Live Feed',
      'ROI Calculator',
      'What Merchants Say',
      'Simulate Network Alert',
      'Calculate My Savings'
    ];
    
    console.log('\n🔎 Feature Detection in DOM:');
    features.forEach(feature => {
      const found = textContent.includes(feature);
      console.log(`${found ? '✅' : '❌'} ${feature}`);
    });
    
    // 4. Save the text content for analysis
    fs.writeFileSync(`page-text-content-${timestamp}.txt`, textContent);
    console.log(`\n📄 Text content saved: page-text-content-${timestamp}.txt`);
    
    // 5. Try Playwright's screenshot with specific element
    const appContent = await page.$('[role="main"]') || await page.$('main') || await page.$('body');
    if (appContent) {
      await appContent.screenshot({ 
        path: `app-content-only-${timestamp}.png`
      });
      console.log('✅ App content screenshot saved');
    }
    
    console.log(`\n✨ Smart capture complete!`);
    console.log(`Files saved with timestamp: ${timestamp}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n💡 You can open the HTML file in any browser to see the full page!');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

captureFullHTML();