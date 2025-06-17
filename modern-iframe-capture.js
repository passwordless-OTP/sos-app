const { chromium } = require('playwright');
const fs = require('fs');

async function modernIframeCapture() {
  console.log('🔍 Modern iframe capture with full capabilities\n');
  
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
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for iframe
    await page.waitForSelector('iframe[name="app-iframe"]', { timeout: 30000 });
    console.log('✅ Iframe found, waiting for content...');
    await page.waitForTimeout(8000);
    
    const timestamp = Date.now();
    
    // Get iframe content
    const iframeHandle = await page.$('iframe[name="app-iframe"]');
    const frame = await iframeHandle.contentFrame();
    
    if (frame) {
      console.log('\n📊 Analyzing iframe content...');
      
      // 1. Save complete HTML
      const html = await frame.content();
      fs.writeFileSync(`app-content-${timestamp}.html`, html);
      console.log(`✅ HTML saved: ${(html.length / 1024).toFixed(1)} KB`);
      
      // 2. Extract all text
      const allText = await frame.evaluate(() => document.body.innerText || '');
      fs.writeFileSync(`app-text-${timestamp}.txt`, allText);
      console.log(`✅ Text extracted: ${allText.length} characters`);
      
      // 3. Modern approach: Take screenshot using page.screenshot with clip
      console.log('\n📸 Taking screenshots...');
      
      // Get iframe bounding box
      const iframeBounds = await iframeHandle.boundingBox();
      if (iframeBounds) {
        // Screenshot just the iframe area
        await page.screenshot({
          path: `iframe-visible-${timestamp}.png`,
          clip: iframeBounds
        });
        console.log('✅ Iframe visible area captured');
      }
      
      // 4. Search for our features
      console.log('\n🔍 Searching for features:');
      const searchTerms = {
        'AI Store Assistant': /AI Store Assistant/i,
        'Network Intelligence': /Network Intelligence/i,
        'ROI Calculator': /ROI Calculator/i,
        'Simulate Network Alert': /Simulate Network Alert/i,
        'Calculate My Savings': /Calculate My Savings/i,
        'What Merchants Say': /What Merchants Say/i,
        'Today\'s Sales': /Today['']s Sales/i,
        'Recent Fraud Checks': /Recent Fraud Checks/i
      };
      
      let foundCount = 0;
      for (const [name, pattern] of Object.entries(searchTerms)) {
        const inText = pattern.test(allText);
        const inHtml = pattern.test(html);
        const found = inText || inHtml;
        console.log(`${found ? '✅' : '❌'} ${name} ${inText ? '(in text)' : inHtml ? '(in HTML)' : ''}`);
        if (found) foundCount++;
      }
      
      // 5. Try scrolling within iframe
      console.log('\n📜 Attempting iframe scroll capture...');
      try {
        // Get scrollable element in iframe
        const scrollHeight = await frame.evaluate(() => {
          const scrollable = document.querySelector('[data-polaris-scrollable="true"]') || 
                           document.querySelector('.Polaris-Scrollable') || 
                           document.documentElement;
          return scrollable.scrollHeight;
        });
        
        console.log(`Iframe content height: ${scrollHeight}px`);
        
        // Scroll and capture
        if (scrollHeight > 1000) {
          await frame.evaluate(() => {
            const scrollable = document.querySelector('[data-polaris-scrollable="true"]') || 
                             document.querySelector('.Polaris-Scrollable') || 
                             document.documentElement;
            scrollable.scrollTop = scrollable.scrollHeight / 2;
          });
          
          await page.waitForTimeout(1000);
          
          if (iframeBounds) {
            await page.screenshot({
              path: `iframe-scrolled-${timestamp}.png`,
              clip: iframeBounds
            });
            console.log('✅ Scrolled view captured');
          }
        }
      } catch (scrollError) {
        console.log('⚠️  Scroll capture skipped:', scrollError.message);
      }
      
      // 6. Modern viewport capture
      console.log('\n📱 Testing responsive capture...');
      await page.setViewportSize({ width: 1920, height: 2000 }); // Taller viewport
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: `tall-viewport-${timestamp}.png`,
        fullPage: false
      });
      console.log('✅ Tall viewport captured');
      
      console.log(`\n✨ Capture complete!`);
      console.log(`\n📊 Summary:`);
      console.log(`  - Found ${foundCount}/8 features`);
      console.log(`  - HTML size: ${(html.length / 1024).toFixed(1)} KB`);
      console.log(`  - Text length: ${allText.length} characters`);
      console.log(`\n💡 You can:`);
      console.log(`  1. Open app-content-${timestamp}.html in a browser`);
      console.log(`  2. Search app-text-${timestamp}.txt for specific content`);
      console.log(`  3. View screenshots for visual verification`);
      
    } else {
      console.log('❌ Could not access iframe');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n✅ Keeping browser open for manual inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

modernIframeCapture();