const { chromium } = require('playwright');

async function verifyDemoFeatures() {
  console.log('🔍 Verifying SOS Demo Features\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log('1️⃣ Navigating to SOS Dashboard...');
    await page.goto('https://sosv02--development.gadget.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for dashboard to load
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    const timestamp = Date.now();
    await page.screenshot({ 
      path: `demo-verification-${timestamp}.png`, 
      fullPage: true 
    });
    console.log('✅ Dashboard loaded, screenshot saved\n');
    
    // Check for Network Intelligence section
    console.log('2️⃣ Checking Network Intelligence Live Feed...');
    const hasNetworkSection = await page.locator('text=Network Intelligence Live Feed').isVisible();
    console.log(`   Network Intelligence section: ${hasNetworkSection ? '✅ Found' : '❌ Not found'}`);
    
    // Check for Simulate Network Alert button
    const hasSimulateButton = await page.locator('button:has-text("Simulate Network Alert")').isVisible();
    console.log(`   Simulate Network Alert button: ${hasSimulateButton ? '✅ Found' : '❌ Not found'}`);
    
    // Check for ROI Calculator
    console.log('\n3️⃣ Checking ROI Calculator...');
    const hasROICalculator = await page.locator('text=ROI Calculator').isVisible();
    console.log(`   ROI Calculator section: ${hasROICalculator ? '✅ Found' : '❌ Not found'}`);
    
    // Check for Calculate button
    const hasCalculateButton = await page.locator('button:has-text("Calculate My Savings")').isVisible();
    console.log(`   Calculate button: ${hasCalculateButton ? '✅ Found' : '❌ Not found'}`);
    
    // Check for Testimonials
    console.log('\n4️⃣ Checking Merchant Testimonials...');
    const hasTestimonials = await page.locator('text=What Merchants Say').isVisible();
    console.log(`   Testimonials section: ${hasTestimonials ? '✅ Found' : '❌ Not found'}`);
    
    // Test Network Effect simulation
    if (hasSimulateButton) {
      console.log('\n5️⃣ Testing Network Effect Simulation...');
      await page.locator('button:has-text("Simulate Network Alert")').click();
      await page.waitForTimeout(1000);
      
      // Check for alert
      const hasAlert = await page.locator('text=Active Network Alert').isVisible();
      console.log(`   Network alert appeared: ${hasAlert ? '✅ Yes' : '❌ No'}`);
      
      // Wait for cascade effect
      await page.waitForTimeout(3000);
      
      // Take screenshot of network effect
      await page.screenshot({ 
        path: `network-effect-demo-${timestamp}.png`, 
        fullPage: true 
      });
      console.log('   Network effect screenshot saved');
    }
    
    // Test ROI Calculator
    if (hasCalculateButton) {
      console.log('\n6️⃣ Testing ROI Calculator...');
      
      // Enter revenue
      const revenueInput = page.locator('input[type="number"]').first();
      await revenueInput.clear();
      await revenueInput.type('100000');
      
      // Click calculate
      await page.locator('button:has-text("Calculate My Savings")').click();
      await page.waitForTimeout(1000);
      
      // Check for results
      const hasResults = await page.locator('text=Your Projected Savings').isVisible();
      console.log(`   ROI results displayed: ${hasResults ? '✅ Yes' : '❌ No'}`);
      
      // Take screenshot of ROI calculation
      await page.screenshot({ 
        path: `roi-calculator-demo-${timestamp}.png`, 
        fullPage: true 
      });
      console.log('   ROI calculator screenshot saved');
    }
    
    console.log('\n✅ Demo verification complete!');
    console.log(`📸 Screenshots saved with timestamp: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
  
  // Keep browser open for manual inspection
  console.log('\n👀 Browser will stay open for manual inspection...');
  await page.waitForTimeout(60000); // Keep open for 1 minute
  
  await browser.close();
}

verifyDemoFeatures();