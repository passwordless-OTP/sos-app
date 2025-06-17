const { chromium } = require('playwright');

async function verifyAI() {
  console.log('🤖 Verifying AI Assistant...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to Shopify app...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'domcontentloaded'
  });
  
  // Wait for app to load
  await page.waitForTimeout(8000);
  
  // Take screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `ai-assistant-check-${timestamp}.png`, fullPage: true });
  
  // Check for AI elements
  const content = await page.content();
  const checks = {
    'AI Store Assistant': content.includes('AI Store Assistant'),
    'Ask AI button': content.includes('Ask AI'),
    'Input field': await page.locator('input[placeholder*="sales"], textarea').count() > 0,
    'SOS Dashboard': content.includes('SOS Dashboard'),
  };
  
  console.log('\n📋 AI Assistant Check:');
  Object.entries(checks).forEach(([item, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${item}`);
  });
  
  console.log(`\n📸 Screenshot saved: ai-assistant-check-${timestamp}.png`);
  
  await browser.close();
}

verifyAI();