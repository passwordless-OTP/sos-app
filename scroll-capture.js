const { chromium } = require('playwright');

async function scrollCapture() {
  console.log('🔍 Comprehensive scroll capture\n');
  
  const browser = await chromium.launchPersistentContext(
    '/Users/jarvis/Downloads/development/SOS/test-framework/browser-profile',
    {
      headless: false,
      viewport: { width: 1920, height: 1080 }
    }
  );
  
  const page = await browser.newPage();
  
  try {
    // More flexible navigation
    console.log('Navigating to app...');
    await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Wait for iframe to load
    console.log('Waiting for app to load...');
    await page.waitForTimeout(10000);
    
    // Take initial full screenshot
    const timestamp = Date.now();
    await page.screenshot({ 
      path: `full-page-initial-${timestamp}.png`,
      fullPage: true 
    });
    
    // Try to access iframe content
    try {
      const frames = page.frames();
      console.log(`Found ${frames.length} frames`);
      
      // Find the app iframe
      let appFrame = null;
      for (const frame of frames) {
        const url = frame.url();
        if (url.includes('sosv02') || url.includes('gadget')) {
          appFrame = frame;
          console.log(`Found app frame: ${url}`);
          break;
        }
      }
      
      if (appFrame) {
        // Get the page height
        const pageHeight = await appFrame.evaluate(() => {
          return Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          );
        });
        
        console.log(`\nPage height: ${pageHeight}px`);
        
        // Scroll and capture in sections
        const viewportHeight = 800;
        let position = 0;
        let section = 1;
        
        while (position < pageHeight) {
          await appFrame.evaluate((y) => window.scrollTo(0, y), position);
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: `scroll-section-${section}-at-${position}px-${timestamp}.png`
          });
          
          console.log(`📸 Captured section ${section} at position ${position}px`);
          
          position += viewportHeight;
          section++;
        }
        
        // Scroll back to top
        await appFrame.evaluate(() => window.scrollTo(0, 0));
        
        // Look for specific elements
        console.log('\n🔎 Searching for features...');
        const features = [
          'Network Intelligence',
          'ROI Calculator',
          'AI Store Assistant',
          'What Merchants Say'
        ];
        
        for (const feature of features) {
          try {
            const element = await appFrame.waitForSelector(`text=${feature}`, { timeout: 2000 });
            if (element) {
              console.log(`✅ Found: ${feature}`);
              await element.scrollIntoViewIfNeeded();
              await page.waitForTimeout(500);
              await page.screenshot({ 
                path: `feature-${feature.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.png`
              });
            }
          } catch {
            console.log(`❌ Not found: ${feature}`);
          }
        }
      }
      
    } catch (frameError) {
      console.log('Frame access error:', frameError.message);
      console.log('Taking fallback screenshots...');
      
      // Fallback: Just scroll the main page
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: `fallback-scroll-${i}-${timestamp}.png`
        });
      }
    }
    
    console.log(`\n✅ All screenshots saved with timestamp: ${timestamp}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Keep open
  console.log('\nBrowser staying open for inspection...');
  await page.waitForTimeout(60000);
  
  await browser.close();
}

scrollCapture();