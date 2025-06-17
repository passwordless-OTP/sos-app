const { chromium } = require('playwright');

async function checkDirectPreview() {
  console.log('🔍 Checking Direct Preview URL\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('📍 Going to Gadget preview URL directly...');
  await page.goto('https://sosv02--development.gadget.app', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  await page.waitForTimeout(5000);
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'direct-preview.png', fullPage: true });
  
  // Check console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    } else if (msg.text().includes('[SOS Dashboard]')) {
      console.log('📝 Dashboard log:', msg.text());
    }
  });
  
  // Check if our dashboard components are there
  const hasDashboard = await page.locator('text=SOS Dashboard').count() > 0;
  const hasAI = await page.locator('text=AI Store Assistant').count() > 0;
  
  console.log(`\n✅ Direct preview check:`);
  console.log(`   Dashboard visible: ${hasDashboard ? '✅' : '❌'}`);
  console.log(`   AI Assistant visible: ${hasAI ? '✅' : '❌'}`);
  
  // Get page content
  const content = await page.content();
  if (content.includes('error') || content.includes('Error')) {
    console.log('\n⚠️  Page may contain errors');
  }
  
  console.log('\n📋 Checking page source for our components...');
  const hasReactRoot = content.includes('root') || content.includes('__next');
  console.log(`   React app mounted: ${hasReactRoot ? '✅' : '❌'}`);
  
  await browser.close();
}

checkDirectPreview().catch(console.error);