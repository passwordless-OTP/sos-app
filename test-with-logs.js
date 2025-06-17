const { chromium } = require('playwright');
const path = require('path');

async function testWithLogs() {
  console.log('🔍 Testing Dashboard with Log Monitoring\n');
  console.log('⚠️  Make sure you have "ggt dev --log-level debug --my-logs" running in another terminal!\n');
  
  const browser = await chromium.launchPersistentContext(
    path.join(__dirname, '.browser-profiles', 'shopify-persistent'),
    {
      headless: false,
      viewport: { width: 1440, height: 900 },
      storageState: path.join(__dirname, '.browser-profiles', 'shopify-state.json')
    }
  );
  
  const page = await browser.newPage();
  
  console.log('📍 Step 1: Navigating to SOS app...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  console.log('⏳ Step 2: Waiting for app to load (10 seconds)...');
  await page.waitForTimeout(10000);
  
  console.log('📸 Step 3: Taking screenshot...');
  await page.screenshot({ path: 'dashboard-with-logs.png', fullPage: true });
  
  console.log('🔍 Step 4: Checking if dashboard rendered...');
  const hasDashboard = await page.locator('text=SOS Dashboard').count() > 0;
  const hasAI = await page.locator('text=AI Store Assistant').count() > 0;
  const hasMetrics = await page.locator('text=$12,450').count() > 0;
  
  console.log(`   Dashboard title: ${hasDashboard ? '✅' : '❌'}`);
  console.log(`   AI Assistant: ${hasAI ? '✅' : '❌'}`);
  console.log(`   Metrics visible: ${hasMetrics ? '✅' : '❌'}`);
  
  if (hasAI) {
    console.log('\n🤖 Step 5: Testing AI Assistant...');
    
    // Try to find and click a suggested question
    const questionChip = page.locator('.Polaris-Tag').first();
    if (await questionChip.isVisible()) {
      console.log('   Clicking suggested question...');
      await questionChip.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Question clicked - check logs for "[SOS Dashboard] handleAskAI"');
    }
  }
  
  console.log('\n📋 Step 6: Getting page content...');
  const pageText = await page.locator('body').innerText().catch(() => 'Could not get text');
  console.log('   Page text preview:', pageText.substring(0, 200) + '...');
  
  console.log('\n✅ Test complete! Check the ggt dev logs for:');
  console.log('   - "[SOS Dashboard] Component mounting..."');
  console.log('   - "[SOS Dashboard] handleAskAI called..."');
  console.log('   - Any error messages');
  
  await browser.close();
}

testWithLogs().catch(console.error);