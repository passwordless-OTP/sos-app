const { chromium } = require('playwright');

async function verifyWazeFeatures() {
  console.log('🔍 Verifying Waze-like UI features\n');
  
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
    await page.waitForTimeout(8000);
    
    const timestamp = Date.now();
    const frame = await page.$('iframe[name="app-iframe"]').then(h => h.contentFrame());
    
    if (frame) {
      console.log('✅ App loaded, checking Waze features...\n');
      
      // 1. Check for Live Fraud Map
      console.log('1️⃣ Live Fraud Map');
      const mapTitle = await frame.$('text=Live Fraud Map - "Waze for E-commerce"');
      console.log(`   ${mapTitle ? '✅' : '❌'} Map title found`);
      
      // Check for SVG map
      const svgMap = await frame.$('svg');
      console.log(`   ${svgMap ? '✅' : '❌'} SVG map element found`);
      
      // 2. Check Network Protection Strength
      console.log('\n2️⃣ Network Protection Strength');
      const strengthMeter = await frame.$('text=Network Protection Strength');
      console.log(`   ${strengthMeter ? '✅' : '❌'} Strength meter found`);
      
      const coverage = await frame.$('text=87% Coverage');
      console.log(`   ${coverage ? '✅' : '❌'} Coverage percentage found`);
      
      // 3. Check Waze tagline
      console.log('\n3️⃣ Waze Messaging');
      const wazeTagline = await frame.$('text=Like Waze, our fraud detection gets stronger with every new merchant');
      console.log(`   ${wazeTagline ? '✅' : '❌'} Waze tagline found`);
      
      // 4. Test Network Alert Simulation
      console.log('\n4️⃣ Testing Network Alert...');
      const alertButton = await frame.$('button:has-text("Simulate Network Alert")');
      if (alertButton) {
        console.log('   ✅ Alert button found, clicking...');
        await alertButton.scrollIntoViewIfNeeded();
        await alertButton.click();
        
        await page.waitForTimeout(2000);
        
        // Check for fraud route message
        const fraudRoute = await frame.$('text=Fraud route detected');
        console.log(`   ${fraudRoute ? '✅' : '❌'} Fraud route message appeared`);
        
        // Take screenshot
        await page.screenshot({
          path: `waze-features-active-${timestamp}.png`,
          fullPage: false
        });
        console.log('   📸 Screenshot saved with active alert');
      } else {
        console.log('   ❌ Alert button not found');
      }
      
      // 5. Save full HTML for inspection
      const html = await frame.content();
      require('fs').writeFileSync(`waze-ui-${timestamp}.html`, html);
      console.log(`\n📄 Full HTML saved: waze-ui-${timestamp}.html`);
      
      // Check if map animations are present
      const animations = await frame.$$('animate');
      console.log(`\n🎬 Found ${animations.length} animation elements in map`);
      
    } else {
      console.log('❌ Could not access app iframe');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n✅ Verification complete! Check screenshots.');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

verifyWazeFeatures();