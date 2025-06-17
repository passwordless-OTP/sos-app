const { chromium } = require('playwright');

async function comprehensiveScrollVerify() {
  console.log('🔍 Comprehensive scroll verification with PERSISTENT PROFILE\n');
  
  const browser = await chromium.launchPersistentContext(
    '/Users/jarvis/Downloads/development/SOS/test-framework/browser-profile',
    {
      headless: false,
      viewport: { width: 1920, height: 1080 }
    }
  );
  
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    console.log('1️⃣ Navigating to app...');
    await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    
    // Get the iframe
    const appFrame = page.frameLocator('iframe[name="app-iframe"]').first();
    
    // Get scrollable container dimensions
    const scrollHeight = await appFrame.evaluate(() => {
      const container = document.querySelector('[data-polaris-scrollable="true"]') || document.body;
      return container.scrollHeight;
    });
    
    const viewportHeight = await appFrame.evaluate(() => window.innerHeight);
    
    console.log(`📏 Page height: ${scrollHeight}px, Viewport: ${viewportHeight}px`);
    console.log(`📜 Need ${Math.ceil(scrollHeight / viewportHeight)} screenshots to capture everything\n`);
    
    const timestamp = Date.now();
    const sections = [];
    let currentPosition = 0;
    let screenshotIndex = 1;
    
    // Capture screenshots while scrolling
    while (currentPosition < scrollHeight) {
      console.log(`📸 Capturing section ${screenshotIndex}...`);
      
      // Scroll to position
      await appFrame.evaluate((pos) => {
        const container = document.querySelector('[data-polaris-scrollable="true"]') || document.body;
        container.scrollTop = pos;
      }, currentPosition);
      
      await page.waitForTimeout(1000); // Wait for content to settle
      
      // Take screenshot
      const filename = `section-${screenshotIndex}-${timestamp}.png`;
      await page.screenshot({ 
        path: filename,
        fullPage: false // Capture visible viewport only
      });
      
      // Check what's visible in this section
      const visibleFeatures = [];
      const features = [
        'Network Intelligence Live Feed',
        'Simulate Network Alert',
        'ROI Calculator',
        'Calculate My Savings',
        'What Merchants Say',
        'AI Store Assistant',
        'Recent Fraud Checks',
        'Today\'s Sales',
        'Network Risk'
      ];
      
      for (const feature of features) {
        try {
          const visible = await appFrame.locator(`text="${feature}"`).isVisible({ timeout: 500 });
          if (visible) visibleFeatures.push(feature);
        } catch {}
      }
      
      sections.push({
        screenshot: filename,
        position: currentPosition,
        features: visibleFeatures
      });
      
      console.log(`   Found: ${visibleFeatures.join(', ') || 'Loading...'}`);
      
      currentPosition += viewportHeight * 0.8; // Overlap by 20% to not miss content
      screenshotIndex++;
    }
    
    // Generate summary
    console.log('\n📊 COMPREHENSIVE SUMMARY:');
    console.log('========================\n');
    
    const allFeatures = new Set();
    sections.forEach((section, index) => {
      console.log(`Section ${index + 1} (${section.screenshot}):`);
      section.features.forEach(f => {
        console.log(`  ✅ ${f}`);
        allFeatures.add(f);
      });
      console.log('');
    });
    
    console.log('🎯 TOTAL FEATURES FOUND:', allFeatures.size);
    console.log([...allFeatures].map(f => `  ✅ ${f}`).join('\n'));
    
    // Test interactions
    console.log('\n🧪 Testing Interactions...\n');
    
    // Scroll back to Network Intelligence section
    const networkSection = await appFrame.locator('text=Network Intelligence Live Feed');
    if (await networkSection.isVisible()) {
      await networkSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Click Simulate Network Alert
      const alertButton = appFrame.locator('button:has-text("Simulate Network Alert")');
      if (await alertButton.isVisible()) {
        console.log('🚨 Clicking "Simulate Network Alert"...');
        await alertButton.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: `network-alert-active-${timestamp}.png`,
          fullPage: false
        });
        console.log('✅ Network alert screenshot saved');
      }
    }
    
    // Scroll to ROI Calculator
    const roiSection = await appFrame.locator('text=ROI Calculator');
    if (await roiSection.isVisible()) {
      await roiSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `roi-calculator-view-${timestamp}.png`,
        fullPage: false
      });
      console.log('✅ ROI Calculator screenshot saved');
    }
    
    console.log(`\n✅ Complete verification done!`);
    console.log(`📁 All screenshots saved with timestamp: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n👀 Keeping browser open for manual inspection...');
  await page.waitForTimeout(60000);
  
  await browser.close();
}

comprehensiveScrollVerify();