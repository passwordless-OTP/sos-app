const { chromium } = require('playwright');

async function quickCheck() {
  console.log('🔍 Quick AI Assistant Check\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate directly
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'domcontentloaded'
  });
  
  // Wait a bit
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'ai-check.png', fullPage: true });
  
  // Check content
  const content = await page.content();
  const hasAI = content.includes('AI') && (
    content.includes('Assistant') || 
    content.includes('Ask') ||
    content.includes('question')
  );
  
  console.log(`AI Assistant found: ${hasAI ? '✅ YES!' : '❌ No'}`);
  console.log('Screenshot saved: ai-check.png');
  
  await browser.close();
}

quickCheck();