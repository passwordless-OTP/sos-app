const { chromium } = require('playwright');
const fs = require('fs');

async function smartCapture() {
  console.log('🔍 Smart HTML + Screenshot capture\n');
  
  const browser = await chromium.launchPersistentContext(
    '/Users/jarvis/Downloads/development/SOS/test-framework/browser-profile',
    {
      headless: false,
      viewport: { width: 1920, height: 1080 }
    }
  );
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to dashboard...');
    // More forgiving navigation
    await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
      waitUntil: 'domcontentloaded',  // Less strict
      timeout: 60000
    });
    
    console.log('Waiting for content to load...');
    await page.waitForTimeout(10000);
    
    const timestamp = Date.now();
    
    // Save HTML regardless of state
    console.log('\n📄 Capturing HTML...');
    const html = await page.content();
    const htmlFile = `dashboard-full-${timestamp}.html`;
    fs.writeFileSync(htmlFile, html);
    console.log(`✅ Saved: ${htmlFile} (${(html.length / 1024).toFixed(1)} KB)`);
    
    // Full page screenshot with Playwright's built-in capability
    console.log('\n📸 Full page screenshot...');
    try {
      await page.screenshot({ 
        path: `dashboard-fullpage-${timestamp}.png`,
        fullPage: true,
        timeout: 30000
      });
      console.log('✅ Full page screenshot saved');
    } catch (screenshotError) {
      console.log('⚠️  Full page screenshot failed, trying viewport only...');
      await page.screenshot({ 
        path: `dashboard-viewport-${timestamp}.png`,
        fullPage: false
      });
    }
    
    // Extract visible text
    console.log('\n📝 Extracting page content...');
    const textContent = await page.evaluate(() => {
      const getText = (element) => {
        let text = '';
        for (const node of element.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            text += getText(node);
          }
        }
        return text;
      };
      return getText(document.body);
    });
    
    // Save text content
    const textFile = `dashboard-text-${timestamp}.txt`;
    fs.writeFileSync(textFile, textContent);
    console.log(`✅ Saved: ${textFile}`);
    
    // Search for features
    console.log('\n🔍 Searching for features in DOM...');
    const searchTerms = [
      'Network Intelligence',
      'ROI Calculator',
      'Simulate Network Alert',
      'Calculate My Savings',
      'What Merchants Say',
      'AI Store Assistant',
      'Today\'s Sales',
      'Recent Fraud Checks'
    ];
    
    for (const term of searchTerms) {
      const found = textContent.includes(term) || html.includes(term);
      console.log(`${found ? '✅' : '❌'} ${term}`);
    }
    
    // Modern approach: Get computed styles and dimensions
    console.log('\n📐 Page dimensions:');
    const dimensions = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
      );
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        document: { width: document.documentElement.scrollWidth, height: height }
      };
    });
    console.log(`Viewport: ${dimensions.viewport.width}x${dimensions.viewport.height}`);
    console.log(`Document: ${dimensions.document.width}x${dimensions.document.height}`);
    
    console.log(`\n✅ Capture complete!`);
    console.log(`\n💡 To view the full page:`);
    console.log(`   1. Open ${htmlFile} in any browser`);
    console.log(`   2. Or check ${textFile} for all text content`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Still try to save what we can
    try {
      const emergencyHtml = await page.content();
      fs.writeFileSync('emergency-capture.html', emergencyHtml);
      console.log('📄 Emergency HTML saved');
    } catch {}
  }
  
  console.log('\n👀 Browser staying open...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

smartCapture();